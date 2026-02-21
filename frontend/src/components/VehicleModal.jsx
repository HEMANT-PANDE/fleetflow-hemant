import { useState, useEffect } from 'react'

function VehicleModal({ vehicle, onSave, onClose }) {
  const [formData, setFormData] = useState({
    license_plate: '',
    model: '',
    vehicle_type: 'mini',
    max_load_capacity: '',
    current_odometer: '',
    status: 'idle'
  })

  useEffect(() => {
    if (vehicle) {
      setFormData({
        license_plate: vehicle.license_plate || '',
        model: vehicle.model || '',
        vehicle_type: vehicle.vehicle_type || 'mini',
        max_load_capacity: vehicle.max_load_capacity || '',
        current_odometer: vehicle.current_odometer || '',
        status: vehicle.status || 'idle'
      })
    }
  }, [vehicle])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const data = {
      ...formData,
      max_load_capacity: formData.max_load_capacity ? parseFloat(formData.max_load_capacity) : null,
      current_odometer: formData.current_odometer ? parseInt(formData.current_odometer) : 0
    }
    onSave(data)
  }

  const vehicleTypes = [
    { value: 'mini', label: 'Mini' },
    { value: 'sedan', label: 'Sedan' },
    { value: 'suv', label: 'SUV' },
    { value: 'van', label: 'Van' },
    { value: 'truck', label: 'Truck' },
    { value: 'bus', label: 'Bus' }
  ]

  const statusOptions = [
    { value: 'idle', label: 'Idle' },
    { value: 'active', label: 'Active' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'retired', label: 'Retired' }
  ]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {vehicle ? 'Edit Vehicle' : 'New Vehicle Registration'}
          </h3>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">License Plate</label>
              <input
                type="text"
                name="license_plate"
                className="form-input"
                value={formData.license_plate}
                onChange={handleChange}
                placeholder="e.g., MH 00"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Model</label>
              <input
                type="text"
                name="model"
                className="form-input"
                value={formData.model}
                onChange={handleChange}
                placeholder="e.g., 2017"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Type</label>
              <select
                name="vehicle_type"
                className="form-select"
                value={formData.vehicle_type}
                onChange={handleChange}
              >
                {vehicleTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Max Payload (tons)</label>
              <input
                type="number"
                name="max_load_capacity"
                className="form-input"
                value={formData.max_load_capacity}
                onChange={handleChange}
                placeholder="e.g., 5"
                step="0.1"
                min="0"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Initial Odometer</label>
              <input
                type="number"
                name="current_odometer"
                className="form-input"
                value={formData.current_odometer}
                onChange={handleChange}
                placeholder="e.g., 79000"
                min="0"
              />
            </div>

            {vehicle && (
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  name="status"
                  className="form-select"
                  value={formData.status}
                  onChange={handleChange}
                >
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default VehicleModal
