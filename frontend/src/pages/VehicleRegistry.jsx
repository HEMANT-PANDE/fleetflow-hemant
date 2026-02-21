import { useState, useEffect } from 'react'
import { Search, Plus, Filter, ArrowUpDown, X, Truck } from 'lucide-react'
import VehicleModal from '../components/VehicleModal'
import { vehicleApi } from '../services/api'

function VehicleRegistry() {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState(null)

  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      const data = await vehicleApi.getAll()
      setVehicles(data)
    } catch (error) {
      console.error('Failed to fetch vehicles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddVehicle = () => {
    setEditingVehicle(null)
    setShowModal(true)
  }

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle)
    setShowModal(true)
  }

  const handleDeleteVehicle = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await vehicleApi.delete(id)
        fetchVehicles()
      } catch (error) {
        console.error('Failed to delete vehicle:', error)
      }
    }
  }

  const handleSaveVehicle = async (vehicleData) => {
    try {
      if (editingVehicle) {
        await vehicleApi.update(editingVehicle.id, vehicleData)
      } else {
        await vehicleApi.create(vehicleData)
      }
      setShowModal(false)
      fetchVehicles()
    } catch (error) {
      console.error('Failed to save vehicle:', error)
    }
  }

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.license_plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.vehicle_type?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusClass = (status) => {
    const statusMap = {
      'idle': 'status-idle',
      'active': 'status-active',
      'in_trip': 'status-active',
      'maintenance': 'status-maintenance',
      'retired': 'status-retired'
    }
    return statusMap[status?.toLowerCase()] || 'status-idle'
  }

  const formatStatus = (status) => {
    if (!status) return 'Idle'
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Vehicle Registry</h2>
      </div>

      <div className="toolbar">
        <div className="search-container">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Search vehicles..."
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
          <button className="btn btn-primary" onClick={handleAddVehicle}>
            <Plus size={16} />
            New Vehicle
          </button>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="empty-state">
            <Truck size={48} />
            <p>No vehicles found</p>
            <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={handleAddVehicle}>
              <Plus size={16} />
              Add your first vehicle
            </button>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>NO</th>
                <th>Plate</th>
                <th>Model</th>
                <th>Type</th>
                <th>Capacity</th>
                <th>Odometer</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map((vehicle, index) => (
                <tr key={vehicle.id}>
                  <td>{index + 1}</td>
                  <td style={{ fontWeight: 500 }}>{vehicle.license_plate}</td>
                  <td>{vehicle.model || '-'}</td>
                  <td>{vehicle.vehicle_type || '-'}</td>
                  <td>{vehicle.max_load_capacity ? `${vehicle.max_load_capacity} tons` : '-'}</td>
                  <td>{vehicle.current_odometer?.toLocaleString() || '0'}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(vehicle.status)}`}>
                      {formatStatus(vehicle.status)}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteVehicle(vehicle.id)}
                      title="Delete vehicle"
                    >
                      <X size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <VehicleModal
          vehicle={editingVehicle}
          onSave={handleSaveVehicle}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

export default VehicleRegistry
