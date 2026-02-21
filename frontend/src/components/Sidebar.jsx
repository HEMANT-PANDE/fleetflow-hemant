import { Truck, MapPin, Wrench, Users, Receipt, BarChart3 } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

function Sidebar() {
  const location = useLocation()
  
  const isActive = (path) => {
    if (path === '/vehicles') {
      return location.pathname === '/' || location.pathname === '/vehicles'
    }
    return location.pathname === path
  }

  const navLinks = [
    { path: '/vehicles', label: 'Vehicles', icon: Truck },
    { path: '/trips', label: 'Trips', icon: MapPin },
    { path: '/maintenance', label: 'Maintenance', icon: Wrench },
    { path: '/drivers', label: 'Drivers', icon: Users },
    { path: '/expenses', label: 'Expenses', icon: Receipt },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Truck size={28} className="sidebar-logo-icon" />
        <h1 className="sidebar-title">Fleet<span>Flow</span></h1>
      </div>
      
      <nav className="sidebar-nav">
        {navLinks.map(link => {
          const Icon = link.icon
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`sidebar-link ${isActive(link.path) ? 'sidebar-link-active' : ''}`}
            >
              <Icon size={20} />
              <span>{link.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="status-indicator"></div>
        <span>System Online</span>
      </div>
    </aside>
  )
}

export default Sidebar
