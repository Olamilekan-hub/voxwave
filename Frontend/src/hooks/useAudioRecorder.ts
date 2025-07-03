// Frontend/src/hooks/useAudioRecorder.ts
'use client'

import { useState, useRef, useCallback } from 'react'

interface UseAudioRecorderReturn {
  startRecording: () => Promise<void>
  stopRecording: () => void
  isRecording: boolean
  audioBlob: Blob | null
  audioUrl: string | null
  error: string | null
  duration: number
  clearRecording: () => void
  isSupported: boolean
}

interface RecorderOptions {
  audioBitsPerSecond?: number
  mimeType?: string
}

export const useAudioRecorder = (options: RecorderOptions = {}): UseAudioRecorderReturn => {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const startTimeRef = useRef<number>(0)
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Check if MediaRecorder is supported
  const isSupported = typeof window !== 'undefined' && 
                     typeof navigator !== 'undefined' && 
                     typeof MediaRecorder !== 'undefined' &&
                     !!navigator.mediaDevices?.getUserMedia

  // Get supported MIME type for better browser compatibility
  const getSupportedMimeType = (): string => {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
      'audio/wav'
    ]
    
    return types.find(type => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(type)) || 'audio/webm'
  }

  const startRecording = useCallback(async (): Promise<void> => {
    if (!isSupported) {
      setError('Audio recording is not supported in this browser')
      return
    }

    if (isRecording) {
      setError('Recording is already in progress')
      return
    }

    try {
      setError(null)
      
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      })

      streamRef.current = stream

      // Get supported MIME type
      const mimeType = options.mimeType || getSupportedMimeType()
      
      // Create MediaRecorder with options
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: options.audioBitsPerSecond || 128000
      })

      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        setAudioBlob(blob)
        
        // Create URL for playback
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        
        // Stop duration tracking
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current)
          durationIntervalRef.current = null
        }
        
        setIsRecording(false)
        
        console.log(`Recording completed: ${blob.size} bytes, ${mimeType}`)
      }

      mediaRecorder.onerror = (event) => {
        const errorEvent = event as MediaRecorderErrorEvent
        setError(`Recording failed: ${errorEvent.error?.message || 'Unknown error'}`)
        setIsRecording(false)
        stopRecording()
      }

      // Start recording
      mediaRecorder.start(1000) // Collect data every second
      setIsRecording(true)
      startTimeRef.current = Date.now()
      
      // Start duration tracking
      durationIntervalRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }, 1000)

      console.log(`Recording started with ${mimeType}`)
      
    } catch (err) {
      const error = err as Error
      
      if (error.name === 'NotAllowedError') {
        setError('Microphone access denied. Please allow microphone access and try again.')
      } else if (error.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone and try again.')
      } else if (error.name === 'NotReadableError') {
        setError('Microphone is being used by another application.')
      } else {
        setError(`Failed to start recording: ${error.message}`)
      }
      
      console.error('Recording start error:', error)
    }
  }, [isSupported, isRecording, options.mimeType, options.audioBitsPerSecond])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
    }

    // Stop all tracks to release microphone
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop()
      })
      streamRef.current = null
    }

    // Clear duration interval
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current)
      durationIntervalRef.current = null
    }

    console.log('Recording stopped')
  }, [isRecording])

  const clearRecording = useCallback(() => {
    // Clean up blob URL to prevent memory leaks
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    
    setAudioBlob(null)
    setAudioUrl(null)
    setDuration(0)
    setError(null)
    
    console.log('Recording cleared')
  }, [audioUrl])

  return {
    startRecording,
    stopRecording,
    isRecording,
    audioBlob,
    audioUrl,
    error,
    duration,
    clearRecording,
    isSupported
  }
}

// Type for MediaRecorder error events
interface MediaRecorderErrorEvent extends Event {
  error?: DOMException
}