import { useState, useEffect } from 'react'
import { Search, Filter, ArrowUpDown, Truck, MapPin } from 'lucide-react'
import TripForm from '../components/TripForm'
import { tripApi, vehicleApi } from '../services/api'

function TripManagement() {
  const [trips, setTrips] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

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
      console.error('Failed to dispatch trip:', error)
      alert('Failed to dispatch trip: ' + (error.response?.data?.detail || error.message))
    }
  }

  const filteredTrips = trips.filter(trip =>
    trip.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.vehicle?.license_plate?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusClass = (status) => {
    const statusMap = {
      'scheduled': 'status-idle',
      'in_progress': 'status-active',
      'on_way': 'status-active',
      'completed': 'status-maintenance',
      'cancelled': 'status-retired'
    }
    return statusMap[status?.toLowerCase()] || 'status-idle'
  }

  const formatStatus = (status) => {
    if (!status) return 'Scheduled'
    const statusLabels = {
      'scheduled': 'Scheduled',
      'in_progress': 'On Way',
      'on_way': 'On Way',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    }
    return statusLabels[status?.toLowerCase()] || status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Trip Dispatcher & Management</h2>
      </div>

      <div className="toolbar">
        <div className="search-container">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Search trips..."
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
                <th>Trip</th>
                <th>Fleet Type</th>
                <th>Origin</th>
                <th>Destination</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrips.map((trip, index) => (
                <tr key={trip.id}>
                  <td style={{ fontWeight: 500 }}>{index + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Truck size={16} style={{ color: 'var(--gray-400)' }} />
                      {trip.vehicle?.vehicle_type || trip.fleet_type || 'Truck'}
                    </div>
                  </td>
                  <td>{trip.origin || '-'}</td>
                  <td>{trip.destination || '-'}</td>
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

      {/* New Trip Form */}
      <TripForm 
        vehicles={vehicles.filter(v => v.status === 'idle' || v.status === 'active')} 
        onSubmit={handleDispatchTrip} 
      />
    </div>
  )
}

export default TripManagement
