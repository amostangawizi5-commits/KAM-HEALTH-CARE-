import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const patientService = {
  getAll: () => api.get('/patients'),
  create: (data) => api.post('/patients', data),
};

export const adminService = {
  getOverview: () => api.get('/admin/overview'),
  getUsers: () => api.get('/auth/users'),
  updateUser: (id, data) => api.put(`/auth/users/${id}`, data),
  deleteUser: (id) => api.delete(`/auth/users/${id}`),
};

export const visitService = {
  getActive: () => api.get('/visits', { params: { active: true } }),
  create: (data) => api.post('/visits', data),
  sendToConsultant: (visitId) => api.put(`/visits/${visitId}/send-to-consultant`),
};

export const consultantService = {
  getQueue: () => api.get('/consultant/queue'),
  startConsultation: (visitId) => api.patch(`/consultant/queue/${visitId}/start`),
  sendToDoctor: (data) => api.post('/consultant/assessment', data),
};

export const doctorService = {
  getQueue: () => api.get('/doctor/queue'),
  startConsultation: (visitId) => api.patch(`/doctor/queue/${visitId}/start`),
  saveConsultation: (data) => api.post('/doctor/consultation', data),
};

export default api;
