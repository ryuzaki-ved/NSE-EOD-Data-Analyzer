import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import FIIDerivStatsPage from './pages/FIIDerivStatsPage'
import PartOIPage from './pages/PartOIPage'
import PartVolPage from './pages/PartVolPage'
import CorrelationPage from './pages/CorrelationPage'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/fii-deriv-stats" element={<FIIDerivStatsPage />} />
          <Route path="/part-oi" element={<PartOIPage />} />
          <Route path="/part-vol" element={<PartVolPage />} />
          <Route path="/correlation" element={<CorrelationPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App