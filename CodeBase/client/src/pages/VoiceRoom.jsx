import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './shared.css';
import { connectSocket } from '../services/socket';
import { AudioPipeline } from '../audio/AudioPipeline';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

function VoiceRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const alias = location.state?.alias || 'Anonymous';
  const roomData = location.state?.room || {};
  const maxUsers = roomData.maxUsers || 10;

  const [participants, setParticipants] = useState([]);
  const [muted, setMuted] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [speakingStates, setSpeakingStates] = useState({});
  const [selfSpeaking, setSelfSpeaking] = useState(false);
  const [micError, setMicError] = useState(null);
  const [warningCount, setWarningCount] = useState(0);
  const [warningToast, setWarningToast] = useState(null);

  // Vote-kick state
  const [voteKick, setVoteKick] = useState(null);
  const [voteKickTimer, setVoteKickTimer] = useState(30);
  const [hasVoted, setHasVoted] = useState(false);

  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const processedStreamRef = useRef(null);
  const audioPipelineRef = useRef(null);
  const peerConnectionsRef = useRef({});
  const analyserIntervalsRef = useRef({});
  const joinTimeRef = useRef(Date.now());
  const speakingTimeRef = useRef({});  // id → seconds of speaking time

  // --- Volume detection + speaking time tracking ---
  const setupVolumeDetection = (id, stream, setter) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      if (!speakingTimeRef.current[id]) speakingTimeRef.current[id] = 0;
      const intervalId = setInterval(() => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        if (avg > 10) speakingTimeRef.current[id] += 0.1; // 100ms interval = 0.1s
        setter(avg > 10);
      }, 100);
      analyserIntervalsRef.current[id] = { intervalId, audioCtx: ctx };
    } catch { /* AudioContext not available */ }
  };

  // --- Create RTCPeerConnection for a remote peer ---
  const createPeerConnection = useCallback((targetSocketId) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Use processed stream (through profanity gate) or raw stream as fallback
    const streamToSend = processedStreamRef.current || localStreamRef.current;
    if (streamToSend) {
      streamToSend.getTracks().forEach(track =>
        pc.addTrack(track, streamToSend)
      );
    }

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('ice-candidate', {
          candidate: event.candidate,
          targetSocketId,
        });
      }
    };

    pc.ontrack = (event) => {
      const remoteStream = event.streams[0];
      const audio = new Audio();
      audio.srcObject = remoteStream;
      audio.autoplay = true;
      audio.play().catch(() => {});
      setupVolumeDetection(
        targetSocketId,
        remoteStream,
        (speaking) => setSpeakingStates(prev => ({ ...prev, [targetSocketId]: speaking }))
      );
    };

    peerConnectionsRef.current[targetSocketId] = pc;
    return pc;
  }, []);

  // --- Cleanup a peer connection ---
  const cleanupPeer = (socketId) => {
    if (peerConnectionsRef.current[socketId]) {
      peerConnectionsRef.current[socketId].close();
      delete peerConnectionsRef.current[socketId];
    }
    const entry = analyserIntervalsRef.current[socketId];
    if (entry) {
      clearInterval(entry.intervalId);
      entry.audioCtx.close().catch(() => {});
      delete analyserIntervalsRef.current[socketId];
    }
    setSpeakingStates(prev => { const s = { ...prev }; delete s[socketId]; return s; });
  };

  // --- Vote-kick timer countdown ---
  useEffect(() => {
    if (!voteKick) return;
    const interval = setInterval(() => {
      setVoteKickTimer(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [voteKick]);

  // --- Main effect: mic + pipeline + socket + signaling ---
  useEffect(() => {
    let active = true;

    const init = async () => {
      // Request microphone
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        if (!active) { stream.getTracks().forEach(t => t.stop()); return; }
        localStreamRef.current = stream;
        setupVolumeDetection('self', stream, setSelfSpeaking);

        // Set up audio profanity pipeline if room has filter enabled
        const filterEnabled = roomData.profanityFilter !== false;
        if (filterEnabled) {
          const pipeline = new AudioPipeline({
            rawStream: stream,
            onProfanityDetected: () => {
              socketRef.current?.emit('profanity-warning', { roomId });
            },
            onPipelineReady: (processed) => {
              processedStreamRef.current = processed;
            },
            onError: () => {
              processedStreamRef.current = stream;
            },
          });
          audioPipelineRef.current = pipeline;
          await pipeline.init();
        } else {
          processedStreamRef.current = stream;
        }
      } catch {
        setMicError('Microphone access denied — you can still listen.');
      }

      // Connect socket and join room
      const socket = connectSocket();
      socketRef.current = socket;
      socket.emit('join-room', { roomId, alias });

      // Join denied (banned IP)
      socket.on('join-denied', ({ reason }) => {
        if (!active) return;
        navigate('/browse', { state: { error: reason } });
      });

      // Current room users
      socket.on('room-users', (users) => {
        if (!active) return;
        setParticipants(users);
      });

      // New user joined → initiate offer
      socket.on('user-joined', async ({ socketId, alias: newAlias }) => {
        if (!active) return;
        setParticipants(prev => [...prev, { socketId, alias: newAlias }]);
        const pc = createPeerConnection(socketId);
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('offer', { offer, targetSocketId: socketId });
        } catch { /* negotiation error */ }
      });

      // Received offer → answer it
      socket.on('offer', async ({ offer, fromSocketId }) => {
        if (!active) return;
        const pc = createPeerConnection(fromSocketId);
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('answer', { answer, targetSocketId: fromSocketId });
        } catch { /* negotiation error */ }
      });

      socket.on('answer', async ({ answer, fromSocketId }) => {
        const pc = peerConnectionsRef.current[fromSocketId];
        if (pc) {
          try { await pc.setRemoteDescription(new RTCSessionDescription(answer)); } catch { }
        }
      });

      socket.on('ice-candidate', async ({ candidate, fromSocketId }) => {
        const pc = peerConnectionsRef.current[fromSocketId];
        if (pc) {
          try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch { }
        }
      });

      socket.on('user-left', ({ socketId }) => {
        if (!active) return;
        setParticipants(prev => prev.filter(p => p.socketId !== socketId));
        cleanupPeer(socketId);
      });

      // Kicked (with reason)
      socket.on('kicked', ({ reason } = {}) => {
        navigate('/', { state: { kickReason: reason || 'You were removed from the room.' } });
      });

      // Profanity warning issued
      socket.on('warning-issued', ({ count, maxWarnings }) => {
        if (!active) return;
        setWarningCount(count);
        setWarningToast(`Profanity warning ${count}/${maxWarnings}. Watch your language!`);
        setTimeout(() => setWarningToast(null), 4000);
      });

      // Vote-kick events
      socket.on('vote-kick-active', (data) => {
        if (!active) return;
        setVoteKick(data);
        setVoteKickTimer(data.timeoutSeconds);
        setHasVoted(data.initiatorAlias === alias);
      });

      socket.on('vote-kick-update', ({ currentVotes, requiredVotes, totalVoters }) => {
        if (!active) return;
        setVoteKick(prev => prev ? { ...prev, currentVotes, requiredVotes, totalVoters } : null);
      });

      socket.on('vote-kick-ended', () => {
        if (!active) return;
        setVoteKick(null);
        setHasVoted(false);
      });

      socket.on('vote-kick-error', ({ message }) => {
        if (!active) return;
        setWarningToast(message);
        setTimeout(() => setWarningToast(null), 3000);
      });
    };

    init();

    return () => {
      active = false;
      audioPipelineRef.current?.destroy();
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
      Object.values(analyserIntervalsRef.current).forEach(entry => {
        clearInterval(entry.intervalId);
        entry.audioCtx.close().catch(() => {});
      });
      socketRef.current?.emit('leave-room', { roomId });
      socketRef.current?.off('join-denied');
      socketRef.current?.off('room-users');
      socketRef.current?.off('user-joined');
      socketRef.current?.off('offer');
      socketRef.current?.off('answer');
      socketRef.current?.off('ice-candidate');
      socketRef.current?.off('user-left');
      socketRef.current?.off('kicked');
      socketRef.current?.off('warning-issued');
      socketRef.current?.off('vote-kick-active');
      socketRef.current?.off('vote-kick-update');
      socketRef.current?.off('vote-kick-ended');
      socketRef.current?.off('vote-kick-error');
    };
  }, [roomId, alias, createPeerConnection, navigate]);

  const handleMuteToggle = () => {
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = muted; });
    setMuted(m => !m);
  };

  const handleLeave = () => {
    const durationMin = Math.max(1, Math.round((Date.now() - joinTimeRef.current) / 60000));
    socketRef.current?.emit('leave-room', { roomId });
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
    const transcripts = audioPipelineRef.current?.getTranscripts() || [];
    // Build speaking time map with aliases
    const speakingTimes = {};
    speakingTimes[alias] = Math.round(speakingTimeRef.current['self'] || 0);
    participants.forEach(p => {
      speakingTimes[p.alias] = Math.round(speakingTimeRef.current[p.socketId] || 0);
    });
    navigate(`/summary/${roomId}`, {
      state: { room: roomData, duration: durationMin, participantCount: participants.length + 1, transcripts, speakingTimes },
    });
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/join/${roomId}`;
    navigator.clipboard.writeText(link).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  const handleKick = (socketId) => {
    socketRef.current?.emit('kick-user', { roomId, targetSocketId: socketId });
    setParticipants(prev => prev.filter(p => p.socketId !== socketId));
    cleanupPeer(socketId);
  };

  const handleStartVoteKick = (targetSocketId) => {
    socketRef.current?.emit('vote-kick-start', { roomId, targetSocketId });
  };

  const handleCastVote = (vote) => {
    socketRef.current?.emit('vote-kick-cast', { roomId, vote });
    setHasVoted(true);
  };

  const self = { socketId: 'self', alias, isSelf: true };
  const allParticipants = [self, ...participants];

  return (
    <section className="page-section">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h2 className="page-title" style={{ marginBottom: '0.2rem' }}>
            {roomData.topic || 'Voice Room'}
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className="badge badge-live"><span className="live-dot" /> Live</span>
            <span className="badge badge-count">{roomData.category || 'General'}</span>
            {warningCount > 0 && (
              <span className="badge" style={{ background: 'rgba(248,113,113,0.15)', color: 'var(--warning)' }}>
                {warningCount}/3 warnings
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleCopyLink}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: linkCopied ? 'rgba(56,189,248,0.15)' : 'transparent', border: `1.5px solid ${linkCopied ? 'var(--speaking)' : 'var(--card-border)'}`, borderRadius: '8px', color: linkCopied ? 'var(--speaking)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, transition: 'all 0.2s ease' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {linkCopied
              ? <><polyline points="20 6 9 17 4 12"/></>
              : <><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>
            }
          </svg>
          {linkCopied ? 'Copied!' : 'Copy Link'}
        </button>
      </div>

      {/* Mic error */}
      {micError && (
        <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '8px', padding: '0.6rem 1rem', marginBottom: '1rem', color: 'var(--warning)', fontSize: '0.82rem' }}>
          {micError}
        </div>
      )}

      {/* Warning toast */}
      {warningToast && (
        <div style={{ background: 'rgba(248,113,113,0.1)', border: '1.5px solid var(--warning)', borderRadius: '8px', padding: '0.6rem 1rem', marginBottom: '1rem', color: 'var(--warning)', fontSize: '0.85rem', fontWeight: 600, animation: 'fadeIn 0.3s ease' }}>
          {warningToast}
        </div>
      )}

      {/* Vote-kick banner */}
      {voteKick && (
        <div className="card" style={{ marginBottom: '1.2rem', border: '1.5px solid var(--warning)', background: 'rgba(248,113,113,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
            <h4 style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem' }}>
              Vote Kick: {voteKick.targetAlias}
            </h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
              {voteKickTimer}s
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>
            {voteKick.initiatorAlias} wants to remove {voteKick.targetAlias}. {voteKick.currentVotes}/{voteKick.requiredVotes} votes needed.
          </p>
          {/* Progress bar */}
          <div style={{ background: 'var(--card-border)', borderRadius: '4px', height: '6px', marginBottom: '0.8rem', overflow: 'hidden' }}>
            <div style={{
              width: `${Math.min((voteKick.currentVotes / voteKick.requiredVotes) * 100, 100)}%`,
              background: 'var(--warning)', height: '100%', borderRadius: '4px', transition: 'width 0.3s ease'
            }} />
          </div>
          {!hasVoted ? (
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button onClick={() => handleCastVote('yes')}
                style={{ flex: 1, padding: '0.5rem', background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.3)', color: 'var(--warning)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.82rem' }}>
                Remove
              </button>
              <button onClick={() => handleCastVote('no')}
                style={{ flex: 1, padding: '0.5rem', background: 'var(--card-border)', border: '1px solid var(--card-border)', color: 'var(--text-secondary)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.82rem' }}>
                Keep
              </button>
            </div>
          ) : (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', textAlign: 'center', fontWeight: 600, margin: 0 }}>
              Vote cast. Waiting for others...
            </p>
          )}
        </div>
      )}

      {/* Participants grid */}
      <div className="card" style={{ marginBottom: '1.2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem', margin: 0 }}>
            Participants ({allParticipants.length}/{maxUsers})
          </h3>
          <button
            className="control-btn"
            onClick={() => setShowManage(s => !s)}
            title="Manage Participants"
            style={{ width: '40px', height: '40px' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1.5rem', padding: '0.5rem 0' }}>
          {allParticipants.map(p => {
            const isSpeaking = p.isSelf
              ? (selfSpeaking && !muted)
              : speakingStates[p.socketId];
            return (
              <div
                key={p.socketId}
                style={{ textAlign: 'center', padding: '1rem', border: `1.5px solid ${isSpeaking ? 'var(--speaking)' : 'var(--card-border)'}`, borderRadius: '10px', background: isSpeaking ? 'rgba(56,189,248,0.05)' : 'transparent', transition: 'all 0.2s ease' }}
              >
                <div className={`participant-avatar${isSpeaking ? ' speaking' : ''}`}>
                  {p.alias[0].toUpperCase()}
                </div>
                <div style={{ marginTop: '0.6rem', fontSize: '0.8rem', color: isSpeaking ? 'var(--speaking)' : 'var(--text-tertiary)', fontWeight: 600, marginBottom: '0.4rem' }}>
                  {p.alias}{p.isSelf ? ' (you)' : ''}
                </div>
                {showManage && !p.isSelf && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <button
                      onClick={() => handleKick(p.socketId)}
                      style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem', background: 'rgba(248,113,113,0.2)', border: '1px solid rgba(248,113,113,0.4)', color: '#F87171', borderRadius: '4px', cursor: 'pointer', width: '100%', fontWeight: 600 }}
                      onMouseEnter={(e) => { e.target.style.background = '#F87171'; e.target.style.color = '#fff'; }}
                      onMouseLeave={(e) => { e.target.style.background = 'rgba(248,113,113,0.2)'; e.target.style.color = '#F87171'; }}
                    >
                      Kick
                    </button>
                    <button
                      onClick={() => handleStartVoteKick(p.socketId)}
                      style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem', background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.3)', color: 'var(--speaking)', borderRadius: '4px', cursor: 'pointer', width: '100%', fontWeight: 600 }}
                    >
                      Vote Kick
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '0.5rem' }}>
        <button
          className={`control-btn${!muted ? ' active' : ''}`}
          onClick={handleMuteToggle}
          title={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .67-.1 1.32-.27 1.94"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
          )}
        </button>
        <button
          className="control-btn danger"
          onClick={handleLeave}
          title="Leave Room"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
    </section>
  );
}

export default VoiceRoom;
