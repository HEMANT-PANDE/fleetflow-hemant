import { useState, useEffect } from 'react'
import { Search, Plus, Filter, ArrowUpDown, Wrench, X, CheckCircle } from 'lucide-react'
import MaintenanceModal from '../components/MaintenanceModal'
import { maintenanceApi, vehicleApi } from '../services/api'

function MaintenanceLogs() {
  const [logs, setLogs] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [logsData, vehiclesData] = await Promise.all([
        maintenanceApi.getAll(),
        vehicleApi.getAll()
      ])
      setLogs(logsData)
      setVehicles(vehiclesData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateService = async (serviceData) => {
    try {
      await maintenanceApi.create(serviceData)
      setShowModal(false)
      fetchData()
    } catch (error) {
      alert('Failed to create service: ' + (error.response?.data?.detail || error.message))
    }
  }

  const handleComplete = async (id, cost) => {
    try {
      await maintenanceApi.complete(id, cost)
      fetchData()
    } catch (error) {
      console.error('Failed to complete:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this maintenance record?')) {
      try {
        await maintenanceApi.delete(id)
        fetchData()
      } catch (error) {
        console.error('Failed to delete:', error)
      }
    }
  }

  const filteredLogs = logs.filter(log =>
    (log.vehicle?.license_plate || '')?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.description || log.issue_description || '')?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.service_type || log.maintenance_type || '')?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusClass = (status) => {
    const m = { 'new': 'status-active', 'pending': 'status-active', 'in_progress': 'status-maintenance', 'in_shop': 'status-maintenance', 'completed': 'status-idle', 'cancelled': 'status-retired' }
    return m[status?.toLowerCase()] || 'status-active'
  }

  const formatStatus = (status) => {
    if (!status) return 'New'
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const formatCost = (cost) => {
    if (!cost || cost === 0) return '-'
    if (cost >= 1000) return `₹${(cost / 1000).toFixed(0)}k`
    return `₹${cost}`
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Maintenance & Service Logs</h2>
      </div>

      <div className="toolbar">
        <div className="search-container">
          <Search className="search-icon" size={18} />
          <input type="text" className="search-input" placeholder="Search logs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="toolbar-actions">
          <button className="btn btn-secondary"><Filter size={16} /> Filter</button>
          <button className="btn btn-secondary"><ArrowUpDown size={16} /> Sort by...</button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Create New Service</button>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : filteredLogs.length === 0 ? (
          <div className="empty-state">
            <Wrench size={48} />
            <p>No maintenance logs found</p>
            <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setShowModal(true)}><Plus size={16} /> Create first service log</button>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Vehicle</th>
                <th>Service</th>
                <th>Date</th>
                <th>Cost</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontWeight: 500 }}>{log.id}</td>
                  <td>{log.vehicle?.license_plate || log.vehicle_name || '-'}</td>
                  <td>{log.description || log.issue_description || log.service_type || '-'}</td>
                  <td>{formatDate(log.service_date || log.created_at)}</td>
                  <td>{formatCost(log.total_cost || log.cost)}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(log.is_completed ? 'completed' : log.status)}`}>
                      {log.is_completed ? 'Completed' : formatStatus(log.status)}
                    </span>
                  </td>
                  <td>
                    {!log.is_completed && log.status !== 'completed' && (
                      <button className="btn btn-primary" onClick={() => handleComplete(log.id, log.total_cost || log.cost)} title="Mark completed" style={{ padding: '0.35rem', marginRight: '0.25rem' }}>
                        <CheckCircle size={14} />
                      </button>
                    )}
                    <button className="btn btn-danger" onClick={() => handleDelete(log.id)} title="Delete" style={{ padding: '0.35rem' }}>
                      <X size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <MaintenanceModal vehicles={vehicles} onSave={handleCreateService} onClose={() => setShowModal(false)} />
      )}
    </div>
  )
}

export default MaintenanceLogs
