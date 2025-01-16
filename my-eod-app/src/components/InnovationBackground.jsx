import React, { useEffect, useRef } from 'react'

const InnovationBackground = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationFrameId
    let width = window.innerWidth
    let height = window.innerHeight

    canvas.width = width
    canvas.height = height

    // 3D Point Class for Sphere
    class Point {
      constructor(x, y, z) {
        this.x = x
        this.y = y
        this.z = z
        this.baseX = x
        this.baseY = y
        this.baseZ = z
      }

      rotate(angleX, angleY) {
        // Rotate around Y
        let cosY = Math.cos(angleY)
        let sinY = Math.sin(angleY)
        let x1 = this.x * cosY - this.z * sinY
        let z1 = this.z * cosY + this.x * sinY

        // Rotate around X
        let cosX = Math.cos(angleX)
        let sinX = Math.sin(angleX)
        let y1 = this.y * cosX - z1 * sinX
        let z2 = z1 * cosX + this.y * sinX

        this.x = x1
        this.y = y1
        this.z = z2
      }

      project(width, height, fov) {
        const scale = fov / (fov + this.z + 400) // Add offset to z to push it back
        const x2d = this.x * scale + width / 2
        const y2d = this.y * scale + height / 2
        return { x: x2d, y: y2d, scale }
      }
    }

    // Initialize Points for a Sphere
    const points = []
    const numPoints = 100
    const radius = Math.min(width, height) * 0.3

    for (let i = 0; i < numPoints; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos((Math.random() * 2) - 1)
      
      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.sin(phi) * Math.sin(theta)
      const z = radius * Math.cos(phi)
      
      points.push(new Point(x, y, z))
    }

    // Floating Data Particles (Binary/Symbols)
    const dataParticles = []
    const numDataParticles = 50
    const symbols = ['0', '1', 'BUY', 'SELL', '▲', '▼', '∑', 'μ', 'σ']
    
    for(let i=0; i<numDataParticles; i++) {
        dataParticles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            z: Math.random() * 500, // Depth
            speed: Math.random() * 1 + 0.2,
            symbol: symbols[Math.floor(Math.random() * symbols.length)],
            opacity: Math.random() * 0.5 + 0.1,
            color: Math.random() > 0.5 ? '#0ea5e9' : '#10b981' // Blue or Green
        })
    }

    // Background Grid Lines (Perspective Floor)
    let gridOffset = 0

    const render = () => {
      ctx.fillStyle = '#020617' // Very dark background
      ctx.fillRect(0, 0, width, height)
      
      // Draw subtle gradient
      const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width)
      gradient.addColorStop(0, '#0f172a')
      gradient.addColorStop(1, '#020617')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      // 1. Draw Perspective Grid Floor
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.1)'
      ctx.lineWidth = 1
      const fov = 300
      const horizon = height * 0.6
      
      gridOffset = (gridOffset + 0.5) % 40
      
      // Vertical lines fanning out
      for (let i = -width; i < width * 2; i += 80) {
          ctx.beginPath()
          ctx.moveTo(i, height)
          ctx.lineTo(width/2 + (i - width/2) * 0.1, horizon)
          ctx.stroke()
      }
      
      // Horizontal moving lines
      for (let z = 0; z < 400; z += 40) {
          const scale = fov / (fov + z - gridOffset)
          const y = horizon + (height - horizon) * ((z - gridOffset + 100) / 500)
          
          if (y > horizon && y < height) {
            ctx.beginPath()
            ctx.moveTo(0, y)
            ctx.lineTo(width, y)
            ctx.strokeStyle = `rgba(56, 189, 248, ${0.1 * (1 - (horizon - y)/height)})`
            ctx.stroke()
          }
      }


      // 2. Rotate and Draw Sphere (The "Core" of data)
      points.forEach(p => {
        p.rotate(0.002, 0.003)
        const projected = p.project(width, height, 600)
        
        // Draw connections
        points.forEach(p2 => {
            const dist = Math.sqrt(Math.pow(p.x - p2.x, 2) + Math.pow(p.y - p2.y, 2) + Math.pow(p.z - p2.z, 2))
            if (dist < radius * 0.4) {
                const alpha = (1 - dist / (radius * 0.4)) * 0.1
                ctx.beginPath()
                ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})` // Purple connections
                ctx.lineWidth = 0.5
                
                const proj2 = p2.project(width, height, 600)
                ctx.moveTo(projected.x, projected.y)
                ctx.lineTo(proj2.x, proj2.y)
                ctx.stroke()
            }
        })

        // Draw Point
        const alpha = (p.z + radius) / (2 * radius) // Fade back points
        ctx.beginPath()
        ctx.arc(projected.x, projected.y, Math.max(0.5, 2 * projected.scale), 0, Math.PI * 2)
        ctx.fillStyle = `rgba(56, 189, 248, ${alpha})` // Blue dots
        ctx.fill()
      })

      // 3. Draw Floating Data Symbols
      ctx.font = '12px "JetBrains Mono", monospace'
      dataParticles.forEach(p => {
          p.y -= p.speed
          if(p.y < -20) {
              p.y = height + 20
              p.x = Math.random() * width
          }
          
          ctx.fillStyle = p.color
          ctx.globalAlpha = p.opacity
          ctx.fillText(p.symbol, p.x, p.y)
          ctx.globalAlpha = 1.0
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
      className="fixed top-0 left-0 w-full h-full -z-20 pointer-events-none"
    />
  )
}

export default InnovationBackground