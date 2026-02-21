import { useState } from 'react'
import { Send } from 'lucide-react'

function TripForm({ vehicles, onSubmit }) {
  const [formData, setFormData] = useState({
    vehicle_id: '',
    cargo_weight: '',
    driver_name: '',
    origin: '',
    destination: '',
    estimated_fuel_cost: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate cargo weight against vehicle capacity
    const selectedVehicle = vehicles.find(v => v.id === parseInt(formData.vehicle_id))
    if (selectedVehicle && selectedVehicle.max_load_capacity) {
      const cargoWeightTons = parseFloat(formData.cargo_weight) / 1000 // Convert kg to tons
      if (cargoWeightTons > selectedVehicle.max_load_capacity) {
        alert(`Too heavy! This vehicle can only carry ${selectedVehicle.max_load_capacity} tons (${selectedVehicle.max_load_capacity * 1000} kg). Your cargo weighs ${formData.cargo_weight} kg.`)
        return
      }
    }

    setSubmitting(true)
    try {
      const data = {
        vehicle_id: parseInt(formData.vehicle_id),
        cargo_weight: parseFloat(formData.cargo_weight) || 0,
        driver_name: formData.driver_name,
        origin: formData.origin,
        destination: formData.destination,
        estimated_fuel_cost: parseFloat(formData.estimated_fuel_cost) || 0,
        status: 'scheduled'
      }
      await onSubmit(data)
      // Reset form
      setFormData({
        vehicle_id: '',
        cargo_weight: '',
        driver_name: '',
        origin: '',
        destination: '',
        estimated_fuel_cost: ''
      })
    } catch (error) {
      console.error('Submit error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  // Sample drivers - in real app this would come from API
  const drivers = [
    { id: 1, name: 'Rajesh Kumar' },
    { id: 2, name: 'Amit Singh' },
    { id: 3, name: 'Suresh Patel' },
    { id: 4, name: 'Vijay Sharma' }
  ]

  return (
    <div className="trip-form-container">
      <h3 className="trip-form-title">New Trip Form</h3>
      
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
                  {vehicle.license_plate} - {vehicle.vehicle_type} ({vehicle.max_load_capacity || '?'} tons)
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
              name="driver_name"
              className="form-select"
              value={formData.driver_name}
              onChange={handleChange}
              required
            >
              <option value="">Choose a driver...</option>
              {drivers.map(driver => (
                <option key={driver.id} value={driver.name}>
                  {driver.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Origin Address</label>
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
            <label className="form-label">Estimated Fuel Cost</label>
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

        <button 
          type="submit" 
          className="btn btn-primary btn-dispatch"
          disabled={submitting}
        >
          <Send size={16} />
          {submitting ? 'Dispatching...' : 'Confirm & Dispatch Trip'}
        </button>
      </form>
    </div>
  )
}

export default TripForm
