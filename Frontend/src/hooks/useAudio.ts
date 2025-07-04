'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface UseAudioReturn {
  play: () => Promise<void>
  pause: () => void
  stop: () => void
  seek: (time: number) => void
  togglePlay: () => Promise<void>
  isPlaying: boolean
  isLoading: boolean
  error: string | null
  duration: number
  currentTime: number
  canPlay: boolean
  volume: number
  setVolume: (volume: number) => void
}

export const useAudio = (src: string | null): UseAudioReturn => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [canPlay, setCanPlay] = useState(false)
  const [volume, setVolumeState] = useState(1)

  // Initialize audio element
  useEffect(() => {
    if (!src) {
      setCanPlay(false)
      setIsLoading(false)
      setError(null)
      return
    }

    // Only create Audio on client side
    if (typeof window === 'undefined') return

    // Clean up previous audio
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
    }

    const audio = new Audio()
    audioRef.current = audio
    
    // Set up event listeners
    const handleCanPlay = () => {
      setCanPlay(true)
      setIsLoading(false)
      setError(null)
      console.log('Audio can play:', src)
    }

    const handleError = (e: Event) => {
      const target = e.target as HTMLAudioElement
      let errorMessage = 'Audio playback failed'
      
      if (target.error) {
        switch (target.error.code) {
          case target.error.MEDIA_ERR_ABORTED:
            errorMessage = 'Audio loading was stopped'
            break
          case target.error.MEDIA_ERR_NETWORK:
            errorMessage = 'Network error - please check your connection'
            break
          case target.error.MEDIA_ERR_DECODE:
            errorMessage = 'Audio file is corrupted or unsupported'
            break
          case target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = 'Audio format not supported by your browser'
            break
          default:
            errorMessage = 'Unknown audio playback error'
        }
      }
      
      setError(errorMessage)
      setIsLoading(false)
      setCanPlay(false)
      setIsPlaying(false)
      console.error('Audio error:', errorMessage, target.error)
    }

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration)
      }
    }

    const handleTimeUpdate = () => {
      if (audio.currentTime && !isNaN(audio.currentTime)) {
        setCurrentTime(audio.currentTime)
      }
    }

    const handlePlay = () => {
      setIsPlaying(true)
      setError(null)
      console.log('Audio started playing')
    }

    const handlePause = () => {
      setIsPlaying(false)
      console.log('Audio paused')
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
      console.log('Audio ended')
    }

    const handleLoadStart = () => {
      setIsLoading(true)
      setError(null)
    }

    const handleWaiting = () => {
      setIsLoading(true)
    }

    const handleCanPlayThrough = () => {
      setIsLoading(false)
    }

    // Add all event listeners
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('canplaythrough', handleCanPlayThrough)
    audio.addEventListener('error', handleError)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('loadstart', handleLoadStart)
    audio.addEventListener('waiting', handleWaiting)

    // Set initial volume
    audio.volume = volume

    // Configure audio for better cross-browser compatibility
    audio.preload = 'auto'
    audio.crossOrigin = 'anonymous'

    // Set the source and load
    try {
      audio.src = src
      audio.load()
    } catch (err) {
      console.error('Error setting audio source:', err)
      setError('Failed to load audio file')
    }

    // Cleanup function
    return () => {
      // Remove event listeners
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('canplaythrough', handleCanPlayThrough)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('loadstart', handleLoadStart)
      audio.removeEventListener('waiting', handleWaiting)
      
      // Clean up audio
      audio.pause()
      audio.src = ''
      audioRef.current = null
    }
  }, [src, volume])

  const play = useCallback(async (): Promise<void> => {
    if (!audioRef.current || !canPlay) {
      setError('Audio is not ready for playback. Please wait or try refreshing.')
      return
    }

    try {
      // Reset any previous errors
      setError(null)

      // Ensure audio is at beginning if it ended
      if (audioRef.current.ended) {
        audioRef.current.currentTime = 0
      }

      const playPromise = audioRef.current.play()
      
      if (playPromise !== undefined) {
        await playPromise
        console.log('Audio play successful')
      }
    } catch (err) {
      const error = err as Error
      let userFriendlyMessage = 'Unable to play audio'
      
      if (error.name === 'NotAllowedError') {
        userFriendlyMessage = 'Please click the play button to start audio. Your browser requires user interaction.'
      } else if (error.name === 'NotSupportedError') {
        userFriendlyMessage = 'This audio format is not supported by your browser. Please try a different file.'
      } else if (error.name === 'AbortError') {
        userFriendlyMessage = 'Audio playback was interrupted. Please try again.'
      } else {
        userFriendlyMessage = 'Audio playback failed. Please check your internet connection and try again.'
      }
      
      setError(userFriendlyMessage)
      setIsPlaying(false)
      console.error('Audio play error:', error.name, error.message)
    }
  }, [canPlay])

  const pause = useCallback(() => {
    if (!audioRef.current) {
      console.warn('No audio element to pause')
      return
    }

    try {
      audioRef.current.pause()
      console.log('Audio paused successfully')
    } catch (error) {
      console.error('Error pausing audio:', error)
      setError('Failed to pause audio')
    }
  }, [])

  const stop = useCallback(() => {
    if (!audioRef.current) {
      console.warn('No audio element to stop')
      return
    }

    try {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
      setCurrentTime(0)
      console.log('Audio stopped successfully')
    } catch (error) {
      console.error('Error stopping audio:', error)
      setError('Failed to stop audio')
    }
  }, [])

  const seek = useCallback((time: number) => {
    if (!audioRef.current || duration <= 0) {
      console.warn('Cannot seek - audio not ready or invalid duration')
      return
    }

    try {
      const clampedTime = Math.max(0, Math.min(time, duration))
      audioRef.current.currentTime = clampedTime
      setCurrentTime(clampedTime)
      console.log('Seeked to:', clampedTime)
    } catch (error) {
      console.error('Error seeking audio:', error)
      setError('Failed to seek in audio')
    }
  }, [duration])

  const togglePlay = useCallback(async () => {
    if (isPlaying) {
      pause()
    } else {
      await play()
    }
  }, [isPlaying, play, pause])

  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume))
    setVolumeState(clampedVolume)
    
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume
    }
  }, [])

  return {
    play,
    pause,
    stop,
    seek,
    togglePlay,
    isPlaying,
    isLoading,
    error,
    duration,
    currentTime,
    canPlay,
    volume,
    setVolume
  }
}