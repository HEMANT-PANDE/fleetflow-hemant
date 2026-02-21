import { useState } from 'react'

function MaintenanceModal({ vehicles, onSave, onClose }) {
  const [formData, setFormData] = useState({
    vehicle_id: '',
    issue_description: '',
    service_date: new Date().toISOString().split('T')[0]
  })

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
      vehicle_id: parseInt(formData.vehicle_id),
      issue_description: formData.issue_description,
      service_type: formData.issue_description,
      service_date: formData.service_date,
      status: 'new'
    }
    onSave(data)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">New Service</h3>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Vehicle Name</label>
              <select
                name="vehicle_id"
                className="form-select"
                value={formData.vehicle_id}
                onChange={handleChange}
                required
              >
                <option value="">Select a vehicle...</option>
                {vehicles.map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.license_plate} - {vehicle.model || vehicle.vehicle_type || 'Vehicle'}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Issue/Service</label>
              <input
                type="text"
                name="issue_description"
                className="form-input"
                value={formData.issue_description}
                onChange={handleChange}
                placeholder="e.g., Engine Issue, Oil Change, New Tires"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                name="service_date"
                className="form-input"
                value={formData.service_date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="submit" className="btn btn-primary">
              Create
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MaintenanceModal
