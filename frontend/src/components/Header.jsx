import { Truck } from 'lucide-react'

function Header() {
  return (
    <header className="header">
      <div className="header-logo">
        <Truck size={28} />
        <h1>Fleet<span>Flow</span></h1>
      </div>
      <div className="header-status">
        <div className="status-indicator"></div>
        <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>System Online</span>
      </div>
    </header>
  )
}

export default Header
