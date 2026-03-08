import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import './shared.css';
import { getSessionSummary } from '../services/api';

function PostRoomSummary() {
  const { roomId } = useParams();
  const location = useLocation();

  // Prefer data passed via navigate state (immediate, no extra fetch)
  const stateData = location.state || {};
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(!stateData.room);

  useEffect(() => {
    if (stateData.room) {
      // Build summary from passed state
      setSummary({
        topic: stateData.room.topic,
        category: stateData.room.category,
        duration: stateData.duration || 1,
        participantCount: stateData.participantCount || 1,
        isActive: stateData.room.isActive,
      });
      return;
    }
    // Fallback: fetch from API
    getSessionSummary(roomId)
      .then(data => {
        setSummary({
          topic: data.topic,
          category: data.category,
          duration: data.duration,
          participantCount: data.participantCount,
          isActive: data.isActive,
        });
        setLoading(false);
      })
      .catch(() => {
        setSummary({ topic: 'Unknown', category: '-', duration: '-', participantCount: '-' });
        setLoading(false);
      });
  }, [roomId, stateData]);

  return (
    <section className="page-section">
      <h2 className="page-title">Session Summary</h2>
      <p className="page-subtitle">Here's a recap of your voice session.</p>

      {loading ? (
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Loading summary...</p>
      ) : (
        <>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="card stat-card">
              <div className="stat-value">{summary?.duration ?? '-'}</div>
              <div className="stat-label">Minutes</div>
            </div>
            <div className="card stat-card">
              <div className="stat-value">{summary?.participantCount ?? '-'}</div>
              <div className="stat-label">Participants</div>
            </div>
            <div className="card stat-card">
              <div className="stat-value">0</div>
              <div className="stat-label">Warnings</div>
            </div>
          </div>

          {/* Details */}
          <div className="card" style={{ marginBottom: '1.2rem' }}>
            <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: '0.8rem', fontSize: '1rem' }}>Session Details</h3>
            {summary?.topic && (
              <div className="info-row">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--speaking)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M16 3v4M8 3v4"/></svg>
                <span>Topic: <strong style={{ color: 'var(--text-primary)' }}>{summary.topic}</strong></span>
              </div>
            )}
            {summary?.category && (
              <div className="info-row">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--speaking)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 0 1 0 20"/><path d="M2 12h20"/></svg>
                <span>Category: <strong style={{ color: 'var(--text-primary)' }}>{summary.category}</strong></span>
              </div>
            )}
            <div className="info-row">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--speaking)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>Duration: {summary?.duration ?? '-'} {summary?.duration !== '-' ? 'minute(s)' : ''}</span>
            </div>
            <div className="info-row">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--speaking)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>Moderation: Active throughout session</span>
            </div>
            <div className="info-row">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
              <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>No audio was recorded or stored.</span>
            </div>
          </div>
        </>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/browse" className="home-btn home-btn-solid">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          Browse Rooms
        </Link>
        <Link to="/" className="home-btn home-btn-outline">
          Back to Home
        </Link>
      </div>
    </section>
  );
}

export default PostRoomSummary;
