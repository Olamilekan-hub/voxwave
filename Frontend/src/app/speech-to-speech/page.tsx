'use client'

import React, { useState, useRef, useCallback } from 'react'
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
  Loader 
} from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'

const SpeechToSpeechPage = () => {
  const { theme, mounted } = useTheme()
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [selectedVoice, setSelectedVoice] = useState('sarah')
  const [isProcessing, setIsProcessing] = useState(false)
  const [originalAudioUrl, setOriginalAudioUrl] = useState<string | null>(null)
  const [convertedAudioUrl, setConvertedAudioUrl] = useState<string | null>(null)
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false)
  const [isPlayingConverted, setIsPlayingConverted] = useState(false)
  const [quality, setQuality] = useState('high')
  const [preserveEmotion, setPreserveEmotion] = useState(true)
  const [speed, setSpeed] = useState(1)

  const originalAudioRef = useRef<HTMLAudioElement>(null)
  const convertedAudioRef = useRef<HTMLAudioElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const voices = [
    { id: 'sarah', name: 'Sarah', description: 'Natural, warm female voice', category: 'Premium' },
    { id: 'michael', name: 'Michael', description: 'Professional male voice', category: 'Premium' },
    { id: 'emma', name: 'Emma', description: 'Young, energetic female voice', category: 'Premium' },
    { id: 'david', name: 'David', description: 'Deep, authoritative male voice', category: 'Premium' },
    { id: 'sophia', name: 'Sophia', description: 'Elegant, sophisticated voice', category: 'Premium' },
    { id: 'james', name: 'James', description: 'Friendly, conversational tone', category: 'Premium' },
  ]

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('audio/')) {
      setUploadedFile(file)
      setRecordedBlob(null)
      const url = URL.createObjectURL(file)
      setOriginalAudioUrl(url)
      setConvertedAudioUrl(null)
    }
  }

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file && file.type.startsWith('audio/')) {
      setUploadedFile(file)
      setRecordedBlob(null)
      const url = URL.createObjectURL(file)
      setOriginalAudioUrl(url)
      setConvertedAudioUrl(null)
    }
  }, [])

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
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
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
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
    if (!originalAudioUrl) return

    setIsProcessing(true)
    
    try {
      // Simulate API call to ElevenLabs
      await new Promise(resolve => setTimeout(resolve, 4000))
      
      // In real implementation, this would be the converted audio URL
      setConvertedAudioUrl('/api/converted-audio.mp3')
      
    } catch (error) {
      console.error('Error converting speech:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePlayOriginal = () => {
    if (originalAudioRef.current) {
      if (isPlayingOriginal) {
        originalAudioRef.current.pause()
      } else {
        originalAudioRef.current.play()
      }
      setIsPlayingOriginal(!isPlayingOriginal)
    }
  }

  const handlePlayConverted = () => {
    if (convertedAudioRef.current) {
      if (isPlayingConverted) {
        convertedAudioRef.current.pause()
      } else {
        convertedAudioRef.current.play()
      }
      setIsPlayingConverted(!isPlayingConverted)
    }
  }

  const handleDownload = () => {
    if (convertedAudioUrl) {
      const link = document.createElement('a')
      link.href = convertedAudioUrl
      link.download = 'voxwave-converted-speech.mp3'
      link.click()
    }
  }

  const clearAudio = () => {
    setUploadedFile(null)
    setRecordedBlob(null)
    setOriginalAudioUrl(null)
    setConvertedAudioUrl(null)
    setIsPlayingOriginal(false)
    setIsPlayingConverted(false)
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
                {uploadedFile ? `${(uploadedFile.size / 1024 / 1024).toFixed(1)} MB` : '0 MB'}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>File Size</div>
            </div>
            <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <div className="text-2xl font-bold text-green-400">
                {quality === 'high' ? 'HD' : quality === 'medium' ? 'SD' : 'Fast'}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Quality</div>
            </div>
            <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <div className="text-2xl font-bold text-green-400">
                {voices.find(v => v.id === selectedVoice)?.name || 'None'}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Target Voice</div>
            </div>
          </div>
        </div>
      </div>

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
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                      theme === 'dark'
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
            {convertedAudioUrl && (
              <div className={`p-6 rounded-2xl border-2 ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                <h2 className="text-xl font-semibold mb-4">Converted Audio</h2>
                
                <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} mb-4`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handlePlayConverted}
                        className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-black hover:shadow-lg transition-all"
                      >
                        {isPlayingConverted ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                      </button>
                      <div>
                        <div className="font-medium">Converted Speech</div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Voice: {voices.find(v => v.id === selectedVoice)?.name}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleDownload}
                      className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
                    >
                      <Download className="w-5 h-5" />
                    </button>
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

                <audio 
                  ref={originalAudioRef} 
                  src={originalAudioUrl || undefined} 
                  onEnded={() => setIsPlayingOriginal(false)} 
                />
                <audio 
                  ref={convertedAudioRef} 
                  src={convertedAudioUrl} 
                  onEnded={() => setIsPlayingConverted(false)} 
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
              </h3>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {voices.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice.id)}
                    className={`w-full p-3 rounded-xl text-left transition-all ${
                      selectedVoice === voice.id
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
                          {voice.description}
                        </div>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                        {voice.category}
                      </span>
                    </div>
                  </button>
                ))}
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
                  <label className="block text-sm font-medium mb-2">Quality</label>
                  <select 
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className={`w-full p-3 rounded-xl border-2 ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-700 text-white'
                        : 'bg-gray-50 border-gray-200 text-gray-900'
                    } focus:border-green-500 focus:outline-none`}
                  >
                    <option value="high">High Quality (Slower)</option>
                    <option value="medium">Medium Quality</option>
                    <option value="fast">Fast Processing</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Speed: {speed}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={speed}
                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                    className="w-full accent-green-500"
                  />
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
              disabled={!originalAudioUrl || isProcessing}
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default SpeechToSpeechPage