import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import PageTransition from './components/PageTransition'
import HomePage from './pages/HomePage'
import FIIDerivStatsPage from './pages/FIIDerivStatsPage'
import PartOIPage from './pages/PartOIPage'
import PartVolPage from './pages/PartVolPage'
import CorrelationPage from './pages/CorrelationPage'
import AdvancedMathPage from './pages/AdvancedMathPage'

function App() {
  return (
    <div className="min-h-screen flex flex-col relative">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
        <Routes>
          <Route path="/" element={
            <PageTransition>
              <HomePage />
            </PageTransition>
          } />
          <Route path="/fii-deriv-stats" element={
            <PageTransition>
              <FIIDerivStatsPage />
            </PageTransition>
          } />
          <Route path="/part-oi" element={
            <PageTransition>
              <PartOIPage />
            </PageTransition>
          } />
          <Route path="/part-vol" element={
            <PageTransition>
              <PartVolPage />
            </PageTransition>
          } />
          <Route path="/correlation" element={
            <PageTransition>
              <CorrelationPage />
            </PageTransition>
          } />
          <Route path="/advanced-math" element={
            <PageTransition>
              <AdvancedMathPage />
            </PageTransition>
          } />
        </Routes>
      </main>
    </div>
  )
}

export default App