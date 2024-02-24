import React from 'react'

const AnimatedDataCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color = 'primary',
  delay = 0,
  className = '' 
}) => {
  const colorClasses = {
    primary: 'text-primary-400',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    danger: 'text-red-400',
    info: 'text-cyan-400'
  }

  const bgColorClasses = {
    primary: 'bg-primary-400/10',
    success: 'bg-green-400/10',
    warning: 'bg-yellow-400/10',
    danger: 'bg-red-400/10',
    info: 'bg-cyan-400/10'
  }

  return (
    <div 
      className={`glass-card p-6 hover-lift animate-fade-in-up ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg ${bgColorClasses[color]} flex items-center justify-center animate-float`}>
          <Icon className={`h-6 w-6 ${colorClasses[color]}`} />
        </div>
        {change && (
          <div className={`text-sm font-medium ${
            change > 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {change > 0 ? '+' : ''}{change}%
          </div>
        )}
      </div>
      
      <h3 className="text-lg font-semibold text-gray-300 mb-2 animate-slide-in-left">
        {title}
      </h3>
      
      <div className={`text-3xl font-bold ${colorClasses[color]} animate-scale-in`}>
        {value}
      </div>
    </div>
  )
}

export default AnimatedDataCard 