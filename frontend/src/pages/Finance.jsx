import { useState, useEffect } from 'react'
import { Plus, Search, DollarSign, RefreshCw } from 'lucide-react'
import { financeApi } from '../services/api'

function Finance() {
    const [expenses, setExpenses] = useState([])
    const [fuelLogs, setFuelLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [activeTab, setActiveTab] = useState('expenses')

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const [expensesData, fuelData] = await Promise.all([
                financeApi.getExpenses(),
                financeApi.getFuelLogs()
            ])
            setExpenses(expensesData)
            setFuelLogs(fuelData)
        } catch (error) {
            console.error('Failed to fetch finance data:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredExpenses = expenses.filter(exp =>
        exp.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const filteredFuelLogs = fuelLogs.filter(log =>
        log.station_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.vehicle_id?.toString().includes(searchTerm)
    )

    return (
        <div>
            <div className="page-header">
                <h2 className="page-title">Financial Logs</h2>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--gray-200)', paddingBottom: '0.5rem' }}>
                <button
                    onClick={() => setActiveTab('expenses')}
                    style={{
                        background: 'none',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        fontWeight: activeTab === 'expenses' ? 600 : 500,
                        color: activeTab === 'expenses' ? 'var(--primary-blue)' : 'var(--gray-500)',
                        borderBottom: activeTab === 'expenses' ? '2px solid var(--primary-blue)' : '2px solid transparent',
                        cursor: 'pointer'
                    }}
                >
                    General Expenses
                </button>
                <button
                    onClick={() => setActiveTab('fuel')}
                    style={{
                        background: 'none',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        fontWeight: activeTab === 'fuel' ? 600 : 500,
                        color: activeTab === 'fuel' ? 'var(--primary-blue)' : 'var(--gray-500)',
                        borderBottom: activeTab === 'fuel' ? '2px solid var(--primary-blue)' : '2px solid transparent',
                        cursor: 'pointer'
                    }}
                >
                    Fuel Logs
                </button>
            </div>

            <div className="toolbar">
                <div className="search-container">
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        className="search-input"
                        placeholder={`Search ${activeTab === 'expenses' ? 'expenses' : 'fuel logs'}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="toolbar-actions">
                    <button className="btn btn-secondary" onClick={fetchData}>
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                    <button className="btn btn-primary">
                        <Plus size={16} />
                        New {activeTab === 'expenses' ? 'Expense' : 'Fuel Log'}
                    </button>
                </div>
            </div>

            <div className="table-container">
                {loading ? (
                    <div className="loading">
                        <div className="spinner"></div>
                    </div>
                ) : activeTab === 'expenses' ? (
                    filteredExpenses.length === 0 ? (
                        <div className="empty-state">
                            <DollarSign size={48} />
                            <p>No expenses found</p>
                        </div>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Category</th>
                                    <th>Amount</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredExpenses.map((expense) => (
                                    <tr key={expense.id}>
                                        <td>#{expense.id}</td>
                                        <td>{expense.category}</td>
                                        <td style={{ fontWeight: 600 }}>${expense.amount?.toLocaleString() || '0'}</td>
                                        <td>{expense.description}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )
                ) : (
                    filteredFuelLogs.length === 0 ? (
                        <div className="empty-state">
                            <DollarSign size={48} />
                            <p>No fuel logs found</p>
                        </div>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Vehicle ID</th>
                                    <th>Gallons/Liters</th>
                                    <th>Total Cost</th>
                                    <th>Station</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFuelLogs.map((log) => (
                                    <tr key={log.id}>
                                        <td>#{log.id}</td>
                                        <td>{log.vehicle_id}</td>
                                        <td>{log.gallons}</td>
                                        <td style={{ fontWeight: 600 }}>${log.total_cost?.toLocaleString() || '0'}</td>
                                        <td>{log.station_name}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )
                )}
            </div>
        </div>
    )
}

export default Finance
