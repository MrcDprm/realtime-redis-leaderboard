import axios from 'axios';
import { API_BASE_URL } from '../config';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexus_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function register({ username, email, password }) {
  const { data } = await api.post('/api/auth/register', { username, email, password });
  return data;
}

export async function login({ email, password }) {
  const { data } = await api.post('/api/auth/login', { email, password });
  return data;
}

export async function fetchGames() {
  const { data } = await api.get('/api/games');
  return data.games;
}

export async function submitScore({ gameId, score }) {
  const { data } = await api.post('/api/scores', { gameId, score });
  return data;
}

export async function fetchLeaderboard() {
  const { data } = await api.get('/api/leaderboard');
  return data.leaderboard;
}

export async function fetchMyRank() {
  const { data } = await api.get('/api/leaderboard/me');
  return data;
}

export function getErrorMessage(error) {
  return error?.response?.data?.error || error?.message || 'Something went wrong.';
}

export default api;
