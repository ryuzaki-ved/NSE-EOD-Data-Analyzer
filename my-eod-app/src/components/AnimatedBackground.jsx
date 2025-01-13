import React, { useEffect, useRef } from 'react'

const AnimatedBackground = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationFrameId
    let width = window.innerWidth
    let height = window.innerHeight

    canvas.width = width
    canvas.height = height

    const particles = []
    const particleCount = 50
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        color: Math.random() > 0.5 ? '#0ea5e9' : '#8b5cf6' // Primary blue or purple
      })
    }

    const drawGrid = (offset) => {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)'
      ctx.lineWidth = 1
      const gridSize = 50
      
      // Vertical lines
      for (let x = offset % gridSize; x < width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }

      // Horizontal lines
      for (let y = offset % gridSize; y < height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }
    }

    let time = 0
    const render = () => {
      time += 0.2
      ctx.clearRect(0, 0, width, height)
      
      // Draw moving grid
      drawGrid(time)

      // Update and draw particles
      particles.forEach((p, i) => {
        p.x += p.vx
        p.y += p.vy

        // Bounce off walls
        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1

        // Draw particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.fill()

        // Connect particles
        particles.forEach((p2, j) => {
          if (i === j) return
          const dx = p.x - p2.x
          const dy = p.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 150) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(139, 92, 246, ${0.1 * (1 - dist / 150)})`
            ctx.lineWidth = 0.5
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        })
      })

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    const handleResize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none opacity-60"
      style={{ background: 'radial-gradient(circle at 50% 50%, #0f172a 0%, #020617 100%)' }}
    />
  )
}

export default AnimatedBackground
