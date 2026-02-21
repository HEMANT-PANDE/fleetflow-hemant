import { useState, useEffect } from 'react'
import { Search, Filter, Plus, Truck, AlertTriangle, Package } from 'lucide-react'
import { Link } from 'react-router-dom'
import { vehicleApi, tripApi } from '../services/api'

function Dashboard() {
  const [trips, setTrips] = useState([])
  const [stats, setStats] = useState({
    activeFleet: 0,
    maintenanceAlert: 0,
    pendingCargo: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [groupBy, setGroupBy] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [tripsData, vehiclesData] = await Promise.all([
        tripApi.getAll().catch(() => []),
        vehicleApi.getAll().catch(() => [])
      ])
      setTrips(tripsData)
      
      // Calculate stats
      const activeVehicles = vehiclesData.filter(v => 
        v.status?.toLowerCase() === 'on trip' || v.status?.toLowerCase() === 'on_trip'
      ).length
      const maintenanceVehicles = vehiclesData.filter(v => 
        v.status?.toLowerCase() === 'in shop' || v.status?.toLowerCase() === 'in_shop'
      ).length
      const pendingTrips = tripsData.filter(t => 
        t.status?.toLowerCase() === 'pending' || t.status?.toLowerCase() === 'scheduled'
      ).length

      setStats({
        activeFleet: activeVehicles || vehiclesData.length,
        maintenanceAlert: maintenanceVehicles,
        pendingCargo: pendingTrips
      })
    } catch (error) {
      console.error('Failed to fetch data:', error)
      // Set sample stats
      setStats({ activeFleet: 220, maintenanceAlert: 180, pendingCargo: 20 })
    } finally {
      setLoading(false)
    }
  }

  const filteredTrips = trips.filter(trip =>
    trip.vehicle?.license_plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.driver?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.start_location?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatStatus = (status) => {
    if (!status) return 'Scheduled'
    const statusLabels = {
      'scheduled': 'Scheduled',
      'in_progress': 'On Trip',
      'on_trip': 'On Trip',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    }
    return statusLabels[status?.toLowerCase()] || status
  }

  const getStatusClass = (status) => {
    const statusMap = {
      'scheduled': 'status-idle',
      'in_progress': 'status-active',
      'on_trip': 'status-active',
      'completed': 'status-maintenance',
      'cancelled': 'status-retired'
    }
    return statusMap[status?.toLowerCase()] || 'status-idle'
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Dashboard</h2>
      </div>

      {/* Search and Actions */}
      <div className="toolbar">
        <div className="search-container">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Search for..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="toolbar-actions">
          <select 
            className="form-select" 
            style={{ width: '120px' }}
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
          >
            <option value="">Group by</option>
            <option value="status">Status</option>
            <option value="vehicle">Vehicle</option>
            <option value="driver">Driver</option>
          </select>
          <button className="btn btn-secondary">
            <Filter size={16} />
            Filter
          </button>
          <Link to="/trips" className="btn btn-primary">
            <Plus size={16} />
            New Trip
          </Link>
          <Link to="/vehicles" className="btn btn-primary">
            <Plus size={16} />
            New Vehicle
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="dashboard-kpis">
        <div className="dashboard-kpi-card">
          <div className="kpi-icon-box" style={{ background: '#dbeafe' }}>
            <Truck size={24} style={{ color: '#2563eb' }} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Active Fleet</span>
            <span className="kpi-value">{stats.activeFleet}</span>
          </div>
        </div>

        <div className="dashboard-kpi-card">
          <div className="kpi-icon-box" style={{ background: '#fef3c7' }}>
            <AlertTriangle size={24} style={{ color: '#d97706' }} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Maintenance Alert</span>
            <span className="kpi-value">{stats.maintenanceAlert}</span>
          </div>
        </div>

        <div className="dashboard-kpi-card">
          <div className="kpi-icon-box" style={{ background: '#d1fae5' }}>
            <Package size={24} style={{ color: '#059669' }} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Pending Cargo</span>
            <span className="kpi-value">{stats.pendingCargo}</span>
          </div>
        </div>
      </div>

      {/* Trips Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="empty-state">
            <Truck size={48} />
            <p>No active trips</p>
            <Link to="/trips" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              <Plus size={16} />
              Create a new trip
            </Link>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Trip</th>
                <th>Vehicle</th>
                <th>Driver</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrips.slice(0, 10).map((trip, index) => (
                <tr key={trip.id}>
                  <td style={{ fontWeight: 500 }}>{index + 1}</td>
                  <td>{trip.vehicle?.license_plate || `Vehicle #${trip.vehicle_id}`}</td>
                  <td>{trip.driver?.name || `Driver #${trip.driver_id}`}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(trip.status)}`}>
                      {formatStatus(trip.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Dashboard
