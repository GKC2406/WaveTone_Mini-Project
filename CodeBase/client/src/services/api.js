// In dev, Vite proxy handles /api → localhost:5000
// In production, set VITE_API_URL to your Railway backend URL
const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const getRooms = () => request('/rooms');

export const getRoomById = (id) => request(`/rooms/${id}`);

export const createRoom = (data) =>
  request('/rooms', { method: 'POST', body: JSON.stringify(data) });

export const joinRoom = (id, data) =>
  request(`/rooms/${id}/join`, { method: 'POST', body: JSON.stringify(data) });

export const leaveRoom = (id, data) =>
  request(`/rooms/${id}/leave`, { method: 'POST', body: JSON.stringify(data) });

export const getSessionSummary = (id) => request(`/sessions/${id}/summary`);
