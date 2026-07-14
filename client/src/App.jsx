import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app-container">
        <header>
          <nav>
            <h1>CureLink</h1>
          </nav>
        </header>
        
        <main>
          <Routes>
            <Route path="/" element={<h2>Welcome to CureLink (Home Placeholder)</h2>} />
            <Route path="/login" element={<h2>Login Placeholder</h2>} />
            <Route path="/register" element={<h2>Register Placeholder</h2>} />
            <Route path="/pharmacies" element={<h2>Nearby Pharmacies Placeholder</h2>} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
