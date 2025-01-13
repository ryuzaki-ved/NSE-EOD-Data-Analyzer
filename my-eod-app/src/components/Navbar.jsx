import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { TrendingUp, BarChart3, PieChart, Activity, Brain, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

const Navbar = () => {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Home', icon: TrendingUp },
    { path: '/fii-deriv-stats', label: 'FII Stats', icon: BarChart3 },
    { path: '/part-oi', label: 'Part OI', icon: PieChart },
    { path: '/part-vol', label: 'Part Vol', icon: Activity },
    { path: '/correlation', label: 'Correlation', icon: Zap },
    { path: '/advanced-math', label: 'Adv Math', icon: Brain },
  ]

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
      className="sticky top-4 z-50 mx-4 mb-8"
    >
      <div className="glass-card px-6 py-3 flex items-center justify-between max-w-7xl mx-auto bg-dark-900/60 border-primary-500/20">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-primary-500 blur-lg opacity-50 group-hover:opacity-100 transition-opacity duration-500 rounded-full"></div>
            <TrendingUp className="h-8 w-8 text-primary-400 relative z-10 transform group-hover:rotate-12 transition-transform duration-500" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-primary-200 to-primary-400 bg-clip-text text-transparent tracking-tight">
            EOD<span className="font-light text-primary-400">Analytics</span>
          </h1>
        </Link>
        
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className="relative px-4 py-2 rounded-xl group transition-all duration-300"
              >
                {isActive && (
                  <motion.div
                    layoutId="navbar-active"
                    className="absolute inset-0 bg-primary-500/10 border border-primary-500/30 rounded-xl shadow-[0_0_20px_rgba(14,165,233,0.3)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className={`relative z-10 flex items-center space-x-2 text-sm font-medium transition-colors duration-300 ${isActive ? 'text-primary-300' : 'text-slate-400 group-hover:text-white'}`}>
                  <Icon className={`h-4 w-4 ${isActive ? 'text-primary-400' : 'text-slate-500 group-hover:text-primary-400'} transition-colors`} />
                  <span className="hidden md:inline">{label}</span>
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </motion.nav>
  )
}

export default Navbar