import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './shared.css';

function JoinRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [alias, setAlias] = useState('');

  return (
    <section className="page-section">
      <h2 className="page-title">Join Room</h2>
      <p className="page-subtitle">You're about to enter an anonymous voice session.</p>

      <div className="card" style={{ marginBottom: '1.2rem' }}>
        <div className="info-row">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--speaking)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M16 3v4M8 3v4"/></svg>
          <span>Room ID: <strong style={{ color: 'var(--text-primary)' }}>{roomId}</strong></span>
        </div>
        <div className="info-row">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--speaking)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          <span>5 participants currently in room</span>
        </div>
        <div className="info-row">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--speaking)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span>Moderation is active</span>
        </div>
        <hr className="divider" />
        <div className="form-group">
          <label className="form-label">Your Alias (optional)</label>
          <input
            className="form-input"
            type="text"
            placeholder="Leave blank for random alias"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
          />
        </div>
      </div>

      <button
        className="home-btn home-btn-solid"
        style={{ width: '100%', justifyContent: 'center' }}
        onClick={() => navigate(`/room/${roomId}`)}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
        Join Voice Room
      </button>
    </section>
  );
}

export default JoinRoom;
