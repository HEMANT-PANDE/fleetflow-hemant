import { useState, useEffect } from 'react'
import { Search, Filter, ArrowUpDown, Users, AlertTriangle, Plus, X } from 'lucide-react'
import { driverApi } from '../services/api'

function DriverProfiles() {
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '', license_number: '', license_expiry_date: '',
    performance_score: 100, safety_score: 100, completion_rate: 100,
    complaints: 0, status: 'on_duty', phone: '', email: ''
  })

  useEffect(() => { fetchDrivers() }, [])

  const fetchDrivers = async () => {
    try {
      setLoading(true)
      const data = await driverApi.getAll()
      setDrivers(data)
    } catch (error) {
      console.error('Failed to fetch drivers:', error)
      setDrivers([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await driverApi.create({
        ...formData,
        license_expiry: formData.license_expiry_date,
        trip_completion_rate: formData.completion_rate,
      })
      setShowForm(false)
      setFormData({ name: '', license_number: '', license_expiry_date: '', performance_score: 100, safety_score: 100, completion_rate: 100, complaints: 0, status: 'on_duty', phone: '', email: '' })
      fetchDrivers()
    } catch (error) {
      alert('Failed to create driver: ' + (error.response?.data?.detail || error.message))
    }
  }

  const filteredDrivers = drivers.filter(driver =>
    driver.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.license_number?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatExpiry = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`
  }

  const isLicenseExpired = (dateString) => {
    if (!dateString) return false
    return new Date(dateString) < new Date()
  }

  const isLicenseExpiringSoon = (dateString) => {
    if (!dateString) return false
    const expiry = new Date(dateString)
    const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    return expiry <= thirtyDays && expiry > new Date()
  }

  const getScoreClass = (score) => {
    if (score >= 85) return 'score-good'
    if (score >= 70) return 'score-warning'
    return 'score-danger'
  }

  const getStatusBadge = (status) => {
    const m = { 'on_duty': { class: 'status-idle', label: 'On Duty' }, 'break': { class: 'status-maintenance', label: 'Taking a Break' }, 'suspended': { class: 'status-retired', label: 'Suspended' }, 'off_duty': { class: 'status-active', label: 'Off Duty' } }
    return m[status] || { class: 'status-idle', label: status }
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="page-title">Driver Performance & Safety Profiles</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> {showForm ? 'Close' : 'Add Driver'}
        </button>
      </div>

      {showForm && (
        <div className="trip-form-container" style={{ marginBottom: '1rem' }}>
          <h3 className="trip-form-title">New Driver</h3>
          <form onSubmit={handleCreate}>
            <div className="trip-form-grid">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input type="text" name="name" className="form-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">License #</label>
                <input type="text" name="license_number" className="form-input" value={formData.license_number} onChange={e => setFormData({ ...formData, license_number: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">License Expiry</label>
                <input type="date" name="license_expiry_date" className="form-input" value={formData.license_expiry_date} onChange={e => setFormData({ ...formData, license_expiry_date: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input type="text" name="phone" className="form-input" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Save Driver</button>
          </form>
        </div>
      )}

      <div className="toolbar">
        <div className="search-container">
          <Search className="search-icon" size={18} />
          <input type="text" className="search-input" placeholder="Search drivers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="toolbar-actions">
          <button className="btn btn-secondary"><Filter size={16} /> Filter</button>
          <button className="btn btn-secondary"><ArrowUpDown size={16} /> Sort by...</button>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : filteredDrivers.length === 0 ? (
          <div className="empty-state">
            <Users size={48} />
            <p>No drivers found</p>
            <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setShowForm(true)}><Plus size={16} /> Add your first driver</button>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>License#</th>
                <th>Expiry</th>
                <th>Completion Rate</th>
                <th>Safety Score</th>
                <th>Complaints</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredDrivers.map((driver) => {
                const expiry = driver.license_expiry_date || driver.license_expiry
                return (
                <tr key={driver.id} className={isLicenseExpired(expiry) ? 'row-expired' : ''}>
                  <td style={{ fontWeight: 500 }}>
                    {driver.name}
                    {isLicenseExpired(expiry) && <AlertTriangle size={14} style={{ marginLeft: '0.5rem', color: 'var(--status-retired)' }} />}
                  </td>
                  <td>{driver.license_number}</td>
                  <td className={isLicenseExpired(expiry) ? 'text-danger' : isLicenseExpiringSoon(expiry) ? 'text-warning' : ''}>
                    {formatExpiry(expiry)}
                  </td>
                  <td>
                    <span className={`score-badge ${getScoreClass(driver.completion_rate || driver.trip_completion_rate)}`}>
                      {driver.completion_rate || driver.trip_completion_rate || 100}%
                    </span>
                  </td>
                  <td>
                    <span className={`score-badge ${getScoreClass(driver.safety_score || driver.performance_score)}`}>
                      {driver.safety_score || driver.performance_score || 100}%
                    </span>
                  </td>
                  <td><span className={driver.complaints > 5 ? 'text-danger' : ''}>{driver.complaints || 0}</span></td>
                  <td>
                    <span className={`status-badge ${getStatusBadge(driver.status).class}`}>{getStatusBadge(driver.status).label}</span>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        )}
      </div>

      <div className="driver-legend">
        <div className="legend-item"><span className="score-badge score-good">85%+</span> Excellent</div>
        <div className="legend-item"><span className="score-badge score-warning">70-84%</span> Needs Improvement</div>
        <div className="legend-item"><span className="score-badge score-danger">&lt;70%</span> Critical</div>
      </div>
    </div>
  )
}

export default DriverProfiles
