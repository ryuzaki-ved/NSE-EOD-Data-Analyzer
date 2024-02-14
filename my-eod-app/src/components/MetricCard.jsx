import React from 'react'

const MetricCard = ({ title, value, change, icon: Icon, color = 'primary' }) => {
  const colorClasses = {
    primary: 'text-primary-400 bg-primary-500/10 border-primary-500/20',
    green: 'text-green-400 bg-green-500/10 border-green-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  }

  const formatValue = (val) => {
    if (typeof val === 'number') {
      if (val >= 1e9) return `₹${(val / 1e9).toFixed(1)}B`
      if (val >= 1e6) return `₹${(val / 1e6).toFixed(1)}M`
      if (val >= 1e3) return `₹${(val / 1e3).toFixed(1)}K`
      return new Intl.NumberFormat('en-IN').format(val)
    }
    return val
  }

  return (
    <div className={`metric-card border ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${colorClasses[color].split(' ')[1]}`}>
          <Icon className={`h-5 w-5 ${colorClasses[color].split(' ')[0]}`} />
        </div>
        {change && (
          <span className={`text-xs px-2 py-1 rounded-full ${
            change > 0 ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'
          }`}>
            {change > 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold mb-1">{formatValue(value)}</div>
      <div className="text-sm text-gray-400">{title}</div>
    </div>
  )
}

export default MetricCard