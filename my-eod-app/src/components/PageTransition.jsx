import React from 'react'

const PageTransition = ({ children, className = '' }) => {
  return (
    <div className={`animate-page-enter ${className}`}>
      {children}
    </div>
  )
}

export default PageTransition 