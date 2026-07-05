import axios from 'axios';

const api = axios.create({
  baseURL: 'https://salo-backend.onrender.com/api',
  withCredentials: true,
});


export const setToken = (token: string | null) => {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
};

export const signup = (data: any) => api.post('/auth/signup', data);
export const login = (data: any) => api.post('/auth/login', data);
export const fetchUser = () => api.get('/auth/profile');
export const fetchTasks = () => api.get('/tasks');
export const completeTask = (taskId: string) => api.post('/tasks/complete', { taskId });
export const fetchReferralSummary = () => api.get('/referrals');
export const requestWithdrawal = (data: any) => api.post('/withdrawals', data);
export const fetchWithdrawals = () => api.get('/withdrawals');
export const adminLogin = (data: any) => api.post('/admin/login', data);
export const fetchAdminDashboard = () => api.get('/admin/dashboard');
export const adminDecision = (id: string, decision: string) => api.post(`/withdrawals/${id}/decision`, { decision });
export const adminUserAction = (userId: string, actionType: string) => api.post(`/admin/user/${userId}/action`, { actionType, details: {} });
export const fetchOfferwallSandboxConfig = () => api.get('/offerwall/sandbox/config');
export const awardSandboxOfferwallReward = (data: any) => api.post('/offerwall/sandbox/reward', data);
export const logOfferwallSandboxCallback = (data: any) => api.post('/offerwall/sandbox/callback', data);
export const logout = () => {
  setToken(null);
  localStorage.removeItem('saloToken');
};
