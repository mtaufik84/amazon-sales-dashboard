import axios from 'axios'

// Salinan dari frontend/src/services/api.js (frontend lama) — logika dipertahankan.
// Satu-satunya adaptasi: fallback URL menunjuk salinan backend di :5001,
// bukan backend lama di :5000.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

const api = axios.create({
  baseURL: `${API_BASE_URL}/sales`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Axios instance for ML endpoints
const mlApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

mlApi.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('ML API Error:', error)
    return Promise.reject(error)
  }
)

export const salesAPI = {
  getAll: (params) => api.get('/table', { params }),
  getById: (id) => api.get(`/${id}`),
  getStats: (params) => api.get('/stats', { params }),
  getTrends: (params) => api.get('/trends', { params }),
  getCategories: (params) => api.get('/categories', { params }),
  getGeo: (params) => api.get('/geo', { params }),
  getBreakdown: (params) => api.get('/breakdown', { params }),
  getFilters: () => api.get('/filters'),
}

// Wrapper aliases for Sales API
export const getAllSales = (params) => salesAPI.getAll(params)
export const getSalesById = (id) => salesAPI.getById(id)
export const getSalesStats = (params) => salesAPI.getStats(params)
export const getSalesTrends = (params) => salesAPI.getTrends(params)
export const getSalesCategories = (params) => salesAPI.getCategories(params)
export const getSalesGeo = (params) => salesAPI.getGeo(params)
export const getSalesBreakdown = (params) => salesAPI.getBreakdown(params)
export const getFilterOptions = () => salesAPI.getFilters()

// Machine Learning & Recommendation Services
export const mlAPI = {
  getRecommendations: () => mlApi.get('/recommendations'),
  getStockPlan: () => mlApi.get('/recommendations/stock'),
  getCancelRisk: () => mlApi.get('/recommendations/cancel-risk'),
  predictCancel: (data) => mlApi.post('/recommendations/predict-cancel', data),
  getSegments: () => mlApi.get('/segments'),
  getSegmentsGeojson: () => mlApi.get('/segments/geojson'),
  getStateSegment: (state) => mlApi.get(`/segments/${encodeURIComponent(state)}`),
}

export const getMLRecommendations = () => mlAPI.getRecommendations()
export const getMLStockPlan = () => mlAPI.getStockPlan()
export const getMLCancelRisk = () => mlAPI.getCancelRisk()
export const predictMLCancel = (data) => mlAPI.predictCancel(data)
export const getMLSegments = () => mlAPI.getSegments()
export const getMLSegmentsGeojson = () => mlAPI.getSegmentsGeojson()
export const getMLStateSegment = (state) => mlAPI.getStateSegment(state)

// Formatters
export const formatCurrency = (number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(number || 0)

export const formatNumber = (number) =>
  new Intl.NumberFormat('en-IN').format(number || 0)

export const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default api
