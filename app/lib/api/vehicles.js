// lib/api/vehicles.js - Vehicle API endpoints

import apiClient from './client';

export const vehicleAPI = {
  /**
   * Get all vehicles with optional filters
   */
  getAll: async (filters = {}) => {
    return apiClient.get('/vehicles', { params: filters });
  },

  /**
   * Get vehicle by ID
   */
  getById: async (id) => {
    if (!id) throw new Error('Vehicle ID is required');
    return apiClient.get(`/vehicles/${id}`);
  },

  /**
   * Create new vehicle
   */
  create: async (data) => {
    if (!data) throw new Error('Vehicle data is required');
    return apiClient.post('/vehicles', data);
  },

  /**
   * Update vehicle
   */
  update: async (id, data) => {
    if (!id) throw new Error('Vehicle ID is required');
    if (!data) throw new Error('Vehicle data is required');
    return apiClient.put(`/vehicles/${id}`, data);
  },

  /**
   * Partially update vehicle
   */
  patch: async (id, data) => {
    if (!id) throw new Error('Vehicle ID is required');
    if (!data) throw new Error('Vehicle data is required');
    return apiClient.patch(`/vehicles/${id}`, data);
  },

  /**
   * Delete vehicle
   */
  delete: async (id) => {
    if (!id) throw new Error('Vehicle ID is required');
    return apiClient.delete(`/vehicles/${id}`);
  },

  /**
   * Get vehicle statistics
   */
  getStats: async (filters = {}) => {
    return apiClient.get('/vehicles/stats', { params: filters });
  },

  /**
   * Export vehicles (CSV/Excel)
   */
  export: async (format = 'csv', filters = {}) => {
    return apiClient.get('/vehicles/export', {
      params: { format, ...filters },
    });
  },
};

export default vehicleAPI;
