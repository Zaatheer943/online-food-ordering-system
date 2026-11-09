import axios from 'axios';

// All HTTP traffic goes through this single client -> Express REST API.
// The Vite dev server proxies /api to http://localhost:5000.
const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default api;

// ---------- Auth ----------
export const authApi = {
  register: (data) => api.post('/auth/register', data).then(r => r.data),
  login: (data) => api.post('/auth/login', data).then(r => r.data)
};

// ---------- Foods & categories ----------
export const foodApi = {
  list: (params) => api.get('/foods', { params }).then(r => r.data),
  get: (id) => api.get(`/foods/${id}`).then(r => r.data),
  create: (data) => api.post('/foods', data).then(r => r.data),
  update: (id, data) => api.put(`/foods/${id}`, data).then(r => r.data),
  remove: (id) => api.delete(`/foods/${id}`).then(r => r.data)
};

export const categoryApi = {
  list: () => api.get('/categories').then(r => r.data),
  create: (data) => api.post('/categories', data).then(r => r.data),
  update: (id, data) => api.put(`/categories/${id}`, data).then(r => r.data),
  remove: (id) => api.delete(`/categories/${id}`).then(r => r.data)
};

// ---------- Orders ----------
export const orderApi = {
  create: (data) => api.post('/orders', data).then(r => r.data),
  myOrders: () => api.get('/orders/my-orders').then(r => r.data),
  myOrder: (id) => api.get(`/orders/my-orders/${id}`).then(r => r.data),
  all: (status) => api.get('/orders', { params: status ? { status } : {} }).then(r => r.data),
  get: (id) => api.get(`/orders/${id}`).then(r => r.data),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }).then(r => r.data)
};

// ---------- Payments (Strategy pattern demo endpoint) ----------
export const paymentApi = {
  methods: () => api.get('/payments/methods').then(r => r.data),
  process: (data) => api.post('/payments/process', data).then(r => r.data)
};

// ---------- Profile & admin ----------
export const profileApi = {
  get: () => api.get('/profile').then(r => r.data),
  update: (data) => api.put('/profile', data).then(r => r.data)
};

export const adminApi = {
  stats: () => api.get('/admin/stats').then(r => r.data),
  customers: () => api.get('/admin/customers').then(r => r.data)
};
