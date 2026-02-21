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

export default api
