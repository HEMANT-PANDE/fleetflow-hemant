import { useState, useEffect } from 'react'
import { Plus, Search, Users } from 'lucide-react'
import { driverApi } from '../services/api'

function Drivers() {
    const [drivers, setDrivers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchDrivers()
    }, [])

    const fetchDrivers = async () => {
        try {
            setLoading(true)
            const data = await driverApi.getAll()
            setDrivers(data)
        } catch (error) {
            console.error('Failed to fetch drivers:', error)
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
            'available': 'status-idle',
            'on_trip': 'status-active',
            'off_duty': 'status-retired'
        }
        return statusMap[status?.toLowerCase()] || 'status-maintenance'
    }

    const filteredDrivers = drivers.filter(driver =>
        driver.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.license_number?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div>
            <div className="page-header">
                <h2 className="page-title">Driver Management</h2>
            </div>

            <div className="toolbar">
                <div className="search-container">
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search by name or license..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="toolbar-actions">
                    <button className="btn btn-primary">
                        <Plus size={16} />
                        New Driver
                    </button>
                </div>
            </div>

            <div className="table-container">
                {loading ? (
                    <div className="loading">
                        <div className="spinner"></div>
                    </div>
                ) : filteredDrivers.length === 0 ? (
                    <div className="empty-state">
                        <Users size={48} />
                        <p>No drivers found</p>
                    </div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>License Number</th>
                                <th>Contact</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDrivers.map((driver) => (
                                <tr key={driver.id}>
                                    <td>#{driver.id}</td>
                                    <td style={{ fontWeight: 500 }}>{driver.name}</td>
                                    <td>{driver.license_number}</td>
                                    <td>{driver.phone_number || '-'}</td>
                                    <td>
                                        <span className={`status-badge ${getStatusClass(driver.status)}`}>
                                            {formatStatus(driver.status)}
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

export default Drivers
