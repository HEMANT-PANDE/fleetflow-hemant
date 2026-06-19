import { useState, useEffect } from 'react'
import { Search, Plus, Filter, ArrowUpDown, X, Receipt } from 'lucide-react'
import ExpenseModal from '../components/ExpenseModal'
import { expenseApi } from '../services/api'

function ExpenseLogging() {
    const [expenses, setExpenses] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showModal, setShowModal] = useState(false)

    useEffect(() => { fetchExpenses() }, [])

    const fetchExpenses = async () => {
        try {
            setLoading(true)
            const data = await expenseApi.getAll()
            setExpenses(data)
        } catch (error) {
            console.error('Failed to fetch expenses:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSaveExpense = async (expenseData) => {
        try {
            await expenseApi.create(expenseData)
            setShowModal(false)
            fetchExpenses()
        } catch (error) {
            alert('Failed to save expense: ' + (error.response?.data?.detail || error.message))
        }
    }

    const handleDeleteExpense = async (id) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            try {
                await expenseApi.delete(id)
                fetchExpenses()
            } catch (error) {
                console.error('Failed to delete expense:', error)
            }
        }
    }

    const filteredExpenses = expenses.filter(expense =>
        (expense.trip_id?.toString() || '').includes(searchTerm.toLowerCase()) ||
        (expense.driver_name || expense.driver || '')?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (expense.expense_type || '')?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (expense.status || '')?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStatusClass = (status) => {
        const m = { 'done': 'status-idle', 'pending': 'status-maintenance', 'cancelled': 'status-retired' }
        return m[status?.toLowerCase()] || 'status-idle'
    }

    const formatExpenseVal = (val) => {
        if (typeof val === 'number' && val > 0) return `₹${val.toLocaleString()}`
        return val || '-'
    }

    return (
        <div>
            <div className="page-header">
                <h2 className="page-title">Expense & Fuel Logging</h2>
            </div>

            <div className="toolbar">
                <div className="search-container">
                    <Search className="search-icon" size={18} />
                    <input type="text" className="search-input" placeholder="Search expenses..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="toolbar-actions">
                    <button className="btn btn-secondary"><Filter size={16} /> Filter</button>
                    <button className="btn btn-secondary"><ArrowUpDown size={16} /> Sort by...</button>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Add an Expense</button>
                </div>
            </div>

            <div className="table-container">
                {loading ? (
                    <div className="loading"><div className="spinner"></div></div>
                ) : filteredExpenses.length === 0 ? (
                    <div className="empty-state">
                        <Receipt size={48} />
                        <p>No expenses found</p>
                        <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setShowModal(true)}><Plus size={16} /> Add your first expense</button>
                    </div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>NO</th>
                                <th>Trip ID</th>
                                <th>Driver</th>
                                <th>Distance</th>
                                <th>Fuel Expense</th>
                                <th>Misc. Expense</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredExpenses.map((expense, index) => (
                                <tr key={expense.id}>
                                    <td>{index + 1}</td>
                                    <td style={{ fontWeight: 500 }}>{expense.trip_id || '-'}</td>
                                    <td>{expense.driver_name || expense.driver || '-'}</td>
                                    <td>{expense.distance_km || expense.distance || '-'}</td>
                                    <td>{formatExpenseVal(expense.fuel_expense)}</td>
                                    <td>{formatExpenseVal(expense.misc_expense)}</td>
                                    <td>{expense.date || '-'}</td>
                                    <td>
                                        <span className={`status-badge ${getStatusClass(expense.status)}`}>{expense.status}</span>
                                    </td>
                                    <td>
                                        <button className="btn btn-danger" onClick={() => handleDeleteExpense(expense.id)} title="Delete expense"><X size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && <ExpenseModal onSave={handleSaveExpense} onClose={() => setShowModal(false)} />}
        </div>
    )
}

export default ExpenseLogging
