'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { 
  Play, 
  Pause, 
  Download, 
  Upload, 
  Mic, 
  MicOff, 
  Volume2, 
  Waves, 
  Settings, 
  Trash2, 
  RefreshCw, 
  Loader,
  AlertCircle,
  CheckCircle,
  FileAudio
} from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import { ttsApi, speechToSpeechApi, audioUtils, type Voice, type VoicesResponse } from '@/lib/api'

const SpeechToSpeechPage = () => {
  const { theme, mounted } = useTheme()
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [selectedVoice, setSelectedVoice] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [originalAudioUrl, setOriginalAudioUrl] = useState<string | null>(null)
  const [convertedAudioUrl, setConvertedAudioUrl] = useState<string | null>(null)
  const [convertedAudioBlob, setConvertedAudioBlob] = useState<Blob | null>(null)
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false)
  const [isPlayingConverted, setIsPlayingConverted] = useState(false)
  const [quality, setQuality] = useState('eleven_english_sts_v2')
  const [preserveEmotion, setPreserveEmotion] = useState(true)
  const [stability, setStability] = useState(0.5)
  const [similarityBoost, setSimilarityBoost] = useState(0.8)
  const [voices, setVoices] = useState<Voice[]>([])
  const [isLoadingVoices, setIsLoadingVoices] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [conversionResult, setConversionResult] = useState<any>(null)
  const [isDragging, setIsDragging] = useState(false)

  const originalAudioRef = useRef<HTMLAudioElement>(null)
  const convertedAudioRef = useRef<HTMLAudioElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load voices on component mount
  useEffect(() => {
    loadVoices()
  }, [])

  const loadVoices = async () => {
    try {
      setIsLoadingVoices(true)
      setError(null)
      
      const response: VoicesResponse = await ttsApi.getVoices()
      
      if (response.success) {
        const allVoices = [
          ...response.data.elevenLabsVoices,
          ...response.data.customVoices
        ]
        setVoices(allVoices)
        
        if (allVoices.length > 0 && !selectedVoice) {
          setSelectedVoice(allVoices[0].voice_id)
        }
      } else {
        throw new Error('Failed to load voices')
      }
    } catch (error) {
      console.error('Error loading voices:', error)
      setError(`Failed to load voices: ${error instanceof Error ? error.message : 'Unknown error'}`)
      
      // Fallback voices
      const fallbackVoices = [
        { voice_id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', description: 'Natural, warm female voice' },
        { voice_id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', description: 'Strong, confident female voice' },
        { voice_id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', description: 'Sweet, friendly female voice' },
      ]
      setVoices(fallbackVoices)
      if (!selectedVoice) {
        setSelectedVoice(fallbackVoices[0].voice_id)
      }
    } finally {
      setIsLoadingVoices(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const validation = audioUtils.validateAudioFile(file)
      if (!validation.valid) {
        setError(validation.error || 'Invalid file')
        return
      }
      
      setUploadedFile(file)
      setRecordedBlob(null)
      const url = URL.createObjectURL(file)
      setOriginalAudioUrl(url)
      setConvertedAudioUrl(null)
      setConvertedAudioBlob(null)
      setConversionResult(null)
      setError(null)
    }
  }

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(false)
    
    const file = event.dataTransfer.files[0]
    if (file) {
      const validation = audioUtils.validateAudioFile(file)
      if (!validation.valid) {
        setError(validation.error || 'Invalid file')
        return
      }
      
      setUploadedFile(file)
      setRecordedBlob(null)
      const url = URL.createObjectURL(file)
      setOriginalAudioUrl(url)
      setConvertedAudioUrl(null)
      setConvertedAudioBlob(null)
      setConversionResult(null)
      setError(null)
    }
  }, [])

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(false)
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      const chunks: BlobPart[] = []
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' })
        setRecordedBlob(blob)
        setUploadedFile(null)
        const url = URL.createObjectURL(blob)
        setOriginalAudioUrl(url)
        setConvertedAudioUrl(null)
        setConvertedAudioBlob(null)
        setConversionResult(null)
        setError(null)
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
      setError('Failed to start recording. Please check microphone permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
    }
  }

  const handleConvert = async () => {
    if (!originalAudioUrl || !selectedVoice) {
      setError('Please upload an audio file and select a voice')
      return
    }

    setIsProcessing(true)
    setError(null)
    
    try {
      const formData = new FormData()
      
      // Add the audio file
      if (uploadedFile) {
        formData.append('audio', uploadedFile)
      } else if (recordedBlob) {
        formData.append('audio', recordedBlob, 'recorded-audio.wav')
      } else {
        throw new Error('No audio file available')
      }
      
      // Add conversion parameters
      formData.append('voiceId', selectedVoice)
      formData.append('options', JSON.stringify({
        model_id: quality,
        stability: stability,
        similarity_boost: similarityBoost,
        style: preserveEmotion ? 0.5 : 0.0,
        use_speaker_boost: true
      }))
      
      console.log('Converting speech with voice:', selectedVoice)
      
      const response = await speechToSpeechApi.convertSpeech(formData)
      
      if (response.success) {
        setConversionResult(response.data)
        
        // Fetch the converted audio as blob
        const audioResponse = await fetch(`http://localhost:5000${response.data.audioUrl}`)
        if (!audioResponse.ok) {
          throw new Error('Failed to fetch converted audio')
        }
        
        const blob = await audioResponse.blob()
        const blobUrl = URL.createObjectURL(blob)
        
        setConvertedAudioBlob(blob)
        setConvertedAudioUrl(blobUrl)
        setError(null)
        
        console.log('Speech conversion completed successfully')
      } else {
        throw new Error('Speech conversion failed')
      }
      
    } catch (error) {
      console.error('Error converting speech:', error)
      setError(`Failed to convert speech: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePlayOriginal = async () => {
    if (!originalAudioRef.current) return
    
    try {
      if (isPlayingOriginal) {
        originalAudioRef.current.pause()
        setIsPlayingOriginal(false)
      } else {
        await originalAudioRef.current.play()
        setIsPlayingOriginal(true)
      }
    } catch (error) {
      console.error('Error playing original audio:', error)
      setError('Failed to play original audio')
    }
  }

  const handlePlayConverted = async () => {
    if (!convertedAudioRef.current) return
    
    try {
      if (isPlayingConverted) {
        convertedAudioRef.current.pause()
        setIsPlayingConverted(false)
      } else {
        await convertedAudioRef.current.play()
        setIsPlayingConverted(true)
      }
    } catch (error) {
      console.error('Error playing converted audio:', error)
      setError('Failed to play converted audio')
    }
  }

  const handleDownload = () => {
    if (!convertedAudioBlob || !conversionResult) return
    
    try {
      audioUtils.downloadBlob(
        convertedAudioBlob, 
        conversionResult.filename || 'voxwave-converted-speech.mp3'
      )
    } catch (error) {
      console.error('Error downloading audio:', error)
      setError('Failed to download audio')
    }
  }

  const clearAudio = () => {
    setUploadedFile(null)
    setRecordedBlob(null)
    setOriginalAudioUrl(null)
    setConvertedAudioUrl(null)
    setConvertedAudioBlob(null)
    setConversionResult(null)
    setIsPlayingOriginal(false)
    setIsPlayingConverted(false)
    setError(null)
  }

  const clearError = () => {
    setError(null)
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen pt-16 ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
      
      {/* Header */}
      <div className={`border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl flex items-center justify-center">
              <Waves className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Speech to Speech</h1>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Transform existing audio with different voices
              </p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <div className="text-2xl font-bold text-green-400">
                {uploadedFile ? audioUtils.formatFileSize(uploadedFile.size) : '0 MB'}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>File Size</div>
            </div>
            <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <div className="text-2xl font-bold text-green-400">
                {quality === 'eleven_english_sts_v2' ? 'English' : 'Multilingual'}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Model</div>
            </div>
            <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <div className="text-2xl font-bold text-green-400">
                {voices.find(v => v.voice_id === selectedVoice)?.name || 'None'}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Target Voice</div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400">{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Audio Input */}
            <div className={`p-6 rounded-2xl border-2 ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <h2 className="text-xl font-semibold mb-6">Input Audio</h2>
              
              {!originalAudioUrl ? (
                <div className="space-y-6">
                  {/* File Upload */}
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                      isDragging 
                        ? 'border-green-500 bg-green-500/10' 
                        : theme === 'dark'
                        ? 'border-gray-600 hover:border-green-500 bg-gray-800/50'
                        : 'border-gray-300 hover:border-green-500 bg-gray-50'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2">Upload Audio File</h3>
                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                      Drop your audio file here or click to browse
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                      Supports MP3, WAV, M4A, FLAC (Max 25MB)
                    </p>
                  </div>

                  <div className={`flex items-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    <div className="flex-1 h-px bg-gray-300"></div>
                    <span className="px-4 text-sm font-medium">OR</span>
                    <div className="flex-1 h-px bg-gray-300"></div>
                  </div>

                  {/* Voice Recording */}
                  <div className="text-center">
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                        isRecording
                          ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                          : 'bg-gradient-to-r from-green-400 to-green-600 hover:shadow-lg hover:shadow-green-500/25'
                      }`}
                    >
                      {isRecording ? (
                        <MicOff className="w-8 h-8 text-white" />
                      ) : (
                        <Mic className="w-8 h-8 text-black" />
                      )}
                    </button>
                    <p className={`mt-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {isRecording ? 'Click to stop recording' : 'Click to start recording'}
                    </p>
                  </div>
                </div>
              ) : (
                /* Audio Player - Original */
                <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handlePlayOriginal}
                        className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-black hover:shadow-lg transition-all"
                      >
                        {isPlayingOriginal ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                      </button>
                      <div>
                        <div className="font-medium">Original Audio</div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {uploadedFile ? uploadedFile.name : 'Recorded Audio'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={clearAudio}
                      className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Waveform Visualization */}
                  <div className="h-16 bg-gradient-to-r from-blue-400/20 to-blue-600/20 rounded-lg flex items-center justify-center">
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: 40 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-blue-400 rounded-full"
                          style={{ 
                            height: `${Math.random() * 40 + 8}px`,
                            opacity: isPlayingOriginal ? 0.8 : 0.3
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Converted Audio */}
            {convertedAudioUrl && conversionResult && (
              <div className={`p-6 rounded-2xl border-2 ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                <h2 className="text-xl font-semibold mb-4">Converted Audio</h2>
                
                <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} mb-4`}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={handlePlayConverted}
                        className="w-14 h-14 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-black hover:shadow-lg transition-all"
                      >
                        {isPlayingConverted ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                      </button>
                      <div>
                        <div className="font-medium text-lg">Converted Speech</div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Voice: {voices.find(v => v.voice_id === selectedVoice)?.name}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{audioUtils.formatFileSize(conversionResult.fileSize)}</div>
                        <div className="text-xs text-gray-500">Converted</div>
                      </div>
                      <button
                        onClick={handleDownload}
                        className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
                        title="Download Converted Audio"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Converted Waveform */}
                  <div className="h-16 bg-gradient-to-r from-green-400/20 to-green-600/20 rounded-lg flex items-center justify-center">
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: 40 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-green-400 rounded-full"
                          style={{ 
                            height: `${Math.random() * 40 + 8}px`,
                            opacity: isPlayingConverted ? 0.8 : 0.3
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Hidden Audio Elements */}
                <audio 
                  ref={originalAudioRef} 
                  src={originalAudioUrl || undefined} 
                  onEnded={() => setIsPlayingOriginal(false)}
                  style={{ display: 'none' }}
                />
                <audio 
                  ref={convertedAudioRef} 
                  src={convertedAudioUrl} 
                  onEnded={() => setIsPlayingConverted(false)}
                  style={{ display: 'none' }}
                />
              </div>
            )}
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            
            {/* Voice Selection */}
            <div className={`p-6 rounded-2xl border-2 ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Volume2 className="w-5 h-5 mr-2" />
                Target Voice
                {isLoadingVoices && <Loader className="w-4 h-4 ml-2 animate-spin" />}
              </h3>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {isLoadingVoices ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader className="w-6 h-6 animate-spin text-green-400" />
                    <span className="ml-2 text-gray-500">Loading voices...</span>
                  </div>
                ) : voices.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No voices available. Check your connection.
                  </div>
                ) : (
                  voices.map((voice) => (
                    <button
                      key={voice.voice_id}
                      onClick={() => setSelectedVoice(voice.voice_id)}
                      className={`w-full p-3 rounded-xl text-left transition-all ${
                        selectedVoice === voice.voice_id
                          ? 'bg-green-500/10 border-2 border-green-500'
                          : theme === 'dark'
                          ? 'bg-gray-800 border-2 border-gray-700 hover:border-gray-600'
                          : 'bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{voice.name}</div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {voice.description || 'AI Voice'}
                          </div>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                          ElevenLabs
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Conversion Settings */}
            <div className={`p-6 rounded-2xl border-2 ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Settings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Model</label>
                  <select 
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className={`w-full p-3 rounded-xl border-2 ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-700 text-white'
                        : 'bg-gray-50 border-gray-200 text-gray-900'
                    } focus:border-green-500 focus:outline-none`}
                  >
                    <option value="eleven_english_sts_v2">English Model (Faster)</option>
                    <option value="eleven_multilingual_sts_v2">Multilingual Model</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Stability: {stability.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={stability}
                    onChange={(e) => setStability(parseFloat(e.target.value))}
                    className="w-full accent-green-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Higher values make voice more stable but less expressive
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Similarity Boost: {similarityBoost.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={similarityBoost}
                    onChange={(e) => setSimilarityBoost(parseFloat(e.target.value))}
                    className="w-full accent-green-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enhances similarity to the target voice
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Preserve Emotion</label>
                  <button
                    onClick={() => setPreserveEmotion(!preserveEmotion)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      preserveEmotion ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      preserveEmotion ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Convert Button */}
            <button
              onClick={handleConvert}
              disabled={!originalAudioUrl || !selectedVoice || isProcessing || isLoadingVoices}
              className="w-full bg-gradient-to-r from-green-400 to-green-600 text-black py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Converting...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  <span>Convert Speech</span>
                </>
              )}
            </button>

            {/* Success Message */}
            {conversionResult && (
              <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-4 flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400 text-sm">
                  Speech converted successfully! File: {conversionResult.filename}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SpeechToSpeechPage