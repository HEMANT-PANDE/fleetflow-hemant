import { Truck } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

function Header() {
  const location = useLocation()
  
  const isActive = (path) => {
    if (path === '/vehicles') {
      return location.pathname === '/' || location.pathname === '/vehicles'
    }
    return location.pathname === path
  }

  return (
    <header className="header">
      <div className="header-logo">
        <Truck size={28} />
        <h1>Fleet<span>Flow</span></h1>
      </div>
      
      <nav className="header-nav">
        <Link 
          to="/vehicles" 
          className={`nav-link ${isActive('/vehicles') ? 'active' : ''}`}
        >
          Vehicles
        </Link>
        <Link 
          to="/trips" 
          className={`nav-link ${isActive('/trips') ? 'active' : ''}`}
        >
          Trips
        </Link>
        <Link 
          to="/maintenance" 
          className={`nav-link ${isActive('/maintenance') ? 'active' : ''}`}
        >
          Maintenance
        </Link>
        <Link 
          to="/drivers" 
          className={`nav-link ${isActive('/drivers') ? 'active' : ''}`}
        >
          Drivers
        </Link>
      </nav>

      <div className="header-status">
        <div className="status-indicator"></div>
        <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>System Online</span>
      </div>
    </header>
  )
}

export default Header
