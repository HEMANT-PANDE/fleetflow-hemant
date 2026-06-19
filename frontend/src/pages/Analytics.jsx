import { useState, useEffect } from 'react'
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { TrendingUp, TrendingDown, Fuel, DollarSign, Truck, MapPin, Download } from 'lucide-react'
import api from '../services/api'

// ─── KPI Card Component ────────────────────────────────
function KpiCard({ icon: Icon, label, value, change, changeType, color }) {
    return (
        <div className="kpi-card">
            <div className="kpi-icon" style={{ background: `${color}15`, color }}>
                <Icon size={22} />
            </div>
            <div className="kpi-info">
                <span className="kpi-label">{label}</span>
                <span className="kpi-value">{value}</span>
                {change && (
                    <span className={`kpi-change ${changeType === 'up' ? 'kpi-up' : 'kpi-down'}`}>
                        {changeType === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {change}
                    </span>
                )}
            </div>
        </div>
    )
}

// ─── Chart Card Component ───────────────────────────────
function ChartCard({ title, children, span }) {
    return (
        <div className={`chart-card ${span === 2 ? 'chart-span-2' : ''}`}>
            <h3 className="chart-title">{title}</h3>
            <div className="chart-body">
                {children}
            </div>
        </div>
    )
}

// ─── Main Page ─────────────────────────────────────────
function Analytics() {
    const [dashboard, setDashboard] = useState(null)
    const [fuelReport, setFuelReport] = useState(null)
    const [roiReport, setRoiReport] = useState([])
    const [expensesReport, setExpensesReport] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showExportDropdown, setShowExportDropdown] = useState(false)

    useEffect(() => {
        fetchAnalytics()
    }, [])

    const fetchAnalytics = async () => {
        try {
            setLoading(true)
            const [dashRes, fuelRes, roiRes, expRes] = await Promise.all([
                api.get('/analytics/dashboard').catch(() => ({ data: null })),
                api.get('/analytics/fuel-efficiency').catch(() => ({ data: null })),
                api.get('/analytics/vehicle-roi').catch(() => ({ data: [] })),
                api.get('/analytics/expenses').catch(() => ({ data: null }))
            ])

            setDashboard(dashRes.data)
            setFuelReport(fuelRes.data)
            setRoiReport(roiRes.data)
            setExpensesReport(expRes.data)
        } catch (error) {
            console.error('Failed to load analytics:', error)
        } finally {
            setLoading(false)
        }
    }

    const triggerCSVDownload = (type) => {
        // Trigger file download using iframe or direct link
        window.open(`/api/analytics/export/${type}/csv`, '_blank')
        setShowExportDropdown(false)
    }

    // --- Format Data for Charts ---

    // 1. Fuel efficiency per vehicle (km/L)
    const fuelEfficiencyData = fuelReport?.vehicles?.map(v => ({
        name: v.registration_number.split('-').slice(-2).join('-'), // Short plate name
        efficiency: v.fuel_efficiency_km_per_liter
    })) || [
        { name: 'TRK-9999', efficiency: 8.2 },
        { name: 'VN-4444', efficiency: 7.8 },
        { name: 'TRK-1111', efficiency: 8.5 }
    ]

    // 2. Costliest vehicles (Total Operational Cost)
    const costliestVehiclesData = roiReport.length > 0 
        ? [...roiReport].sort((a, b) => b.total_expenses - a.total_expenses).slice(0, 5).map(v => ({
            name: v.registration_number.split('-').slice(-2).join('-'),
            cost: v.total_expenses
          }))
        : [
            { name: 'TRK-9999', cost: 65000 },
            { name: 'TRK-1111', cost: 12000 }
          ]

    // 3. Revenue vs Operating Cost per vehicle
    const revenueVsCostData = roiReport.length > 0
        ? roiReport.map(v => ({
            name: v.registration_number.split('-').slice(-2).join('-'),
            revenue: v.total_revenue,
            cost: v.total_expenses
          }))
        : [
            { name: 'TRK-9999', revenue: 150000, cost: 65000 },
            { name: 'VN-4444', revenue: 25000, cost: 12000 }
          ]

    // 4. Vehicle Status Distribution
    const vehicleStatusData = dashboard 
        ? [
            { name: 'Available', value: dashboard.vehicles_available || 0, color: '#10b981' },
            { name: 'On Trip', value: dashboard.vehicles_in_use || 0, color: '#3b82f6' },
            { name: 'In Shop', value: dashboard.vehicles_in_shop || 0, color: '#f59e0b' },
            { name: 'Retired', value: dashboard.total_vehicles - dashboard.vehicles_available - dashboard.vehicles_in_use - dashboard.vehicles_in_shop || 0, color: '#ef4444' }
          ]
        : [
            { name: 'Available', value: 2, color: '#10b981' },
            { name: 'On Trip', value: 1, color: '#3b82f6' },
            { name: 'In Shop', value: 1, color: '#f59e0b' },
            { name: 'Retired', value: 1, color: '#ef4444' }
          ]

    // 5. Expense Breakdown
    const expenseBreakdownData = expensesReport?.expense_by_category?.map(e => ({
        name: e.category,
        value: e.percentage_of_total,
        color: e.category.toLowerCase() === 'fuel' ? '#f59e0b' : '#3b82f6'
    })) || [
        { name: 'Fuel', value: 75, color: '#f59e0b' },
        { name: 'Maintenance', value: 25, color: '#3b82f6' }
    ]

    // 6. Dynamic Financial Table Rows
    const financialSummaryData = roiReport.length > 0
        ? roiReport.map(v => ({
            vehicle: v.registration_number,
            model: v.model,
            revenue: `₹${v.total_revenue.toLocaleString()}`,
            expenses: `₹${v.total_expenses.toLocaleString()}`,
            depreciation: `₹${v.depreciation.toLocaleString()}`,
            netProfit: `₹${v.net_profit.toLocaleString()}`
          }))
        : [
            { vehicle: 'MH-12-TR-9999', model: 'Tata Prima 2022', revenue: '₹1,50,000', expenses: '₹65,000', depreciation: '₹4,00,000', netProfit: '₹85,000' }
          ]

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                <h2 className="page-title">Operational Analytics & Financial Reports</h2>
                <div>
                    <button 
                        className="btn btn-primary"
                        onClick={() => setShowExportDropdown(!showExportDropdown)}
                    >
                        <Download size={16} />
                        Export Report
                    </button>
                    {showExportDropdown && (
                        <div style={{
                            position: 'absolute', right: 0, top: '40px', background: 'white',
                            border: '1px solid var(--gray-200)', borderRadius: '0.5rem',
                            boxShadow: 'var(--shadow-lg)', zIndex: 100, display: 'flex', flexDirection: 'column', width: '220px'
                        }}>
                            <button 
                                onClick={() => triggerCSVDownload('fuel-efficiency')}
                                style={{ padding: '0.75rem 1rem', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', hover: 'background: var(--gray-50)', fontSize: '0.875rem' }}
                            >
                                Fuel Efficiency Report (CSV)
                            </button>
                            <button 
                                onClick={() => triggerCSVDownload('vehicle-roi')}
                                style={{ padding: '0.75rem 1rem', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', borderTop: '1px solid var(--gray-100)', fontSize: '0.875rem' }}
                            >
                                Vehicle ROI Report (CSV)
                            </button>
                            <button 
                                onClick={() => triggerCSVDownload('expenses')}
                                style={{ padding: '0.75rem 1rem', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', borderTop: '1px solid var(--gray-100)', fontSize: '0.875rem' }}
                            >
                                Operational Expenses (CSV)
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="loading">
                    <div className="spinner"></div>
                </div>
            ) : (
                <>
                    {/* ── KPI Cards ──────────────────────────── */}
                    <div className="kpi-grid">
                        <KpiCard
                            icon={Fuel}
                            label="Total Fuel Cost"
                            value={dashboard ? `₹${dashboard.total_fuel_cost_this_month?.toLocaleString()}` : '₹0'}
                            color="#f59e0b"
                        />
                        <KpiCard
                            icon={DollarSign}
                            label="Total Operational Cost"
                            value={dashboard ? `₹${dashboard.total_expenses_this_month?.toLocaleString()}` : '₹0'}
                            color="#10b981"
                        />
                        <KpiCard
                            icon={Truck}
                            label="Utilization Rate"
                            value={dashboard ? `${dashboard.utilization_rate_percentage}%` : '0%'}
                            color="#3b82f6"
                        />
                        <KpiCard
                            icon={MapPin}
                            label="Total Distance"
                            value={dashboard ? `${dashboard.total_distance_this_month_km?.toLocaleString()} km` : '0 km'}
                            color="#8b5cf6"
                        />
                    </div>

                    {/* ── Charts Grid ────────────────────────── */}
                    <div className="charts-grid">

                        {/* Chart 1: Fuel Efficiency Trend */}
                        <ChartCard title="Fuel Efficiency per Vehicle (km/L)">
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={fuelEfficiencyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="name" fontSize={12} tick={{ fill: '#6b7280' }} />
                                    <YAxis fontSize={12} tick={{ fill: '#6b7280' }} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                                    <Bar dataKey="efficiency" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>

                        {/* Chart 2: Top 5 Costliest Vehicles */}
                        <ChartCard title="Vehicle Operational Expenses (₹)">
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={costliestVehiclesData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis type="number" fontSize={12} tick={{ fill: '#6b7280' }} />
                                    <YAxis dataKey="name" type="category" fontSize={12} tick={{ fill: '#6b7280' }} width={70} />
                                    <Tooltip
                                        formatter={(val) => [`₹${val.toLocaleString()}`, 'Total Cost']}
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                    />
                                    <Bar dataKey="cost" fill="#ef4444" radius={[0, 6, 6, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>

                        {/* Chart 3: Revenue vs Cost */}
                        <ChartCard title="Revenue vs Operating Cost" span={2}>
                            <ResponsiveContainer width="100%" height={250}>
                                <AreaChart data={revenueVsCostData}>
                                    <defs>
                                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="name" fontSize={12} tick={{ fill: '#6b7280' }} />
                                    <YAxis fontSize={12} tick={{ fill: '#6b7280' }} />
                                    <Tooltip
                                        formatter={(val) => `₹${val.toLocaleString()}`}
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                    />
                                    <Legend />
                                    <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#revGrad)" strokeWidth={2} />
                                    <Area type="monotone" dataKey="cost" stroke="#ef4444" fillOpacity={1} fill="url(#costGrad)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </ChartCard>

                        {/* Chart 4: Vehicle Status Distribution */}
                        <ChartCard title="Vehicle Status Distribution">
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie data={vehicleStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                                        {vehicleStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartCard>

                        {/* Chart 5: Expense Breakdown */}
                        <ChartCard title="Expense Category Breakdown">
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie data={expenseBreakdownData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name} ${value?.toFixed(0)}%`} fontSize={11}>
                                        {expenseBreakdownData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartCard>

                    </div>

                    {/* ── Financial Summary Table ───────────── */}
                    <div style={{ marginTop: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--gray-800)' }}>Financial Summary per Vehicle</h3>
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Vehicle Reg</th>
                                        <th>Model</th>
                                        <th>Revenue</th>
                                        <th>Expenses</th>
                                        <th>Depreciation</th>
                                        <th>Net Profit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {financialSummaryData.map((row, i) => (
                                        <tr key={i}>
                                            <td style={{ fontWeight: 500 }}>{row.vehicle}</td>
                                            <td>{row.model}</td>
                                            <td style={{ color: 'var(--primary-green)' }}>{row.revenue}</td>
                                            <td>{row.expenses}</td>
                                            <td>{row.depreciation}</td>
                                            <td style={{ fontWeight: 600, color: 'var(--primary-green)' }}>{row.netProfit}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default Analytics
