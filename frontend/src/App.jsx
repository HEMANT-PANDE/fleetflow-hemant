import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import VehicleRegistry from './pages/VehicleRegistry'
import Dispatch from './pages/Dispatch'
import Drivers from './pages/Drivers'
import Maintenance from './pages/Maintenance'
import Finance from './pages/Finance'

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/vehicles" element={<VehicleRegistry />} />
            <Route path="/dispatch" element={<Dispatch />} />
            <Route path="/drivers" element={<Drivers />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/finance" element={<Finance />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
