import axios from 'axios';

// Point this to your FastAPI backend server
const API = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  }
});

// API Calls based on your provided Backend Documentation
export const fetchDashboardSummary = async () => {
  const response = await API.get('/dashboard-summary');
  return response.data;
};

export const fetchRecoveryProfiles = async () => {
  const response = await API.get('/recovery-profiles');
  return response.data;
};

export const fetchSingleProfile = async (customerId: string) => {
  const response = await API.get(`/recovery-profiles/${customerId}`);
  return response.data;
};

export const fetchAdRecommendations = async (customerId: string) => {
  const response = await API.get(`/ads/${customerId}`);
  return response.data;
};