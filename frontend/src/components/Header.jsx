import { Truck } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

function Header() {
  const location = useLocation()

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/vehicles', label: 'Vehicles' },
    { path: '/dispatch', label: 'Dispatch' },
    { path: '/drivers', label: 'Drivers' },
    { path: '/maintenance', label: 'Maintenance' },
    { path: '/finance', label: 'Finance' },
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

      <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              textDecoration: 'none',
              color: location.pathname === item.path ? 'var(--primary-blue)' : 'var(--gray-600)',
              fontWeight: location.pathname === item.path ? 600 : 500,
              fontSize: '0.875rem',
              transition: 'color 0.2s'
            }}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="header-status">
        <div className="status-indicator"></div>
        <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>System Online</span>
      </div>
    </header>
  )
}

export default Header
