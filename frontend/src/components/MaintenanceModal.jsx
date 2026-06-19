import { useState } from 'react'

function MaintenanceModal({ vehicles, onSave, onClose }) {
  const [formData, setFormData] = useState({
    vehicle_id: '',
    description: '',
    issue_description: '',
    service_type: 'preventive',
    maintenance_type: 'preventive',
    service_date: new Date().toISOString().split('T')[0],
    parts_cost: '',
    labor_cost: '',
    notes: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      vehicle_id: parseInt(formData.vehicle_id),
      description: formData.description || formData.issue_description,
      issue_description: formData.issue_description || formData.description,
      service_type: formData.service_type,
      maintenance_type: formData.maintenance_type,
      service_date: formData.service_date,
      parts_cost: parseFloat(formData.parts_cost) || 0,
      labor_cost: parseFloat(formData.labor_cost) || 0,
      notes: formData.notes
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">New Maintenance Service</h3>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Vehicle</label>
              <select name="vehicle_id" className="form-select" value={formData.vehicle_id} onChange={handleChange} required>
                <option value="">Select a vehicle...</option>
                {vehicles.map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.license_plate} - {vehicle.name || vehicle.model || vehicle.type}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Service Type</label>
              <select name="service_type" className="form-select" value={formData.service_type} onChange={handleChange}>
                <option value="preventive">Preventive</option>
                <option value="reactive">Reactive</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Issue / Description</label>
              <input type="text" name="description" className="form-input" value={formData.description} onChange={handleChange} placeholder="e.g., Engine Issue, Oil Change" required />
            </div>

            <div className="form-group">
              <label className="form-label">Service Date</label>
              <input type="date" name="service_date" className="form-input" value={formData.service_date} onChange={handleChange} required />
            </div>

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Parts Cost</label>
                <input type="number" name="parts_cost" className="form-input" value={formData.parts_cost} onChange={handleChange} placeholder="0" min="0" step="0.01" />
              </div>
              <div className="form-group">
                <label className="form-label">Labor Cost</label>
                <input type="number" name="labor_cost" className="form-input" value={formData.labor_cost} onChange={handleChange} placeholder="0" min="0" step="0.01" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Notes</label>
              <input type="text" name="notes" className="form-input" value={formData.notes} onChange={handleChange} placeholder="Additional notes..." />
            </div>
          </div>

          <div className="modal-footer">
            <button type="submit" className="btn btn-primary">Create</button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MaintenanceModal
