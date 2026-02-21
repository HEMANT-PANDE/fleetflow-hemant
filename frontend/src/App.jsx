import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import VehicleRegistry from './pages/VehicleRegistry'
import TripManagement from './pages/TripManagement'
import MaintenanceLogs from './pages/MaintenanceLogs'
import DriverProfiles from './pages/DriverProfiles'
import ExpenseLogging from './pages/ExpenseLogging'
import Analytics from './pages/Analytics'

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<VehicleRegistry />} />
            <Route path="/vehicles" element={<VehicleRegistry />} />
            <Route path="/trips" element={<TripManagement />} />
            <Route path="/maintenance" element={<MaintenanceLogs />} />
            <Route path="/drivers" element={<DriverProfiles />} />
            <Route path="/expenses" element={<ExpenseLogging />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
