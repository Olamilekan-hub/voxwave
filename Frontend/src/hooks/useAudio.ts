'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface UseAudioReturn {
  play: () => Promise<void>
  pause: () => void
  stop: () => void
  seek: (time: number) => void
  isPlaying: boolean
  isLoading: boolean
  error: string | null
  duration: number
  currentTime: number
  canPlay: boolean
}

export const useAudio = (src: string | null): UseAudioReturn => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [canPlay, setCanPlay] = useState(false)

  // Initialize audio element
  useEffect(() => {
    if (!src) {
      setCanPlay(false)
      setIsLoading(false)
      return
    }

    // Only create Audio on client side
    if (typeof window === 'undefined') return

    const audio = new Audio()
    audioRef.current = audio
    
    // Set up event listeners
    const handleCanPlay = () => {
      setCanPlay(true)
      setIsLoading(false)
      setError(null)
    }

    const handleError = (e: Event) => {
      const target = e.target as HTMLAudioElement
      let errorMessage = 'Failed to load audio'
      
      if (target.error) {
        switch (target.error.code) {
          case target.error.MEDIA_ERR_ABORTED:
            errorMessage = 'Audio loading was aborted'
            break
          case target.error.MEDIA_ERR_NETWORK:
            errorMessage = 'Network error occurred'
            break
          case target.error.MEDIA_ERR_DECODE:
            errorMessage = 'Audio decoding failed'
            break
          case target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = 'Audio format not supported'
            break
          default:
            errorMessage = 'Unknown audio error'
        }
      }
      
      setError(errorMessage)
      setIsLoading(false)
      setCanPlay(false)
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0)
    }

    const handlePlay = () => {
      setIsPlaying(true)
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    const handleLoadStart = () => {
      setIsLoading(true)
      setError(null)
    }

    // Add all event listeners
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('error', handleError)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('loadstart', handleLoadStart)

    // Set the source
    audio.src = src

    // Cleanup function
    return () => {
      // Remove event listeners
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('loadstart', handleLoadStart)
      
      // Clean up audio
      audio.pause()
      audio.src = ''
      audioRef.current = null
    }
  }, [src])

  const play = useCallback(async (): Promise<void> => {
    if (!audioRef.current || !canPlay) {
      setError('Audio not ready for playback')
      return
    }

    try {
      await audioRef.current.play()
      setError(null)
    } catch (err) {
      const error = err as Error
      if (error.name === 'NotAllowedError') {
        setError('Playback requires user interaction. Click to play.')
      } else if (error.name === 'NotSupportedError') {
        setError('Audio format not supported by your browser')
      } else {
        setError('Failed to play audio')
      }
      console.error('Audio play error:', error)
    }
  }, [canPlay])

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
  }, [])

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [])

  const seek = useCallback((time: number) => {
    if (audioRef.current && duration > 0) {
      const clampedTime = Math.max(0, Math.min(time, duration))
      audioRef.current.currentTime = clampedTime
    }
  }, [duration])

  return {
    play,
    pause,
    stop,
    seek,
    isPlaying,
    isLoading,
    error,
    duration,
    currentTime,
    canPlay
  }
}