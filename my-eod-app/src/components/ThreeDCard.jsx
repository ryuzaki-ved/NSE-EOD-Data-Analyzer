import React, { useRef } from 'react'
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion'

const ThreeDCard = ({ children, className = "", onClick }) => {
  const ref = useRef(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x)
  const mouseYSpring = useSpring(y)

  const rotateX = useMotionTemplate`${mouseYSpring}deg`
  const rotateY = useMotionTemplate`${mouseXSpring}deg`

  const handleMouseMove = (e) => {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()

    const width = rect.width
    const height = rect.height

    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5

    x.set(xPct * 10) // Reduced tilt intensity
    y.set(yPct * -10)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transformStyle: "preserve-3d",
        rotateX,
        rotateY,
      }}
      className={`relative transition-all duration-200 ease-out ${className}`}
    >
      {children}
    </motion.div>
  )
}

export default ThreeDCard
