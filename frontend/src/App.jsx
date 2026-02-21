import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import VehicleRegistry from './pages/VehicleRegistry'

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<VehicleRegistry />} />
            <Route path="/vehicles" element={<VehicleRegistry />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
