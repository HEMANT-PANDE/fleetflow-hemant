import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Truck } from 'lucide-react'
import { authApi } from '../services/api'

function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ username: '', password: '', role: 'driver' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await authApi.login({ username: formData.username, password: formData.password })
      localStorage.setItem('user', JSON.stringify({ ...res, role: formData.role }))
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo"><Truck size={48} /></div>
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Sign in to FleetFlow</p>

        {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select name="role" className="form-select" value={formData.role} onChange={handleChange}>
              <option value="driver">Driver</option>
              <option value="dispatcher">Dispatcher</option>
              <option value="admin">Admin</option>
              <option value="manager">Fleet Manager</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input type="text" name="username" className="form-input" placeholder="Enter username" value={formData.username} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" name="password" className="form-input" placeholder="Enter password" value={formData.password} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
        </form>

        <p className="auth-footer">Don't have an account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  )
}

export default Login
