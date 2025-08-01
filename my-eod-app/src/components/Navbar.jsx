import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { TrendingUp, BarChart3, PieChart, Activity, Brain } from 'lucide-react'

const Navbar = () => {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Home', icon: TrendingUp },
    { path: '/fii-deriv-stats', label: 'FII Deriv Stats', icon: BarChart3 },
    { path: '/part-oi', label: 'Part OI', icon: PieChart },
    { path: '/part-vol', label: 'Part Vol', icon: Activity },
    { path: '/correlation', label: 'Correlation', icon: BarChart3 },
    { path: '/advanced-math', label: 'Advanced Math', icon: Brain },
  ]

  return (
    <nav className="glass-card mx-4 mt-4 p-4 animate-fade-in-up">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2 animate-slide-in-left">
          <TrendingUp className="h-8 w-8 text-primary-400 animate-float" />
          <h1 className="text-2xl font-bold gradient-text">EOD Analytics</h1>
        </div>
        
        <div className="flex items-center space-x-2 animate-stagger">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`nav-link flex items-center space-x-2 hover-lift ${
                location.pathname === path ? 'active hover-glow' : ''
              }`}
            >
              <Icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}

export default Navbar