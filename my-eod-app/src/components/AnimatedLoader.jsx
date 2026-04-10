import React from 'react'
import { motion } from 'framer-motion'

const AnimatedLoader = ({ size = 'md', text = 'Loading Market Intelligence...' }) => {
  const sizeMap = {
    sm: { container: 'h-10 w-10', ring: 'h-8 w-8', core: 'h-2 w-2', text: 'text-xs' },
    md: { container: 'h-20 w-20', ring: 'h-16 w-16', core: 'h-3.5 w-3.5', text: 'text-sm' },
    lg: { container: 'h-28 w-28', ring: 'h-24 w-24', core: 'h-5 w-5', text: 'text-base' },
    xl: { container: 'h-36 w-36', ring: 'h-32 w-32', core: 'h-7 w-7', text: 'text-lg' }
  }

  const currentSize = sizeMap[size] || sizeMap.md

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 select-none">
      {/* High-Tech Radar & Telemetry Orbit */}
      <div className={`relative ${currentSize.container} flex items-center justify-center`}>
        {/* Outer ambient glow pulse */}
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.15, 0.4, 0.15]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl pointer-events-none"
        />

        {/* Outer Dash Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className={`absolute ${currentSize.ring} rounded-full border border-dashed border-emerald-500/30`}
        />

        {/* Counter-rotating Precision Orbit Ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-2 rounded-full border-t border-r border-cyan-400/40 border-b-transparent border-l-transparent"
        >
          {/* Orbital Satellite Node */}
          <div className="absolute top-0 right-1/2 -mt-1 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
        </motion.div>

        {/* Inner Scanning Arc */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-4 rounded-full border-2 border-transparent border-t-emerald-400 border-l-emerald-400/40 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
        />

        {/* Core Pulsing Indicator */}
        <motion.div
          animate={{
            scale: [0.85, 1.15, 0.85],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={`${currentSize.core} rounded-full bg-emerald-400 shadow-[0_0_14px_#34d399] ring-2 ring-emerald-500/30`}
        />
      </div>

      {/* Terminal Loading Status */}
      {text && (
        <div className="mt-6 flex flex-col items-center space-y-2 text-center">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-mono tracking-widest text-emerald-400/80 uppercase font-medium">
              DATA STREAM ACTIVE
            </span>
          </div>

          <p className={`${currentSize.text} font-medium text-slate-300 tracking-tight`}>
            {text}
          </p>

          <div className="flex items-center space-x-1.5 pt-1">
            <span className="w-1 h-1 rounded-full bg-emerald-400/60 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-1 rounded-full bg-emerald-400/60 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-1 rounded-full bg-emerald-400/60 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}
    </div>
  )
}

export default AnimatedLoader 