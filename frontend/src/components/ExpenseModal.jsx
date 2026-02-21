import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

function ExpenseModal({ expense, onSave, onClose }) {
    const [formData, setFormData] = useState({
        trip_id: '',
        driver: '',
        distance: '',
        fuel_expense: '',
        misc_expense: '',
        status: 'Pending'
    })

    useEffect(() => {
        if (expense) {
            setFormData({
                trip_id: expense.trip_id || '',
                driver: expense.driver || '',
                distance: expense.distance || '',
                fuel_expense: expense.fuel_expense || '',
                misc_expense: expense.misc_expense || '',
                status: expense.status || 'Pending'
            })
        }
    }, [expense])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        onSave(formData)
    }

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 className="modal-title">{expense ? 'Edit Expense' : 'New Expense'}</h3>
                    <button className="btn btn-danger" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label className="form-label">Trip ID</label>
                            <input
                                type="text"
                                name="trip_id"
                                className="form-input"
                                placeholder="Enter trip ID"
                                value={formData.trip_id}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Driver</label>
                            <input
                                type="text"
                                name="driver"
                                className="form-input"
                                placeholder="Enter driver name"
                                value={formData.driver}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Distance</label>
                            <input
                                type="text"
                                name="distance"
                                className="form-input"
                                placeholder="e.g. 1000 km"
                                value={formData.distance}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Fuel Cost</label>
                            <input
                                type="text"
                                name="fuel_expense"
                                className="form-input"
                                placeholder="e.g. 19k"
                                value={formData.fuel_expense}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Misc Expense</label>
                            <input
                                type="text"
                                name="misc_expense"
                                className="form-input"
                                placeholder="e.g. 3k"
                                value={formData.misc_expense}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select
                                name="status"
                                className="form-select"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option value="Pending">Pending</option>
                                <option value="Done">Done</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {expense ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ExpenseModal
