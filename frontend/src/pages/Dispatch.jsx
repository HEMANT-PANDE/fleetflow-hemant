import { useState, useEffect } from 'react'
import { Plus, Search, MapPin } from 'lucide-react'
import { dispatchApi } from '../services/api'

function Dispatch() {
    const [trips, setTrips] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchTrips()
    }, [])

    const fetchTrips = async () => {
        try {
            setLoading(true)
            const data = await dispatchApi.getAllTrips()
            setTrips(data)
        } catch (error) {
            console.error('Failed to fetch trips:', error)
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
            'pending': 'status-maintenance',
            'in_progress': 'status-active',
            'completed': 'status-idle',
            'cancelled': 'status-retired'
        }
        return statusMap[status?.toLowerCase()] || 'status-idle'
    }

    const filteredTrips = trips.filter(trip =>
        trip.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.destination?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div>
            <div className="page-header">
                <h2 className="page-title">Trip Dispatch</h2>
            </div>

            <div className="toolbar">
                <div className="search-container">
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search by location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="toolbar-actions">
                    <button className="btn btn-primary">
                        <Plus size={16} />
                        New Trip
                    </button>
                </div>
            </div>

            <div className="table-container">
                {loading ? (
                    <div className="loading">
                        <div className="spinner"></div>
                    </div>
                ) : filteredTrips.length === 0 ? (
                    <div className="empty-state">
                        <MapPin size={48} />
                        <p>No trips found</p>
                    </div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Trip ID</th>
                                <th>Vehicle ID</th>
                                <th>Driver ID</th>
                                <th>Origin</th>
                                <th>Destination</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTrips.map((trip) => (
                                <tr key={trip.id}>
                                    <td>#{trip.id}</td>
                                    <td>{trip.vehicle_id}</td>
                                    <td>{trip.driver_id}</td>
                                    <td>{trip.origin}</td>
                                    <td>{trip.destination}</td>
                                    <td>
                                        <span className={`status-badge ${getStatusClass(trip.status)}`}>
                                            {formatStatus(trip.status)}
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

export default Dispatch
