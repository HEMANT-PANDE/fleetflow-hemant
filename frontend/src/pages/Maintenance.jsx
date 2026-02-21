import { useState, useEffect } from 'react'
import { Plus, Search, Wrench } from 'lucide-react'
import { maintenanceApi } from '../services/api'

function Maintenance() {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchLogs()
    }, [])

    const fetchLogs = async () => {
        try {
            setLoading(true)
            const data = await maintenanceApi.getAll()
            setLogs(data)
        } catch (error) {
            console.error('Failed to fetch maintenance logs:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatStatus = (status) => {
        if (!status) return 'Unknown'
        return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }

    const getStatusClass = (status) => {
        const statusMap = {
            'scheduled': 'status-maintenance',
            'in_progress': 'status-active',
            'completed': 'status-idle',
            'cancelled': 'status-retired'
        }
        return statusMap[status?.toLowerCase()] || 'status-maintenance'
    }

    const filteredLogs = logs.filter(log =>
        log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.service_provider?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div>
            <div className="page-header">
                <h2 className="page-title">Maintenance Logs</h2>
            </div>

            <div className="toolbar">
                <div className="search-container">
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search logs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="toolbar-actions">
                    <button className="btn btn-primary">
                        <Plus size={16} />
                        New Log
                    </button>
                </div>
            </div>

            <div className="table-container">
                {loading ? (
                    <div className="loading">
                        <div className="spinner"></div>
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="empty-state">
                        <Wrench size={48} />
                        <p>No maintenance logs found</p>
                    </div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Log ID</th>
                                <th>Vehicle ID</th>
                                <th>Type</th>
                                <th>Description</th>
                                <th>Cost</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map((log) => (
                                <tr key={log.id}>
                                    <td>#{log.id}</td>
                                    <td>{log.vehicle_id}</td>
                                    <td>{log.maintenance_type}</td>
                                    <td>{log.description}</td>
                                    <td>${log.cost?.toLocaleString() || '0'}</td>
                                    <td>
                                        <span className={`status-badge ${getStatusClass(log.status)}`}>
                                            {formatStatus(log.status)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}

export default Maintenance
