import { useState, useRef, useEffect } from 'react'
import { Pen, Eraser, Trash2, Download, Save, Hand } from 'lucide-react'
import { gardenService } from '../services/gardenService'
import { useCurrentProfile } from '../hooks/useCurrentProfile'
import { BackButton } from '../components/ui/BackButton'
import { useToast } from '../contexts/ToastContext'
import { supabase } from '../lib/supabase'

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
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const [isDrawing, setIsDrawing] = useState(false)
  const { profile } = useCurrentProfile()
  const { success, error } = useToast()
  
  const [currentColor, setCurrentColor] = useState('#3F3545')
  const [currentSize, setCurrentSize] = useState(4)
  const [isEraser, setIsEraser] = useState(false)
  const [isScrollMode, setIsScrollMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [, setUndoneStrokes] = useState<Stroke[]>([])
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null)

  const [loadedImageUrl, setLoadedImageUrl] = useState<string | null>(null)

  useEffect(() => {
    // Load previously saved doodle
    const loadDoodle = async () => {
      if (!profile?.relationship_id) return
      
      try {
        const { data, error: fetchErr } = await supabase
          .from('saved_doodles')
          .select('*')
          .eq('relationship_id', profile.relationship_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
          
        if (fetchErr || !data) return
        
        const { data: signedData, error: signErr } = await supabase.storage.from('doodles').createSignedUrl(data.image_url, 60 * 60)
        if (signErr || !signedData?.signedUrl) return
        
        const imgUrl = signedData.signedUrl
        
        // Load the image onto the canvas
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          const canvas = canvasRef.current
          if (!canvas) return
          const ctx = canvas.getContext('2d')
          if (!ctx) return
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        }
        img.onerror = () => {
          console.error("Failed to load doodle image onto canvas due to CORS or network error.")
          // Fallback: just display without crossOrigin if CORS blocks it, though saving later might fail
          const fallbackImg = new Image()
          fallbackImg.onload = () => {
            const canvas = canvasRef.current
            if (canvas) {
              const ctx = canvas.getContext('2d')
              ctx?.drawImage(fallbackImg, 0, 0, canvas.width, canvas.height)
            }
          }
          fallbackImg.src = imgUrl
        }
        img.src = imgUrl

      } catch (err) {
        console.error("Error loading doodle:", err)
      }
    }
    loadDoodle()
  }, [profile?.relationship_id])

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

    // We do NOT clear the canvas entirely because we want to preserve the loaded background image.
    // However, if we support undo/redo with strokes, we need to redraw them on top of the loaded image.
    // For simplicity, we just clear and redraw the strokes *if* there are any in memory.
    // If strokes exist, we assume they drew over the loaded image.
    if (strokes.length > 0 || currentStroke) {
      // Actually, if we clear, we lose the loaded image. So we should redraw everything.
      // But we can't easily redraw the loaded image unless we keep it in state.
      // A simple solution: the drawn strokes are just applied incrementally!
    }
    
    // We can just draw the new strokes incrementally
    if (currentStroke) {
      ctx.beginPath()
      ctx.strokeStyle = currentStroke.isEraser ? '#FFF9F3' : currentStroke.color
      ctx.lineWidth = currentStroke.size
      
      currentStroke.points.forEach((point, i) => {
        if (i === 0) {
          ctx.moveTo(point.x, point.y)
        } else {
          ctx.lineTo(point.x, point.y)
        }
      })
      ctx.stroke()
    }
  }
  
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
    if (isScrollMode) return
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
    setUndoneStrokes([])
  }

  const draw = (e: React.PointerEvent) => {
    if (isScrollMode) return
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
    if (isScrollMode || !isDrawing || !currentStroke) return
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

  const clear = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
    setStrokes([])
    setUndoneStrokes([])
  }

  const downloadSnapshot = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `doodle-${Date.now()}.png`
    a.click()
  }

  const saveToSupabase = async () => {
    if (!profile?.relationship_id) return
    setIsSaving(true)
    try {
      const canvas = canvasRef.current
      if (!canvas) throw new Error('Canvas not found')
      
      // Get blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => b ? resolve(b) : reject(new Error('Canvas is empty')), 'image/png')
      })

      const fileName = `${profile.relationship_id}/${Date.now()}.png`
      
      const { error: uploadErr } = await supabase.storage
        .from('doodles')
        .upload(fileName, blob, { contentType: 'image/png', upsert: true })

      if (uploadErr) throw uploadErr

      const { error: dbErr } = await supabase.from('saved_doodles').insert({
        relationship_id: profile.relationship_id,
        author_id: profile.id,
        image_url: fileName
      })

      if (dbErr) throw dbErr

      success('Drawing saved')
    } catch (err: any) {
      error(err.message || 'Could not save drawing')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="w-full min-h-[100dvh] bg-warmPaper flex flex-col relative pt-safe overflow-hidden">
      
      {/* Header */}
      <div className="px-5 pt-6 pb-2 sticky top-0 bg-warmPaper/90 backdrop-blur-md z-20 flex items-center justify-between">
        <BackButton />
        <h1 className="text-xl font-serif text-deepPlum font-medium hidden sm:block">Doodle Wall</h1>
        <div className="flex gap-2">
          <button 
            onClick={downloadSnapshot}
            className="px-3 py-2 rounded-full bg-lavender-soft/20 text-lavender-deep hover:bg-lavender-soft/40 flex items-center justify-center transition-colors gap-2"
          >
            <Download className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Save</span>
          </button>
          <button 
            onClick={saveToSupabase}
            disabled={isSaving}
            className="px-4 py-2 rounded-full bg-lavender-deep text-white hover:bg-lavender-deep/90 flex items-center justify-center transition-colors shadow-sm disabled:opacity-50 gap-2"
          >
            <Save className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">{isSaving ? 'Posting...' : 'Post to Wall'}</span>
          </button>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="px-4 py-2 flex justify-center z-20">
        <div className="bg-white/80 backdrop-blur-md p-1 rounded-full shadow-sm flex items-center border border-gray-100">
          <button
            onClick={() => setIsScrollMode(false)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 transition-colors ${!isScrollMode ? 'bg-amber-100 text-amber-900' : 'text-gray-500'}`}
          >
            <Pen className="w-4 h-4" /> Draw
          </button>
          <button
            onClick={() => setIsScrollMode(true)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 transition-colors ${isScrollMode ? 'bg-amber-100 text-amber-900' : 'text-gray-500'}`}
          >
            <Hand className="w-4 h-4" /> Scroll
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative w-full px-4 pb-4 flex flex-col">
        <div className={`flex-1 w-full relative rounded-3xl bg-[#FFF9F3] border border-lavender-mist/50 shadow-inner overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] ${!isScrollMode ? 'touch-none' : 'overflow-auto touch-pan-y'}`}>
          <canvas
            ref={canvasRef}
            width={800} // Setup basic large canvas size, we can scale via CSS
            height={1200}
            className={`w-full h-[150%] ${!isScrollMode ? 'touch-none' : ''}`}
            style={!isScrollMode ? { touchAction: 'none', overscrollBehavior: 'none' } : {}}
            onPointerDown={(e) => { 
              if (!isScrollMode) {
                (e.target as HTMLElement).releasePointerCapture(e.pointerId); 
                startDrawing(e); 
              }
            }}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerOut={stopDrawing}
            onPointerCancel={stopDrawing}
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="w-full bg-white/90 backdrop-blur-md border-t border-gray-100 z-30 shrink-0 pb-[env(safe-area-inset-bottom)]">
        <div className="px-4 py-3 flex flex-col gap-3">
          
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
              
              {/* Rainbow Color Picker */}
              <div className="relative w-10 h-10 rounded-full shadow-sm overflow-hidden border-2 border-white ring-1 ring-gray-200 flex items-center justify-center bg-[conic-gradient(red,yellow,lime,aqua,blue,fuchsia,red)]">
                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => { setCurrentColor(e.target.value); setIsEraser(false); }}
                  className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 opacity-0 cursor-pointer"
                />
                {/* Inner preview circle */}
                <div 
                  className="w-6 h-6 rounded-full border border-black/10 pointer-events-none" 
                  style={{ backgroundColor: currentColor }} 
                />
              </div>
            </div>
            
            <button onClick={clear} className="w-10 h-10 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {[2, 4, 8, 12, 20].map(size => (
                <button
                  key={size}
                  onClick={() => setCurrentSize(size)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${currentSize === size ? 'bg-gray-100' : ''}`}
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
