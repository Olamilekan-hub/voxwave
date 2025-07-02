'use client'

import React, { useState, useRef, useCallback } from 'react'
import { 
  Play, 
  Pause, 
  Download, 
  Upload, 
  Mic, 
  MicOff, 
  FileText, 
  Copy, 
  Settings, 
  Trash2, 
  Clock, 
  Users, 
  Loader,
  CheckCircle,
  Volume2
} from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'

const SpeechToTextPage = () => {
  const { theme, mounted } = useTheme()
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcription, setTranscription] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('en-US')
  const [includeTimestamps, setIncludeTimestamps] = useState(false)
  const [speakerDiarization, setSpeakerDiarization] = useState(false)
  const [confidence, setConfidence] = useState(0.95)
  const [isLiveTranscription, setIsLiveTranscription] = useState(false)
  const [liveText, setLiveText] = useState('')

  const audioRef = useRef<HTMLAudioElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const languages = [
    { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
    { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
    { code: 'es-ES', name: 'Spanish (Spain)', flag: '🇪🇸' },
    { code: 'es-MX', name: 'Spanish (Mexico)', flag: '🇲🇽' },
    { code: 'fr-FR', name: 'French (France)', flag: '🇫🇷' },
    { code: 'de-DE', name: 'German', flag: '🇩🇪' },
    { code: 'it-IT', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt-BR', name: 'Portuguese (Brazil)', flag: '🇧🇷' },
    { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko-KR', name: 'Korean', flag: '🇰🇷' },
    { code: 'zh-CN', name: 'Chinese (Mandarin)', flag: '🇨🇳' },
    { code: 'ar-SA', name: 'Arabic', flag: '🇸🇦' },
  ]

  const mockTranscriptions = [
    "Welcome to VoxWave, the revolutionary AI voice platform that transforms how we interact with audio content.",
    "In today's digital world, the ability to convert speech to text has become increasingly important for accessibility and productivity.",
    "Our advanced speech recognition technology can accurately transcribe multiple languages with high precision and speed.",
    "Whether you're transcribing meetings, interviews, or creating subtitles, VoxWave provides the tools you need.",
  ]

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('audio/')) {
      setUploadedFile(file)
      setRecordedBlob(null)
      const url = URL.createObjectURL(file)
      setAudioUrl(url)
      setTranscription('')
    }
  }

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file && file.type.startsWith('audio/')) {
      setUploadedFile(file)
      setRecordedBlob(null)
      const url = URL.createObjectURL(file)
      setAudioUrl(url)
      setTranscription('')
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
        setAudioUrl(url)
        setTranscription('')
      }

      mediaRecorder.start()
      setIsRecording(true)

      // Start live transcription simulation
      if (isLiveTranscription) {
        startLiveTranscription()
      }
    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setLiveText('')
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
    }
  }

  const startLiveTranscription = () => {
    const words = mockTranscriptions[0].split(' ')
    let index = 0
    
    const interval = setInterval(() => {
      if (index < words.length && isRecording) {
        setLiveText(prev => prev + (prev ? ' ' : '') + words[index])
        index++
      } else {
        clearInterval(interval)
      }
    }, 300)
  }

  const handleTranscribe = async () => {
    if (!audioUrl) return

    setIsTranscribing(true)
    
    try {
      // Simulate progressive transcription
      const selectedTranscription = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)]
      const words = selectedTranscription.split(' ')
      
      setTranscription('')
      
      for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 150))
        setTranscription(prev => prev + (prev ? ' ' : '') + words[i])
      }
      
    } catch (error) {
      console.error('Error transcribing audio:', error)
    } finally {
      setIsTranscribing(false)
    }
  }

  const handlePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const copyTranscription = () => {
    navigator.clipboard.writeText(transcription)
  }

  const downloadTranscription = () => {
    const blob = new Blob([transcription], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'voxwave-transcription.txt'
    link.click()
    URL.revokeObjectURL(url)
  }

  const formatTranscriptionWithTimestamps = (text: string) => {
    if (!includeTimestamps) return text
    
    const words = text.split(' ')
    let formatted = ''
    let timestamp = 0
    
    words.forEach((word, index) => {
      if (index % 10 === 0) {
        const minutes = Math.floor(timestamp / 60)
        const seconds = timestamp % 60
        formatted += `\n[${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}] `
        timestamp += 10
      }
      formatted += word + ' '
    })
    
    return formatted.trim()
  }

  const clearAudio = () => {
    setUploadedFile(null)
    setRecordedBlob(null)
    setAudioUrl(null)
    setTranscription('')
    setLiveText('')
    setIsPlaying(false)
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
              <FileText className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Speech to Text</h1>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Convert spoken words into accurate written text
              </p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <div className="text-2xl font-bold text-green-400">{transcription.length}</div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Characters</div>
            </div>
            <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <div className="text-2xl font-bold text-green-400">{transcription.split(' ').filter(w => w).length}</div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Words</div>
            </div>
            <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <div className="text-2xl font-bold text-green-400">{Math.round(confidence * 100)}%</div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Confidence</div>
            </div>
            <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <div className="text-2xl font-bold text-green-400">
                {languages.find(l => l.code === selectedLanguage)?.flag || '🌐'}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Language</div>
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
              <h2 className="text-xl font-semibold mb-6">Audio Input</h2>
              
              {!audioUrl ? (
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
                    
                    {/* Live Transcription */}
                    {isRecording && isLiveTranscription && (
                      <div className={`mt-4 p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        <div className="flex items-center mb-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
                          <span className="text-sm font-medium">Live Transcription</span>
                        </div>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {liveText || 'Listening...'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Audio Player */
                <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handlePlay}
                        className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-black hover:shadow-lg transition-all"
                      >
                        {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                      </button>
                      <div>
                        <div className="font-medium">Audio File</div>
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
                  <div className="h-16 bg-gradient-to-r from-green-400/20 to-green-600/20 rounded-lg flex items-center justify-center">
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: 50 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-green-400 rounded-full"
                          style={{ 
                            height: `${Math.random() * 40 + 8}px`,
                            opacity: isPlaying ? 0.8 : 0.3
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

            {/* Transcription Results */}
            <div className={`p-6 rounded-2xl border-2 ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Transcription</h2>
                {transcription && (
                  <div className="flex space-x-2">
                    <button
                      onClick={copyTranscription}
                      className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                    <button
                      onClick={downloadTranscription}
                      className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
              
              <div className={`min-h-48 p-4 rounded-xl border-2 ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-gray-50 border-gray-200'
              }`}>
                {isTranscribing ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="flex items-center space-x-3">
                      <Loader className="w-6 h-6 animate-spin text-green-400" />
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                        Transcribing audio...
                      </span>
                    </div>
                  </div>
                ) : transcription ? (
                  <div className="space-y-4">
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} leading-relaxed whitespace-pre-wrap`}>
                      {formatTranscriptionWithTimestamps(transcription)}
                    </div>
                    
                    {/* Confidence Indicator */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-300">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-sm font-medium">Transcription Complete</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">Confidence:</span>
                        <span className="text-sm font-medium text-green-400">{Math.round(confidence * 100)}%</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32">
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      Upload an audio file or record your voice to start transcription
                    </p>
                  </div>
                )}
              </div>

              <audio ref={audioRef} src={audioUrl || undefined} onEnded={() => setIsPlaying(false)} />
            </div>
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            
            {/* Language Selection */}
            <div className={`p-6 rounded-2xl border-2 ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <h3 className="text-lg font-semibold mb-4">Language</h3>
              <select 
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className={`w-full p-3 rounded-xl border-2 ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-gray-50 border-gray-200 text-gray-900'
                } focus:border-green-500 focus:outline-none`}
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Transcription Options */}
            <div className={`p-6 rounded-2xl border-2 ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Options
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <label className="text-sm font-medium">Include Timestamps</label>
                  </div>
                  <button
                    onClick={() => setIncludeTimestamps(!includeTimestamps)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      includeTimestamps ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      includeTimestamps ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <label className="text-sm font-medium">Speaker Identification</label>
                  </div>
                  <button
                    onClick={() => setSpeakerDiarization(!speakerDiarization)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      speakerDiarization ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      speakerDiarization ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Volume2 className="w-4 h-4" />
                    <label className="text-sm font-medium">Live Transcription</label>
                  </div>
                  <button
                    onClick={() => setIsLiveTranscription(!isLiveTranscription)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      isLiveTranscription ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      isLiveTranscription ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Transcribe Button */}
            <button
              onClick={handleTranscribe}
              disabled={!audioUrl || isTranscribing}
              className="w-full bg-gradient-to-r from-green-400 to-green-600 text-black py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isTranscribing ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Transcribing...</span>
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  <span>Start Transcription</span>
                </>
              )}
            </button>

            {/* Quick Actions */}
            <div className={`p-6 rounded-2xl border-2 ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-800 hover:bg-gray-700'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}>
                  Meeting Notes
                </button>
                <button className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-800 hover:bg-gray-700'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}>
                  Interview
                </button>
                <button className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-800 hover:bg-gray-700'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}>
                  Lecture
                </button>
                <button className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-800 hover:bg-gray-700'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}>
                  Podcast
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SpeechToTextPage