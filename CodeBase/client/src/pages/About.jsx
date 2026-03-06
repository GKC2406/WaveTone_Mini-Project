import React from 'react';
import './shared.css';

function About() {
  return (
    <section className="page-section">
      <h2 className="page-title">About WaveTone</h2>
      <p className="page-subtitle">Privacy-first, anonymous voice conversations.</p>

      <div className="card" style={{ marginBottom: '1.2rem' }}>
        <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: '0.6rem' }}>What is WaveTone?</h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.92rem' }}>
          WaveTone is an anonymous, real-time voice room platform designed for meaningful conversation.
          No accounts, no recordings, no tracking — just genuine voice interaction with session-based
          AI moderation to keep the tone respectful and productive.
        </p>
      </div>

      <div className="card" style={{ marginBottom: '1.2rem' }}>
        <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: '0.8rem' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--speaking)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: '0.5rem' }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Room Rules
        </h3>
        <ul style={{ color: 'var(--text-secondary)', lineHeight: 2, paddingLeft: '1.2rem', fontSize: '0.92rem' }}>
          <li>Be respectful — no hate speech, harassment, or personal attacks.</li>
          <li>Keep conversations on-topic for the room category.</li>
          <li>Audio is never stored or recorded.</li>
          <li>Moderators can mute or remove disruptive participants.</li>
          <li>Sessions are temporary — all data is cleared when the room closes.</li>
          <li>No personal information sharing is encouraged.</li>
        </ul>
      </div>

      <div className="card" style={{ marginBottom: '1.2rem' }}>
        <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--speaking)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
          How It Works
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          {[
            { step: '01', title: 'Create or Browse', desc: 'Start a new room or find one to join.', icon: '🚪' },
            { step: '02', title: 'Get an Alias', desc: 'You\'re assigned a random anonymous name.', icon: '🎭' },
            { step: '03', title: 'Start Talking', desc: 'Connect via real-time WebRTC audio.', icon: '🎤' },
            { step: '04', title: 'Session Ends', desc: 'When you leave, everything disappears.', icon: '✨' },
          ].map((item, idx) => (
            <div key={item.step} className="about-step-item" style={{ padding: '1.5rem', borderRadius: '12px', transition: 'all 0.3s ease' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>{item.icon}</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--speaking)', marginBottom: '0.6rem', opacity: 0.5 }}>{item.step}</div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem', marginBottom: '0.4rem' }}>{item.title}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>{item.desc}</div>
              {idx < 3 && <div style={{ marginTop: '1rem', fontSize: '1.5rem', color: 'var(--speaking)', opacity: 0.3 }}>↓</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default About;
