import React from 'react'

const AnimatedLoader = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className={`${sizeClasses[size]} relative`}>
        {/* Outer ring */}
        <div className="absolute inset-0 border-4 border-primary-600/20 rounded-full"></div>
        
        {/* Animated ring */}
        <div className="absolute inset-0 border-4 border-transparent border-t-primary-400 rounded-full animate-spin"></div>
        
        {/* Inner pulse */}
        <div className="absolute inset-2 bg-primary-400/20 rounded-full animate-pulse"></div>
        
        {/* Center dot */}
        <div className="absolute inset-4 bg-primary-400 rounded-full animate-pulse-slow"></div>
      </div>
      
      {text && (
        <div className="text-center">
          <p className="text-gray-400 animate-pulse-slow">{text}</p>
          <div className="flex space-x-1 mt-2 justify-center">
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AnimatedLoader 