import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Header from './components/Header'
import VehicleRegistry from './pages/VehicleRegistry'
import TripManagement from './pages/TripManagement'
import MaintenanceLogs from './pages/MaintenanceLogs'
import DriverProfiles from './pages/DriverProfiles'
import ExpenseLogging from './pages/ExpenseLogging'
import Analytics from './pages/Analytics'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'

function AppContent() {
  const location = useLocation()
  const authPages = ['/', '/login', '/register', '/forgot-password', '/reset-password']
  const isAuthPage = authPages.includes(location.pathname)

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    )
  }

  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/vehicles" element={<VehicleRegistry />} />
          <Route path="/trips" element={<TripManagement />} />
          <Route path="/maintenance" element={<MaintenanceLogs />} />
          <Route path="/drivers" element={<DriverProfiles />} />
          <Route path="/expenses" element={<ExpenseLogging />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
