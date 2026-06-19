import { useState, useEffect } from 'react'
import { Search, Filter, ArrowUpDown, Truck, MapPin, X, Edit2, Play, CheckCircle, Ban } from 'lucide-react'
import TripForm from '../components/TripForm'
import { tripApi, vehicleApi } from '../services/api'

function TripManagement() {
  const [trips, setTrips] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [tripsData, vehiclesData] = await Promise.all([
        tripApi.getAll(),
        vehicleApi.getAll()
      ])
      setTrips(tripsData)
      setVehicles(vehiclesData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDispatchTrip = async (tripData) => {
    try {
      await tripApi.create(tripData)
      fetchData()
    } catch (error) {
      alert('Failed to dispatch trip: ' + (error.response?.data?.detail || error.message))
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      await tripApi.updateStatus(id, status)
      fetchData()
    } catch (error) {
      console.error('Failed to update trip status:', error)
    }
  }

  const handleDeleteTrip = async (id) => {
    if (window.confirm('Delete this trip?')) {
      try {
        await tripApi.delete(id)
        fetchData()
      } catch (error) {
        console.error('Failed to delete trip:', error)
      }
    }
  }

  const filteredTrips = trips.filter(trip =>
    (trip.origin || trip.start_location || '')?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (trip.destination || trip.end_location || '')?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (trip.vehicle?.license_plate || '')?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (trip.driver?.name || trip.driver_name || '')?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusClass = (status) => {
    const m = {
      'scheduled': 'status-idle', 'in_progress': 'status-active',
      'on_way': 'status-active', 'completed': 'status-maintenance',
      'cancelled': 'status-retired'
    }
    return m[status?.toLowerCase()] || 'status-idle'
  }

  const formatStatus = (status) => {
    if (!status) return 'Scheduled'
    const m = { 'scheduled': 'Scheduled', 'in_progress': 'In Progress', 'on_way': 'On Way', 'completed': 'Completed', 'cancelled': 'Cancelled' }
    return m[status?.toLowerCase()] || status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Trip Dispatcher & Management</h2>
      </div>

      <div className="toolbar">
        <div className="search-container">
          <Search className="search-icon" size={18} />
          <input type="text" className="search-input" placeholder="Search trips..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="toolbar-actions">
          <button className="btn btn-secondary"><Filter size={16} /> Filter</button>
          <button className="btn btn-secondary"><ArrowUpDown size={16} /> Sort by...</button>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : filteredTrips.length === 0 ? (
          <div className="empty-state">
            <MapPin size={48} />
            <p>No trips found</p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Create a new trip using the form below</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Vehicle</th>
                <th>Driver</th>
                <th>Origin</th>
                <th>Destination</th>
                <th>Cargo (kg)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrips.map((trip, index) => (
                <tr key={trip.id}>
                  <td style={{ fontWeight: 500 }}>{index + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Truck size={16} style={{ color: 'var(--gray-400)' }} />
                      {trip.vehicle?.license_plate || trip.fleet_type || `Vehicle #${trip.vehicle_id}`}
                    </div>
                  </td>
                  <td>{trip.driver?.name || trip.driver_name || `Driver #${trip.driver_id}`}</td>
                  <td>{trip.origin || trip.start_location || '-'}</td>
                  <td>{trip.destination || trip.end_location || '-'}</td>
                  <td>{trip.cargo_weight || 0}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(trip.status)}`}>
                      {formatStatus(trip.status)}
                    </span>
                  </td>
                  <td>
                    {trip.status === 'scheduled' && (
                      <>
                        <button className="btn btn-secondary" onClick={() => handleStatusChange(trip.id, 'in_progress')} title="Start trip" style={{ padding: '0.35rem', marginRight: '0.25rem' }}>
                          <Play size={14} />
                        </button>
                        <button className="btn btn-danger" onClick={() => handleStatusChange(trip.id, 'cancelled')} title="Cancel trip" style={{ padding: '0.35rem', marginRight: '0.25rem' }}>
                          <Ban size={14} />
                        </button>
                      </>
                    )}
                    {trip.status === 'in_progress' && (
                      <button className="btn btn-primary" onClick={() => handleStatusChange(trip.id, 'completed')} title="Complete trip" style={{ padding: '0.35rem', marginRight: '0.25rem' }}>
                        <CheckCircle size={14} />
                      </button>
                    )}
                    <button className="btn btn-danger" onClick={() => handleDeleteTrip(trip.id)} title="Delete" style={{ padding: '0.35rem' }}>
                      <X size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <TripForm vehicles={vehicles.filter(v => v.status === 'idle' || v.status === 'available' || v.status === 'active')} onSubmit={handleDispatchTrip} />
    </div>
  )
}

export default TripManagement
