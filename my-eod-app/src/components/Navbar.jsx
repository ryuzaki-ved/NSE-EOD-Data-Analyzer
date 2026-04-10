import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { TrendingUp, BarChart3, PieChart, Activity, Brain, GitBranch, Layers } from 'lucide-react'
import { motion } from 'framer-motion'

const Navbar = () => {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Overview', icon: Layers },
    { path: '/fii-deriv-stats', label: 'FII Stats', icon: BarChart3 },
    { path: '/part-oi', label: 'Participant OI', icon: PieChart },
    { path: '/part-vol', label: 'Participant Vol', icon: Activity },
    { path: '/correlation', label: 'Correlation', icon: GitBranch },
    { path: '/advanced-math', label: 'Statistical Models', icon: Brain },
  ]

  return (
    <motion.nav 
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-3 z-50 mx-auto w-full max-w-7xl px-4 sm:px-6 mb-6"
    >
      <div className="bg-[#0D121D]/90 backdrop-blur-2xl border border-white/[0.08] rounded-2xl px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-terminal">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 group select-none">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center group-hover:border-emerald-500/60 group-hover:shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all">
            <TrendingUp className="h-4 w-4 text-emerald-400 transform group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-base font-bold text-white tracking-tight">
              NSE <span className="text-emerald-400 font-extrabold">EOD</span>
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              TERMINAL
            </span>
          </div>
        </Link>
        
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-0.5">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className="relative px-3 sm:px-3.5 py-1.5 rounded-xl group transition-all duration-200"
              >
                {isActive && (
                  <motion.div
                    layoutId="navbar-active"
                    className="absolute inset-0 bg-emerald-500/10 border border-emerald-500/30 rounded-xl shadow-[0_0_16px_rgba(16,185,129,0.15)]"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                  />
                )}
                <span className={`relative z-10 flex items-center space-x-2 text-xs sm:text-sm font-medium transition-colors duration-200 ${isActive ? 'text-emerald-300 font-semibold' : 'text-slate-400 group-hover:text-slate-100'}`}>
                  <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'} transition-colors`} />
                  <span className="whitespace-nowrap">{label}</span>
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