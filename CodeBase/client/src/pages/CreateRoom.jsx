import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './shared.css';
import { createRoom } from '../services/api';

const categories = ['General', 'Study', 'Debate', 'Feedback', 'Chill', 'Custom'];

function CreateRoom() {
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState('General');
  const [customCategory, setCustomCategory] = useState('');
  const [maxUsers, setMaxUsers] = useState(10);
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  useEffect(() => { document.title = 'Create Room - WaveTone'; }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const finalCategory = category === 'Custom' ? customCategory.trim() : category;
    if (!finalCategory) { setError('Please enter a custom category.'); setLoading(false); return; }
    try {
      const room = await createRoom({ topic, category: finalCategory, maxUsers, isPrivate });
      navigate(`/room/${room._id}`, { state: { alias: 'Host', room } });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <section className="page-section">
      <h2 className="page-title">Create a Room</h2>
      <p className="page-subtitle">Set up your anonymous voice room in seconds.</p>

      <form onSubmit={handleCreate}>
        <div className="card" style={{ marginBottom: '1.2rem' }}>
          <div className="form-group">
            <label className="form-label">Room Topic</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. Math Exam Prep, Chill Vibes..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select" aria-label="Category" value={category} onChange={(e) => { setCategory(e.target.value); setError(null); }}>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {category === 'Custom' && (
            <div className="form-group">
              <label className="form-label">Custom Category</label>
              <input
                className="form-input"
                type="text"
                placeholder="e.g. Music, Tech, Philosophy..."
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value.slice(0, 20))}
                maxLength={20}
                required
              />
              <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>
                {customCategory.length}/20 characters
              </span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Max Participants</label>
            <select
              className="form-select"
              aria-label="Max Participants"
              value={maxUsers}
              onChange={(e) => setMaxUsers(Number(e.target.value))}
            >
              {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <option key={num} value={num}>{num} Participants</option>
              ))}
            </select>
          </div>

          <div className="toggle-row">
            <div>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.92rem' }}>Private Room</span>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', margin: 0 }}>Only people with the link can join</p>
            </div>
            <button
              type="button"
              className={`toggle-switch${isPrivate ? ' active' : ''}`}
              aria-label={isPrivate ? 'Set room to public' : 'Set room to private'}
              onClick={() => setIsPrivate(!isPrivate)}
            />
          </div>

          {error && (
            <p style={{ color: 'var(--warning)', fontSize: '0.85rem', marginTop: '0.8rem' }}>
              {error}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="home-btn home-btn-solid"
          style={{ width: '100%', justifyContent: 'center' }}
          disabled={loading}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
          {loading ? 'Creating...' : 'Create Room'}
        </button>
      </form>
    </section>
  );
}

export default CreateRoom;
