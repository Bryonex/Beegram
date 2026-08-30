import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import type { Song, AudioPlaybackState } from '../types/music'

type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'buffering' | 'ended' | 'error'

interface AudioContextType extends AudioPlaybackState {
  status: PlaybackStatus
  currentTrack: Song | null
  queue: Song[]
  playTrack: (song: Song, queueContext?: Song[]) => void
  play: () => void
  pause: () => void
  seek: (time: number) => void
  next: () => void
  previous: () => void
  addToQueue: (song: Song) => void
  clearQueue: () => void
  isMiniPlayerMinimized: boolean
  setMinimized: (val: boolean) => void
}

const AudioContext = createContext<AudioContextType | null>(null)

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
  const [currentTrack, setCurrentTrack] = useState<Song | null>(null)
  const [queue, setQueue] = useState<Song[]>([])
  const [queueIndex, setQueueIndex] = useState(0)
  
  const [status, setStatus] = useState<PlaybackStatus>('idle')
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume] = useState(1) // Volume can be set dynamically later
  const [isMiniPlayerMinimized, setMinimized] = useState(false)

  // Initialize audio element once
  useEffect(() => {
    const audio = new Audio()
    audioRef.current = audio
    
    // Setup listeners
    const handlePlay = () => setStatus('playing')
    const handlePause = () => setStatus('paused')
    const handleWaiting = () => setStatus('buffering')
    const handlePlaying = () => setStatus('playing')
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleDurationChange = () => setDuration(audio.duration)
    const handleEnded = () => {
      setStatus('ended')
      handleNext()
    }
    const handleError = () => setStatus('error')

    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('waiting', handleWaiting)
    audio.addEventListener('playing', handlePlaying)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('durationchange', handleDurationChange)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('waiting', handleWaiting)
      audio.removeEventListener('playing', handlePlaying)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('durationchange', handleDurationChange)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      audio.pause()
      audio.src = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync Media Session API
  useEffect(() => {
    if ('mediaSession' in navigator && currentTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        artwork: currentTrack.coverUrl ? [{ src: currentTrack.coverUrl, sizes: '512x512', type: 'image/png' }] : []
      })

      navigator.mediaSession.setActionHandler('play', play)
      navigator.mediaSession.setActionHandler('pause', pause)
      navigator.mediaSession.setActionHandler('previoustrack', previous)
      navigator.mediaSession.setActionHandler('nexttrack', next)
    }
  }, [currentTrack])

  const playTrack = useCallback((song: Song, newQueue?: Song[]) => {
    if (!audioRef.current) return

    if (newQueue) {
      setQueue(newQueue)
      const index = newQueue.findIndex(s => s.id === song.id)
      setQueueIndex(index !== -1 ? index : 0)
    }

    setCurrentTrack(song)
    setStatus('loading')
    setCurrentTime(0)
    
    audioRef.current.src = song.audioUrl
    audioRef.current.play().catch(e => {
      console.warn('Playback prevented:', e)
      setStatus('error')
    })
    setMinimized(false)
  }, [])

  const play = useCallback(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.play().catch(e => {
        console.warn('Playback prevented:', e)
        setStatus('error')
      })
    }
  }, [currentTrack])

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
  }, [])

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }, [])

  const handleNext = useCallback(() => {
    if (queue.length > 0 && queueIndex < queue.length - 1) {
      const nextIndex = queueIndex + 1
      setQueueIndex(nextIndex)
      playTrack(queue[nextIndex])
    } else {
      // End of queue
      setStatus('idle')
    }
  }, [queue, queueIndex, playTrack])

  const next = useCallback(() => {
    handleNext()
  }, [handleNext])

  const previous = useCallback(() => {
    if (audioRef.current && audioRef.current.currentTime > 3) {
      // Restart current track if we are past 3 seconds
      seek(0)
    } else if (queue.length > 0 && queueIndex > 0) {
      const prevIndex = queueIndex - 1
      setQueueIndex(prevIndex)
      playTrack(queue[prevIndex])
    }
  }, [queue, queueIndex, playTrack, seek])

  const addToQueue = useCallback((song: Song) => {
    setQueue(prev => [...prev, song])
  }, [])

  const clearQueue = useCallback(() => {
    setQueue([])
    setQueueIndex(0)
  }, [])

  const value = {
    status,
    currentTrack,
    queue,
    isPlaying: status === 'playing' || status === 'buffering',
    isBuffering: status === 'buffering',
    isError: status === 'error',
    duration,
    currentTime,
    volume,
    playTrack,
    play,
    pause,
    seek,
    next,
    previous,
    addToQueue,
    clearQueue,
    isMiniPlayerMinimized,
    setMinimized
  }

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  )
}

export function useAudioPlayer() {
  const context = useContext(AudioContext)
  if (!context) {
    throw new Error('useAudioPlayer must be used within an AudioProvider')
  }
  return context
}
