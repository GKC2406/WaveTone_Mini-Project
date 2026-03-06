import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './shared.css';

const aliasOptions = ['Echo', 'Wave', 'Drift', 'Haze', 'Pulse', 'Nova', 'Storm', 'Blaze', 'Frost', 'Sonic'];

const generateMockParticipants = (count) => {
  const participants = [];
  const participantCount = Math.min(count, aliasOptions.length);
  for (let i = 0; i < participantCount; i++) {
    participants.push({
      id: i + 1,
      alias: aliasOptions[i],
      speaking: Math.random() > 0.6,
    });
  }
  return participants;
};

function VoiceRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [muted, setMuted] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [removedParticipants, setRemovedParticipants] = useState(new Set());
  
  // Get room data from localStorage
  const roomData = JSON.parse(localStorage.getItem(`room-${roomId}`)) || {};
  const maxUsers = roomData.maxUsers || 5;
  let mockParticipants = generateMockParticipants(Math.max(2, Math.min(maxUsers, 10)));
  
  // Filter out removed participants
  mockParticipants = mockParticipants.filter(p => !removedParticipants.has(p.id));

  const handleKickParticipant = (id) => {
    setRemovedParticipants(new Set([...removedParticipants, id]));
  };

  return (
    <section className="page-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h2 className="page-title" style={{ marginBottom: '0.2rem' }}>Voice Room</h2>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className="badge badge-live"><span className="live-dot" /> Live</span>
            <span className="badge badge-count">Room {roomId}</span>
          </div>
        </div>
      </div>

      {/* Participants */}
      <div className="card" style={{ marginBottom: '1.2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem', margin: 0 }}>
            Participants ({mockParticipants.length}/{maxUsers})
          </h3>
          <button
            className="control-btn"
            onClick={() => setShowParticipants(!showParticipants)}
            title="Manage Participants"
            style={{ width: '40px', height: '40px' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </button>
        </div>
        
        {/* Participants List */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: `repeat(auto-fit, minmax(100px, 1fr))`,
          gap: '1.5rem', 
          justifyContent: 'center', 
          padding: '0.5rem 0' 
        }}>
          {mockParticipants.map(p => (
            <div 
              key={p.id} 
              style={{ 
                textAlign: 'center',
                padding: '1rem',
                border: '1.5px solid var(--card-border)',
                borderRadius: '10px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--speaking)';
                e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--card-border)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div className={`participant-avatar${p.speaking ? ' speaking' : ''}`}>
                {p.alias[0]}
              </div>
              <div style={{ marginTop: '0.6rem', fontSize: '0.8rem', color: p.speaking ? 'var(--speaking)' : 'var(--text-tertiary)', fontWeight: 600, marginBottom: '0.5rem' }}>
                {p.alias}
              </div>
              {showParticipants && (
                <button
                  onClick={() => handleKickParticipant(p.id)}
                  style={{
                    fontSize: '0.7rem',
                    padding: '0.3rem 0.6rem',
                    background: 'rgba(248, 113, 113, 0.2)',
                    border: '1px solid rgba(248, 113, 113, 0.4)',
                    color: '#F87171',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontWeight: 600,
                    width: '100%'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#F87171';
                    e.target.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(248, 113, 113, 0.2)';
                    e.target.style.color = '#F87171';
                  }}
                >
                  Kick
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '0.5rem' }}>
        <button
          className={`control-btn${muted ? '' : ' active'}`}
          onClick={() => setMuted(!muted)}
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
          onClick={() => navigate(`/summary/${roomId}`)}
          title="Leave Room"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
    </section>
  );
}

export default VoiceRoom;
