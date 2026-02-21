import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Vehicle API
export const vehicleApi = {
  getAll: async () => {
    const response = await api.get('/vehicles')
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/vehicles/${id}`)
    return response.data
  },

  create: async (data) => {
    const response = await api.post('/vehicles', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await api.put(`/vehicles/${id}`, data)
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/vehicles/${id}`)
    return response.data
  }
}

// Trip API
export const tripApi = {
  getAll: async () => {
    const response = await api.get('/trips')
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/trips/${id}`)
    return response.data
  },

  create: async (data) => {
    const response = await api.post('/trips', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await api.put(`/trips/${id}`, data)
    return response.data
  },

  updateStatus: async (id, status) => {
    const response = await api.patch(`/trips/${id}/status`, { status })
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/trips/${id}`)
    return response.data
  }
}

// Maintenance API
export const maintenanceApi = {
  getAll: async () => {
    const response = await api.get('/maintenance')
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/maintenance/${id}`)
    return response.data
  },

  create: async (data) => {
    const response = await api.post('/maintenance', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await api.put(`/maintenance/${id}`, data)
    return response.data
  },

  complete: async (id, cost) => {
    const response = await api.patch(`/maintenance/${id}/complete`, { cost })
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/maintenance/${id}`)
    return response.data
  }
}

// Driver API
export const driverApi = {
  getAll: async () => {
    const response = await api.get('/drivers')
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/drivers/${id}`)
    return response.data
  },

  create: async (data) => {
    const response = await api.post('/drivers', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await api.put(`/drivers/${id}`, data)
    return response.data
  },

  updateStatus: async (id, status) => {
    const response = await api.patch(`/drivers/${id}/status`, { status })
    return response.data
  }
}

export default api
