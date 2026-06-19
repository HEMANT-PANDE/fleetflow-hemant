import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Truck } from 'lucide-react'
import { authApi } from '../services/api'

function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', username: '', password: '',
    confirmPassword: '', role: 'driver', licenseNumber: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!')
      return
    }
    setLoading(true)
    try {
      await authApi.register({
        username: formData.username,
        password: formData.password,
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        license_number: formData.licenseNumber
      })
      alert('Registration successful! Please login.')
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card auth-card-lg">
        <div className="auth-logo"><Truck size={48} /></div>
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join FleetFlow today</p>

        {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" name="fullName" className="form-input" placeholder="Enter full name" value={formData.fullName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" name="email" className="form-input" placeholder="Enter email" value={formData.email} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input type="tel" name="phone" className="form-input" placeholder="Enter phone number" value={formData.phone} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select name="role" className="form-select" value={formData.role} onChange={handleChange}>
                <option value="driver">Driver</option>
                <option value="dispatcher">Dispatcher</option>
                <option value="admin">Admin</option>
                <option value="manager">Fleet Manager</option>
              </select>
            </div>
          </div>

          {formData.role === 'driver' && (
            <div className="form-group">
              <label className="form-label">License Number</label>
              <input type="text" name="licenseNumber" className="form-input" placeholder="Enter license number" value={formData.licenseNumber} onChange={handleChange} />
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Username</label>
              <input type="text" name="username" className="form-input" placeholder="Choose username" value={formData.username} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" name="password" className="form-input" placeholder="Create password" value={formData.password} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input type="password" name="confirmPassword" className="form-input" placeholder="Confirm password" value={formData.confirmPassword} onChange={handleChange} required />
          </div>

          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
        </form>

        <p className="auth-footer">Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  )
}

export default Register
