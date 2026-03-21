import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import './Home.css';
import MainLogo from '../assets/main-logo.png';

function Home() {
  useEffect(() => { document.title = 'WaveTone'; }, []);
    useEffect(() => {
      document.title = 'WaveTone - Home';
      document.body.setAttribute('data-route', 'home');
      return () => {
        document.body.removeAttribute('data-route');
      };
    }, []);
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="home-hero">
        <div className="hero-glow" />
        <div className="home-hero-content slide-up">
          <img src={MainLogo} alt="WaveTone Logo" className="home-logo" />
          <h1 className="home-title">WaveTone</h1>
          <p className="home-tagline">Connect anonymously. Speak freely. Listen respectfully.</p>
          <p className="home-subtext">Anonymous voice rooms with real-time moderation.</p>
          <div className="home-actions">
            <NavLink to="/create" className="home-btn home-btn-solid">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
              Create Room
            </NavLink>
            <NavLink to="/browse" className="home-btn home-btn-outline">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              Browse Rooms
            </NavLink>
          </div>
        </div>
        <div className="home-wave-bg">
          <div className="voice-wave">
            {[...Array(24)].map((_, i) => (
              <span key={i} className={`voice-bar bar-${i % 16}`} />
            ))}
          </div>
        </div>
      </section>

      <div className="home-divider" />

      {/* Features Section */}
      <section className="home-features">
        <div className="features-grid">
          <div className="feature-card fade-in">
            <div className="feature-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--speaking)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
            </div>
            <h2>Real-time Voice</h2>
            <p>Crystal-clear peer-to-peer audio powered by WebRTC.</p>
          </div>
          <div className="feature-card fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="feature-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--speaking)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h2>100% Anonymous</h2>
            <p>No accounts, no tracking. Join with a random alias and leave without a trace.</p>
          </div>
          <div className="feature-card fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="feature-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--speaking)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h2>Smart Moderation</h2>
            <p>AI-powered tone analysis keeps conversations respectful and productive.</p>
          </div>
          <div className="feature-card fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="feature-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--speaking)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <h2>Session-based</h2>
            <p>Rooms are temporary. When you leave, the session ends.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
