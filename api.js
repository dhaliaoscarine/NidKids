// api.js
import axios from 'axios';

const LIVE_API_URL = 'https://nidkids-backend.onrender.com/api';
const LOCAL_IP = '192.168.1.118';
const LOCAL_API_URL = `http://${LOCAL_IP}:5000/api`;

const api = axios.create({
  baseURL: LIVE_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (!config || config.__retry) {
      return Promise.reject(error);
    }

    const fallbackUrls = [LIVE_API_URL, LOCAL_API_URL];
    const currentIndex = fallbackUrls.indexOf(config.baseURL || LIVE_API_URL);
    const nextUrl = fallbackUrls[currentIndex + 1];

    if (nextUrl) {
      config.baseURL = nextUrl;
      config.__retry = true;
      return axios({
        ...config,
        baseURL: nextUrl,
      });
    }

    return Promise.reject(error);
  }
);

// AUTH
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);

// CHILDREN
export const addChild = (data, token) =>
  api.post('/children', data, { headers: { Authorization: `Bearer ${token}` } });
export const getChildren = (token) =>
  api.get('/children', { headers: { Authorization: `Bearer ${token}` } });

// PROFILE
export const getMyProfile = (token) =>
  api.get('/profile/me', { headers: { Authorization: `Bearer ${token}` } });
export const updateProfile = (data, token) =>
  api.patch('/profile', data, { headers: { Authorization: `Bearer ${token}` } });

// TELEMEDICINE
export const getSpecialists = (token) =>
  api.get('/telemedicine/specialists', { headers: { Authorization: `Bearer ${token}` } });
export const publishSlot = (data, token) =>
  api.post('/telemedicine/slots', data, { headers: { Authorization: `Bearer ${token}` } });
export const getSpecialistSlots = (specialistId, token) =>
  api.get(`/telemedicine/slots/${specialistId}`, { headers: { Authorization: `Bearer ${token}` } });
export const getMySlots = (token) =>
  api.get('/telemedicine/my-slots', { headers: { Authorization: `Bearer ${token}` } });
export const deleteSlot = (slotId, token) =>
  api.delete(`/telemedicine/slots/${slotId}`, { headers: { Authorization: `Bearer ${token}` } });
export const bookAppointment = (data, token) =>
  api.post('/telemedicine/appointments', data, { headers: { Authorization: `Bearer ${token}` } });
export const getMyAppointments = (token) =>
  api.get('/telemedicine/my-appointments', { headers: { Authorization: `Bearer ${token}` } });
export const cancelAppointment = (appointmentId, token) =>
  api.patch(`/telemedicine/appointments/${appointmentId}/cancel`, {}, { headers: { Authorization: `Bearer ${token}` } });

// GAMES
export const getGamesByCategory = (category, token) =>
  api.get(`/games/category/${category}`, { headers: { Authorization: `Bearer ${token}` } });
export const logGameSession = (data, token) =>
  api.post('/games/session', data, { headers: { Authorization: `Bearer ${token}` } });
// THERAPY
export const getExercisesByCategory = (category, token) =>
  api.get(`/therapy/category/${category}`, { headers: { Authorization: `Bearer ${token}` } });
export const completeExercise = (data, token) =>
  api.post('/therapy/complete', data, { headers: { Authorization: `Bearer ${token}` } });
// COMMUNITY
export const getPosts = (token) =>
  api.get('/community/posts', { headers: { Authorization: `Bearer ${token}` } });
export const createPost = (data, token) =>
  api.post('/community/posts', data, { headers: { Authorization: `Bearer ${token}` } });
export const likePost = (postId, token) =>
  api.patch(`/community/posts/${postId}/like`, {}, { headers: { Authorization: `Bearer ${token}` } });
export const getResources = (token) =>
  api.get('/community/resources', { headers: { Authorization: `Bearer ${token}` } });

export default api;
