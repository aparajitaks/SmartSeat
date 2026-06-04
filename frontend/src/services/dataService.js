import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const restaurantService = {
  getAll: (params) => api.get('/restaurants', { params }),
  getById: (id) => api.get(`/restaurants/${id}`),
  getMyRestaurants: () => api.get('/restaurants/owner/me'),
  create: (data) => api.post('/restaurants', data),
  update: (id, data) => api.put(`/restaurants/${id}`, data),
  delete: (id) => api.delete(`/restaurants/${id}`),
};

export const branchService = {
  getByRestaurant: (restaurantId) => api.get(`/branches/restaurant/${restaurantId}`),
  getById: (id) => api.get(`/branches/${id}`),
  create: (data) => api.post('/branches', data),
  update: (id, data) => api.put(`/branches/${id}`, data),
};

export const tableService = {
  getByBranch: (branchId) => api.get(`/tables/branch/${branchId}`),
  getAvailable: (params) => api.get('/tables/available', { params }),
  create: (data) => api.post('/tables', data),
  update: (id, data) => api.put(`/tables/${id}`, data),
};

export const reservationService = {
  create: (data) => api.post('/reservations', data),
  getMyReservations: (params) => api.get('/reservations', { params }),
  getById: (id) => api.get(`/reservations/${id}`),
  cancel: (id, reason) => api.put(`/reservations/${id}/cancel`, { reason }),
  checkIn: (id) => api.put(`/reservations/${id}/check-in`),
  complete: (id) => api.put(`/reservations/${id}/complete`),
  getBranchReservations: (branchId, params) =>
    api.get(`/reservations/branch/${branchId}`, { params }),
};

export const waitlistService = {
  getMyWaitlist: () => api.get('/waitlist'),
  cancel: (id) => api.delete(`/waitlist/${id}`),
  getBranchWaitlist: (branchId, params) =>
    api.get(`/waitlist/branch/${branchId}`, { params }),
};

export const analyticsService = {
  getDashboard: (params) => api.get('/analytics/dashboard', { params }),
};

export const reviewService = {
  create: (data) => api.post('/reviews', data),
  getByRestaurant: (restaurantId, params) =>
    api.get(`/reviews/restaurant/${restaurantId}`, { params }),
};
