import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './shared.css';

const categories = ['General', 'Study', 'Debate', 'Feedback', 'Chill'];

function CreateRoom() {
  const [roomName, setRoomName] = useState('');
  const [category, setCategory] = useState('General');
  const [maxUsers, setMaxUsers] = useState(10);
  const [isPrivate, setIsPrivate] = useState(false);
  const navigate = useNavigate();

  const handleCreate = (e) => {
    e.preventDefault();
    // TODO: call backend to create room
    // For now, generate a random room ID
    const roomId = Math.random().toString(36).substr(2, 9);
    // Store room data in localStorage
    localStorage.setItem(`room-${roomId}`, JSON.stringify({
      roomId,
      roomName,
      category,
      maxUsers,
      isPrivate,
      createdAt: new Date().toISOString(),
    }));
    navigate(`/room/${roomId}`);
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
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Max Participants</label>
            <select 
              className="form-select" 
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
              onClick={() => setIsPrivate(!isPrivate)}
            />
          </div>
        </div>

        <button type="submit" className="home-btn home-btn-solid" style={{ width: '100%', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
          Create Room
        </button>
      </form>
    </section>
  );
}

export default CreateRoom;
