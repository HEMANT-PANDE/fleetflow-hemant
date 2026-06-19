import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const parseCost = (val) => {
  if (!val) return 0
  const cleaned = val.toString().toLowerCase().trim()
  if (cleaned.endsWith('k')) return parseFloat(cleaned.replace('k', '')) * 1000
  return parseFloat(cleaned) || 0
}

function ExpenseModal({ expense, onSave, onClose }) {
  const [formData, setFormData] = useState({
    trip_id: '',
    driver_name: '',
    distance_km: '',
    fuel_expense: '',
    misc_expense: '',
    expense_type: 'Fuel',
    status: 'Pending',
    date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    if (expense) {
      setFormData({
        trip_id: expense.trip_id || '',
        driver_name: expense.driver_name || expense.driver || '',
        distance_km: expense.distance_km || expense.distance || '',
        fuel_expense: expense.fuel_expense || '',
        misc_expense: expense.misc_expense || '',
        expense_type: expense.expense_type || 'Fuel',
        status: expense.status || 'Pending',
        date: expense.date || new Date().toISOString().split('T')[0]
      })
    }
  }, [expense])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const fuelCost = parseCost(formData.fuel_expense)
    const miscCost = parseCost(formData.misc_expense)
    const totalCost = fuelCost + miscCost
    onSave({
      ...formData,
      trip_id: formData.trip_id ? parseInt(formData.trip_id) : null,
      driver: formData.driver_name,
      driver_name: formData.driver_name,
      distance: formData.distance_km,
      distance_km: formData.distance_km ? parseFloat(formData.distance_km) : null,
      fuel_expense: fuelCost,
      misc_expense: miscCost,
      cost: totalCost,
      expense_type: 'Fuel',
      liters: null,
    })
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 className="modal-title">{expense ? 'Edit Expense' : 'New Expense'}</h3>
          <button className="btn btn-danger" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Trip ID</label>
              <input type="number" name="trip_id" className="form-input" placeholder="Enter trip ID" value={formData.trip_id} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Driver Name</label>
              <input type="text" name="driver_name" className="form-input" placeholder="Enter driver name" value={formData.driver_name} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Distance (km)</label>
              <input type="number" name="distance_km" className="form-input" placeholder="e.g. 1000" value={formData.distance_km} onChange={handleChange} min="0" />
            </div>

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Fuel Cost</label>
                <input type="text" name="fuel_expense" className="form-input" placeholder="e.g. 19000 or 19k" value={formData.fuel_expense} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Misc Expense</label>
                <input type="text" name="misc_expense" className="form-input" placeholder="e.g. 3000 or 3k" value={formData.misc_expense} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="date" name="date" className="form-input" value={formData.date} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select name="status" className="form-select" value={formData.status} onChange={handleChange}>
                <option value="Pending">Pending</option>
                <option value="Done">Done</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{expense ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ExpenseModal
