import { useState, useEffect } from 'react'
import { Send } from 'lucide-react'
import { driverApi } from '../services/api'

function TripForm({ vehicles, onSubmit }) {
  const [formData, setFormData] = useState({
    vehicle_id: '',
    driver_id: '',
    driver_name: '',
    cargo_weight: '',
    origin: '',
    destination: '',
    estimated_fuel_cost: ''
  })
  const [drivers, setDrivers] = useState([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    driverApi.getAll()
      .then(data => setDrivers(data))
      .catch(() => setDrivers([
        { id: 1, name: 'Rajesh Kumar', license_number: '23223' },
        { id: 2, name: 'Amit Singh', license_number: '23224' },
        { id: 3, name: 'Suresh Patel', license_number: '23225' },
        { id: 4, name: 'Vijay Sharma', license_number: '23226' }
      ]))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const selectedVehicle = vehicles.find(v => v.id === parseInt(formData.vehicle_id))
    const selectedDriver = drivers.find(d => d.id === parseInt(formData.driver_id))
    
    if (selectedVehicle && selectedVehicle.max_load_capacity) {
      const cargoWeightTons = parseFloat(formData.cargo_weight) / 1000
      if (cargoWeightTons > selectedVehicle.max_load_capacity) {
        alert(`Too heavy! This vehicle can only carry ${selectedVehicle.max_load_capacity} tons (${selectedVehicle.max_load_capacity * 1000} kg). Your cargo weighs ${formData.cargo_weight} kg.`)
        return
      }
    }

    setSubmitting(true)
    try {
      await onSubmit({
        vehicle_id: parseInt(formData.vehicle_id),
        driver_id: selectedDriver ? selectedDriver.id : null,
        driver_name: selectedDriver ? selectedDriver.name : formData.driver_name,
        cargo_weight: parseFloat(formData.cargo_weight) || 0,
        origin: formData.origin,
        destination: formData.destination,
        start_location: formData.origin,
        end_location: formData.destination,
        estimated_fuel_cost: parseFloat(formData.estimated_fuel_cost) || 0,
      })
      setFormData({
        vehicle_id: '', driver_id: '', driver_name: '',
        cargo_weight: '', origin: '', destination: '',
        estimated_fuel_cost: ''
      })
    } catch (error) {
      console.error('Submit error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="trip-form-container">
      <h3 className="trip-form-title">New Trip Dispatch</h3>
      
      <form onSubmit={handleSubmit} className="trip-form">
        <div className="trip-form-grid">
          <div className="form-group">
            <label className="form-label">Select Vehicle</label>
            <select
              name="vehicle_id"
              className="form-select"
              value={formData.vehicle_id}
              onChange={handleChange}
              required
            >
              <option value="">Choose a vehicle...</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.license_plate} - {vehicle.type || vehicle.vehicle_type} ({vehicle.max_load_capacity || vehicle.max_capacity || '?'} tons)
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Cargo Weight (Kg)</label>
            <input
              type="number"
              name="cargo_weight"
              className="form-input"
              value={formData.cargo_weight}
              onChange={handleChange}
              placeholder="e.g., 2000"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Select Driver</label>
            <select
              name="driver_id"
              className="form-select"
              value={formData.driver_id}
              onChange={handleChange}
              required
            >
              <option value="">Choose a driver...</option>
              {drivers.map(driver => (
                <option key={driver.id} value={driver.id}>
                  {driver.name} ({driver.license_number})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Origin</label>
            <input
              type="text"
              name="origin"
              className="form-input"
              value={formData.origin}
              onChange={handleChange}
              placeholder="e.g., Mumbai"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Destination</label>
            <input
              type="text"
              name="destination"
              className="form-input"
              value={formData.destination}
              onChange={handleChange}
              placeholder="e.g., Pune"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Est. Fuel Cost</label>
            <input
              type="number"
              name="estimated_fuel_cost"
              className="form-input"
              value={formData.estimated_fuel_cost}
              onChange={handleChange}
              placeholder="e.g., 5000"
              min="0"
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-dispatch" disabled={submitting}>
          <Send size={16} />
          {submitting ? 'Dispatching...' : 'Confirm & Dispatch Trip'}
        </button>
      </form>
    </div>
  )
}

export default TripForm
