import React, { useState } from 'react';
import './BrowseRooms.css';
import './shared.css';

const categories = ['All', 'General', 'Study', 'Debate', 'Feedback', 'Chill'];
const sampleRooms = [
  { id: 1, topic: 'Math Exam Prep', category: 'Study', users: 4, max: 10 },
  { id: 2, topic: 'Chill Vibes', category: 'Chill', users: 7, max: 10 },
  { id: 3, topic: 'Debate: AI Ethics', category: 'Debate', users: 5, max: 8 },
  { id: 4, topic: 'Feedback: App UI', category: 'Feedback', users: 2, max: 6 },
  { id: 5, topic: 'General Chat', category: 'General', users: 3, max: 10 },
  { id: 6, topic: 'DSA Revision', category: 'Study', users: 6, max: 10 },
];

function BrowseRooms() {
  const [activeCat, setActiveCat] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = sampleRooms
    .filter(r => activeCat === 'All' || r.category === activeCat)
    .filter(r => r.topic.toLowerCase().includes(search.toLowerCase()));

  return (
    <section className="page-section-wide">
      <h2 className="page-title">Browse Rooms</h2>
      <p className="page-subtitle">Find a conversation that interests you.</p>

      {/* Search bar */}
      <div className="browse-search-row">
        <div className="browse-search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input
            className="browse-search-input"
            type="text"
            placeholder="Search rooms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="browse-tabs">
        {categories.map(cat => (
          <button
            key={cat}
            className={`browse-tab${activeCat === cat ? ' active' : ''}`}
            onClick={() => setActiveCat(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <p>No rooms found. Try a different search or category.</p>
        </div>
      ) : (
        <div className="room-grid">
          {filtered.map(room => (
            <div className="room-card" key={room.id}>
              <div className="room-card-header">
                <span className="badge badge-live">
                  <span className="live-dot" />
                  Live
                </span>
                <span className="badge badge-count">{room.category}</span>
              </div>
              <h3 className="room-topic">{room.topic}</h3>
              <div className="room-card-footer">
                <span className="room-users">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  {room.users}/{room.max}
                </span>
                <a href={`/join/${room.id}`} className="room-join-link">
                  Join
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default BrowseRooms;
