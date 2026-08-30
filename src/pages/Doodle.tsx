import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Pen, Eraser, RotateCcw, RotateCw, Trash2, Download } from 'lucide-react'
import { gardenService } from '../services/gardenService'
import { useCurrentProfile } from '../hooks/useCurrentProfile'

interface Point {
  x: number
  y: number
}

interface Stroke {
  color: string
  size: number
  points: Point[]
  isEraser: boolean
}

export default function Doodle() {
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const [isDrawing, setIsDrawing] = useState(false)
  const { profile } = useCurrentProfile()
  const [currentColor, setCurrentColor] = useState('#3F3545')
  const [currentSize, setCurrentSize] = useState(4)
  const [isEraser, setIsEraser] = useState(false)
  
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [undoneStrokes, setUndoneStrokes] = useState<Stroke[]>([])
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null)

  const colors = ['#3F3545', '#765A9E', '#E8A8B8', '#A9BEA5', '#F3C969', '#FFF9F3']

  useEffect(() => {
    redrawCanvas()
  }, [strokes, currentStroke])

  const redrawCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const allStrokes = currentStroke ? [...strokes, currentStroke] : strokes

    allStrokes.forEach(stroke => {
      ctx.beginPath()
      ctx.strokeStyle = stroke.isEraser ? '#FFFFFF' : stroke.color
      ctx.lineWidth = stroke.size
      // Optional: Set global composite operation if true eraser is needed, 
      // but drawing white is safer for simple mobile canvas
      
      stroke.points.forEach((point, i) => {
        if (i === 0) {
          ctx.moveTo(point.x, point.y)
        } else {
          ctx.lineTo(point.x, point.y)
        }
      })
      ctx.stroke()
    })
  }

  
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.parentElement?.getBoundingClientRect()
        if (rect) {
          canvasRef.current.width = rect.width * window.devicePixelRatio
          canvasRef.current.height = rect.height * window.devicePixelRatio
          canvasRef.current.style.width = `${rect.width}px`
          canvasRef.current.style.height = `${rect.height}px`
          redrawCanvas()
        }
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [strokes, currentStroke])

  const getCoordinates = (e: React.PointerEvent): Point | null => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height)
    }
  }

  const startDrawing = (e: React.PointerEvent) => {
    e.preventDefault()
    const point = getCoordinates(e)
    if (!point) return

    setIsDrawing(true)
    setCurrentStroke({
      color: currentColor,
      size: currentSize,
      isEraser,
      points: [point]
    })
    setUndoneStrokes([]) // Clear redo history on new stroke
  }

  const draw = (e: React.PointerEvent) => {
    e.preventDefault()
    if (!isDrawing || !currentStroke) return

    const point = getCoordinates(e)
    if (!point) return

    setCurrentStroke(prev => {
      if (!prev) return prev
      return {
        ...prev,
        points: [...prev.points, point]
      }
    })
  }

  const stopDrawing = () => {
    if (!isDrawing || !currentStroke) return
    setIsDrawing(false)
    setStrokes([...strokes, currentStroke])
    setCurrentStroke(null)
    
    if (profile?.relationship_id) {
        gardenService.checkAndUnlockAchievement(
          profile.relationship_id,
          profile.id,
          'Daisy',
          'First Doodle',
          'Moments'
        ).catch(console.error)
      }
  }

  const undo = () => {
    if (strokes.length === 0) return
    const lastStroke = strokes[strokes.length - 1]
    setStrokes(strokes.slice(0, -1))
    setUndoneStrokes([...undoneStrokes, lastStroke])
  }

  const redo = () => {
    if (undoneStrokes.length === 0) return
    const nextStroke = undoneStrokes[undoneStrokes.length - 1]
    setUndoneStrokes(undoneStrokes.slice(0, -1))
    setStrokes([...strokes, nextStroke])
  }

  const clear = () => {
    setStrokes([])
    setUndoneStrokes([])
  }

  const saveSnapshot = () => {
    // In final implementation, this uploads the canvas.toDataURL() to Supabase
    // For now we trigger download to prove it works
    const canvas = canvasRef.current
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `doodle-${Date.now()}.png`
    a.click()
  }

  return (
    <div className="w-full min-h-[100dvh] bg-warmPaper flex flex-col relative pt-safe overflow-hidden">
      
      {/* Header */}
      <div className="px-5 pt-6 pb-2 sticky top-0 bg-warmPaper/90 backdrop-blur-md z-20 flex items-center justify-between">
        <button 
          onClick={() => navigate('/home')}
          className="w-10 h-10 rounded-full bg-warmPaper shadow-sm flex items-center justify-center text-deepPlum/70 hover:text-deepPlum transition-colors"
        >
          <ChevronLeft className="w-5 h-5 -ml-0.5" />
        </button>
        <h1 className="text-xl font-serif text-deepPlum font-medium">Doodle Wall</h1>
        <button 
          onClick={saveSnapshot}
          className="w-10 h-10 rounded-full bg-lavender-soft/20 text-lavender-deep hover:bg-lavender-soft/40 flex items-center justify-center transition-colors"
        >
          <Download className="w-5 h-5" />
        </button>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative w-full touch-none px-4 py-4 flex flex-col">
        <div className="flex-1 w-full relative rounded-3xl bg-[#FFF9F3] border border-lavender-mist/50 shadow-inner overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
        <canvas
          ref={canvasRef}
          
          className="absolute inset-0 touch-none"
          style={{ touchAction: 'none', overscrollBehavior: 'none' }}
          onPointerDown={(e) => { (e.target as HTMLElement).releasePointerCapture(e.pointerId); startDrawing(e); }}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerOut={stopDrawing}
          onPointerCancel={stopDrawing}
        />
        </div>
      </div>

      {/* Toolbar */}
      <div className="w-full bg-white/90 backdrop-blur-md border-t border-gray-100 z-30 shrink-0">
        <div className="px-4 py-3 flex flex-col gap-3">
          
          {/* Top row: Colors & Tools */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEraser(false)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${!isEraser ? 'bg-lavender-mist text-lavender-deep' : 'text-gray-400 hover:bg-gray-50'}`}
              >
                <Pen className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsEraser(true)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isEraser ? 'bg-lavender-mist text-lavender-deep' : 'text-gray-400 hover:bg-gray-50'}`}
              >
                <Eraser className="w-5 h-5" />
              </button>
              <div className="w-px h-6 bg-gray-200 mx-1" />
              <button onClick={undo} disabled={strokes.length === 0} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 disabled:opacity-30 hover:bg-gray-50">
                <RotateCcw className="w-5 h-5" />
              </button>
              <button onClick={redo} disabled={undoneStrokes.length === 0} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 disabled:opacity-30 hover:bg-gray-50">
                <RotateCw className="w-5 h-5" />
              </button>
            </div>
            
            <button onClick={clear} className="w-10 h-10 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          {/* Bottom row: Colors & Size */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => { setCurrentColor(color); setIsEraser(false); }}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${currentColor === color && !isEraser ? 'scale-110 border-gray-400 shadow-sm' : 'border-transparent scale-100'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            
            <div className="flex items-center gap-1">
              {[2, 4, 8, 12].map(size => (
                <button
                  key={size}
                  onClick={() => setCurrentSize(size)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${currentSize === size ? 'bg-gray-100' : ''}`}
                >
                  <div className="bg-gray-600 rounded-full" style={{ width: size, height: size }} />
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
