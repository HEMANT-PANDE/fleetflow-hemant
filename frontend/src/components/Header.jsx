import { Truck } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

function Header() {
  const location = useLocation()

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard'
    }
    return location.pathname === path
  }

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/vehicles', label: 'Vehicle Registry' },
    { path: '/trips', label: 'Trip Dispatcher' },
    { path: '/maintenance', label: 'Maintenance' },
    { path: '/expenses', label: 'Trip & Expense' },
    { path: '/drivers', label: 'Performance' },
    { path: '/analytics', label: 'Analytics' },
  ]

  return (
    <header className="header">
      <div className="header-left">
        <div className="header-logo">
          <Truck size={28} />
          <h1>Fleet<span>Flow</span></h1>
        </div>
        <nav className="header-nav">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${isActive(link.path) ? 'nav-link-active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="header-status">
        <div className="status-indicator"></div>
        <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>System Online</span>
      </div>
    </header>
  )
}

export default Header
