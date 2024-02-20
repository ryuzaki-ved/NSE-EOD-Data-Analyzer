import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { TrendingUp, BarChart3, PieChart, Activity } from 'lucide-react'

const Navbar = () => {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Home', icon: TrendingUp },
    { path: '/fii-deriv-stats', label: 'FII Deriv Stats', icon: BarChart3 },
    { path: '/part-oi', label: 'Part OI', icon: PieChart },
    { path: '/part-vol', label: 'Part Vol', icon: Activity },
    { path: '/correlation', label: 'Correlation', icon: BarChart3 },
  ]

  return (
    <nav className="glass-card mx-4 mt-4 p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-8 w-8 text-primary-400" />
          <h1 className="text-2xl font-bold gradient-text">EOD Analytics</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`nav-link flex items-center space-x-2 ${
                location.pathname === path ? 'active' : ''
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}

export default Navbar