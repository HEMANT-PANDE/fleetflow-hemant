import axios from 'axios'

const API_BASE_URL = '/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Vehicle API (Registry)
export const vehicleApi = {
  getAll: async () => {
    const response = await api.get('/registry/vehicles/')
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/registry/vehicles/${id}`)
    return response.data
  },

  create: async (data) => {
    const response = await api.post('/registry/vehicles/', data)
    return response.data
  },

  update: async (id, data) => {
    // Currently relying on replace or distinct update methods on backend
    // Assuming a standard PUT or out-of-service patch based on schema
    const response = await api.patch(`/registry/vehicles/${id}/out-of-service`)
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/registry/vehicles/${id}`)
    return response.data
  }
}

// Dispatch API (Trips)
export const dispatchApi = {
  getAllTrips: async () => {
    const response = await api.get('/dispatch/trips/')
    return response.data
  },

  createTrip: async (data) => {
    const response = await api.post('/dispatch/trips/', data)
    return response.data
  },
  
  updateTripStatus: async (id, status) => {
    const response = await api.put(`/dispatch/trips/${id}/status`, { status })
    return response.data
  }
}

// Driver API
export const driverApi = {
  getAll: async () => {
    const response = await api.get('/drivers/')
    return response.data
  },
  
  create: async (data) => {
    const response = await api.post('/drivers/', data)
    return response.data
  }
}

// Maintenance API
export const maintenanceApi = {
  getAll: async () => {
    const response = await api.get('/maintenance/logs/')
    return response.data
  },
  
  create: async (data) => {
    const response = await api.post('/maintenance/logs/', data)
    return response.data
  }
}

// Finance API
export const financeApi = {
  getExpenses: async () => {
    const response = await api.get('/finance/expenses/')
    return response.data
  },
  
  createExpense: async (data) => {
    const response = await api.post('/finance/expenses/', data)
    return response.data
  },
  
  getFuelLogs: async () => {
    const response = await api.get('/finance/fuel-logs/')
    return response.data
  },
  
  createFuelLog: async (data) => {
    const response = await api.post('/finance/fuel-logs/', data)
    return response.data
  }
}

// Dashboard / Analytics API
export const analyticsApi = {
  getDashboardStats: async () => {
    const response = await api.get('/dashboard/stats')
    return response.data
  }
}

export default api
