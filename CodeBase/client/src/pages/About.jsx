import React, { useEffect } from 'react';
import './shared.css';

function About() {
  useEffect(() => { document.title = 'About - WaveTone'; }, []);
  return (
    <section className="page-section">
      <h2 className="page-title">About WaveTone</h2>
      <p className="page-subtitle">Privacy-first, anonymous voice conversations.</p>

      <div className="card card--spaced">
        <h3 className="about-card-title">What is WaveTone?</h3>
        <p className="about-card-text">
          WaveTone is an anonymous, real-time voice room platform designed for meaningful conversation.
          No accounts, no recordings, no tracking — just genuine voice interaction with session-based
          AI moderation to keep the tone respectful and productive.
        </p>
      </div>

      <div className="card card--spaced">
        <h3 className="about-card-title about-card-title--with-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--speaking)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Room Rules
        </h3>
        <ul className="about-rules-list">
          <li>Be respectful — no hate speech, harassment, or personal attacks.</li>
          <li>Keep conversations on-topic for the room category.</li>
          <li>Audio is never stored or recorded.</li>
          <li>Moderators can mute or remove disruptive participants.</li>
          <li>Sessions are temporary — all data is cleared when the room closes.</li>
          <li>No personal information sharing is encouraged.</li>
        </ul>
      </div>

      <div className="card card--spaced">
        <h3 className="about-card-title about-card-title--with-icon about-card-title--spaced">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--speaking)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
          How It Works
        </h3>
        <div className="about-steps-grid">
          {[
            { step: '01', title: 'Create or Browse', desc: 'Start a new room or find one to join.', icon: '🚪' },
            { step: '02', title: 'Get an Alias', desc: "You're assigned a random anonymous name.", icon: '🎭' },
            { step: '03', title: 'Start Talking', desc: 'Connect via real-time WebRTC audio.', icon: '🎤' },
            { step: '04', title: 'Session Ends', desc: 'When you leave, everything disappears.', icon: '✨' },
          ].map((item, idx, arr) => (
            <div key={item.step} className="about-step-item" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', minHeight: '260px' }}>
              <div className="about-step-icon">{item.icon}</div>
              <div className="about-step-number">{item.step}</div>
              <div className="about-step-title">{item.title}</div>
              <div className="about-step-desc">{item.desc}</div>
              <div className="about-step-arrow">
                {idx < arr.length - 1
                  ? <span>↓</span>
                  : (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="40" height="40" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
                        <path d="M8 18h20" stroke="var(--speaking)" strokeWidth="5" strokeLinecap="round" opacity="0.3"/>
                        <path d="M22 12l6 6-6 6" stroke="var(--speaking)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" opacity="0.3"/>
                      </svg>
                    </span>
                  )
                }
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default About;
