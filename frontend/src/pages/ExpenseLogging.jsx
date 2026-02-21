import { useState } from 'react'
import { Search, Plus, Filter, ArrowUpDown, X, Receipt } from 'lucide-react'
import ExpenseModal from '../components/ExpenseModal'

function ExpenseLogging() {
    const [expenses, setExpenses] = useState([
        {
            id: 1,
            trip_id: '321',
            driver: 'John',
            distance: '1000 km',
            fuel_expense: '19k',
            misc_expense: '3k',
            status: 'Done'
        },
        {
            id: 2,
            trip_id: '322',
            driver: 'Mike',
            distance: '540 km',
            fuel_expense: '11k',
            misc_expense: '1.5k',
            status: 'Done'
        },
        {
            id: 3,
            trip_id: '323',
            driver: 'Sarah',
            distance: '780 km',
            fuel_expense: '15k',
            misc_expense: '2k',
            status: 'Pending'
        }
    ])
    const [searchTerm, setSearchTerm] = useState('')
    const [showModal, setShowModal] = useState(false)

    const handleAddExpense = () => {
        setShowModal(true)
    }

    const handleSaveExpense = (expenseData) => {
        const newExpense = {
            id: Date.now(),
            ...expenseData
        }
        setExpenses([...expenses, newExpense])
        setShowModal(false)
    }

    const handleDeleteExpense = (id) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            setExpenses(expenses.filter(e => e.id !== id))
        }
    }

    const filteredExpenses = expenses.filter(expense =>
        expense.trip_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.driver?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.status?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStatusClass = (status) => {
        const statusMap = {
            'done': 'status-idle',
            'pending': 'status-maintenance',
            'cancelled': 'status-retired'
        }
        return statusMap[status?.toLowerCase()] || 'status-idle'
    }

    return (
        <div>
            <div className="page-header">
                <h2 className="page-title">Expense & Fuel Logging</h2>
            </div>

            <div className="toolbar">
                <div className="search-container">
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search expenses..."
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
                    <button className="btn btn-primary" onClick={handleAddExpense}>
                        <Plus size={16} />
                        Add an Expense
                    </button>
                </div>
            </div>

            <div className="table-container">
                {filteredExpenses.length === 0 ? (
                    <div className="empty-state">
                        <Receipt size={48} />
                        <p>No expenses found</p>
                        <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={handleAddExpense}>
                            <Plus size={16} />
                            Add your first expense
                        </button>
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
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredExpenses.map((expense, index) => (
                                <tr key={expense.id}>
                                    <td>{index + 1}</td>
                                    <td style={{ fontWeight: 500 }}>{expense.trip_id}</td>
                                    <td>{expense.driver}</td>
                                    <td>{expense.distance}</td>
                                    <td>{expense.fuel_expense}</td>
                                    <td>{expense.misc_expense}</td>
                                    <td>
                                        <span className={`status-badge ${getStatusClass(expense.status)}`}>
                                            {expense.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => handleDeleteExpense(expense.id)}
                                            title="Delete expense"
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
                <ExpenseModal
                    onSave={handleSaveExpense}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    )
}

export default ExpenseLogging
