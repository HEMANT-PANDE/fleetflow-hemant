import { useState, useEffect } from 'react'
import { Search, Filter, ArrowUpDown, Users, AlertTriangle } from 'lucide-react'
import { driverApi } from '../services/api'

function DriverProfiles() {
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchDrivers()
  }, [])

  const fetchDrivers = async () => {
    try {
      setLoading(true)
      const data = await driverApi.getAll()
      setDrivers(data)
    } catch (error) {
      console.error('Failed to fetch drivers:', error)
      // Use sample data if API fails
      setDrivers([
        { id: 1, name: 'John Kumar', license_number: '23223', license_expiry: '2026-03-22', completion_rate: 92, safety_score: 89, complaints: 4, status: 'on_duty' },
        { id: 2, name: 'Amit Singh', license_number: '23224', license_expiry: '2026-05-15', completion_rate: 88, safety_score: 94, complaints: 2, status: 'on_duty' },
        { id: 3, name: 'Rajesh Patel', license_number: '23225', license_expiry: '2025-12-10', completion_rate: 95, safety_score: 91, complaints: 1, status: 'break' },
        { id: 4, name: 'Vijay Sharma', license_number: '23226', license_expiry: '2026-08-20', completion_rate: 78, safety_score: 72, complaints: 8, status: 'suspended' },
        { id: 5, name: 'Suresh Verma', license_number: '23227', license_expiry: '2026-01-05', completion_rate: 90, safety_score: 85, complaints: 3, status: 'on_duty' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const filteredDrivers = drivers.filter(driver =>
    driver.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.license_number?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatExpiry = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    return `${day}/${month}`
  }

  const isLicenseExpired = (dateString) => {
    if (!dateString) return false
    const expiryDate = new Date(dateString)
    const today = new Date()
    return expiryDate < today
  }

  const isLicenseExpiringSoon = (dateString) => {
    if (!dateString) return false
    const expiryDate = new Date(dateString)
    const today = new Date()
    const thirtyDays = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
    return expiryDate <= thirtyDays && expiryDate > today
  }

  const getScoreClass = (score) => {
    if (score >= 85) return 'score-good'
    if (score >= 70) return 'score-warning'
    return 'score-danger'
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      'on_duty': { class: 'status-idle', label: 'On Duty' },
      'break': { class: 'status-maintenance', label: 'Taking a Break' },
      'suspended': { class: 'status-retired', label: 'Suspended' },
      'off_duty': { class: 'status-active', label: 'Off Duty' }
    }
    return statusMap[status] || { class: 'status-idle', label: status }
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Driver Performance & Safety Profiles</h2>
      </div>

      <div className="toolbar">
        <div className="search-container">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Search drivers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="toolbar-actions">
          <button className="btn btn-secondary">
            <Filter size={16} />
            Filter
          </button>
          <button className="btn btn-secondary">
            <ArrowUpDown size={16} />
            Sort by...
          </button>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : filteredDrivers.length === 0 ? (
          <div className="empty-state">
            <Users size={48} />
            <p>No drivers found</p>
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
              {filteredDrivers.map((driver) => (
                <tr key={driver.id} className={isLicenseExpired(driver.license_expiry) ? 'row-expired' : ''}>
                  <td style={{ fontWeight: 500 }}>
                    {driver.name}
                    {isLicenseExpired(driver.license_expiry) && (
                      <AlertTriangle size={14} style={{ marginLeft: '0.5rem', color: 'var(--status-retired)' }} />
                    )}
                  </td>
                  <td>{driver.license_number}</td>
                  <td className={isLicenseExpired(driver.license_expiry) ? 'text-danger' : isLicenseExpiringSoon(driver.license_expiry) ? 'text-warning' : ''}>
                    {formatExpiry(driver.license_expiry)}
                  </td>
                  <td>
                    <span className={`score-badge ${getScoreClass(driver.completion_rate)}`}>
                      {driver.completion_rate}%
                    </span>
                  </td>
                  <td>
                    <span className={`score-badge ${getScoreClass(driver.safety_score)}`}>
                      {driver.safety_score}%
                    </span>
                  </td>
                  <td>
                    <span className={driver.complaints > 5 ? 'text-danger' : ''}>
                      {driver.complaints}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusBadge(driver.status).class}`}>
                      {getStatusBadge(driver.status).label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Legend */}
      <div className="driver-legend">
        <div className="legend-item">
          <span className="score-badge score-good">85%+</span>
          <span>Excellent</span>
        </div>
        <div className="legend-item">
          <span className="score-badge score-warning">70-84%</span>
          <span>Needs Improvement</span>
        </div>
        <div className="legend-item">
          <span className="score-badge score-danger">&lt;70%</span>
          <span>Critical</span>
        </div>
      </div>
    </div>
  )
}

export default DriverProfiles
