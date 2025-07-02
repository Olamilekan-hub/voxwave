'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Play, Pause, Download, Copy, Volume2, FileText, Settings, Mic, Upload, Loader, AlertCircle, CheckCircle } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import { ttsApi, type Voice, type TtsResponse, type VoicesResponse } from '@/lib/api'

const TextToSpeechPage = () => {
  const { theme, mounted } = useTheme()
  const [text, setText] = useState('')
  const [selectedVoice, setSelectedVoice] = useState('')
  const [stability, setStability] = useState(0.5)
  const [similarityBoost, setSimilarityBoost] = useState(0.8)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [voices, setVoices] = useState<Voice[]>([])
  const [isLoadingVoices, setIsLoadingVoices] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generatedAudio, setGeneratedAudio] = useState<TtsResponse['data'] | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  ]

  const exampleTexts = [
    "Welcome to VoxWave, where your words come to life with stunning AI voices.",
    "The future of voice technology is here. Experience natural, human-like speech generation.",
    "Create podcasts, audiobooks, and content with professional-quality voice synthesis.",
  ]

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
        // Combine ElevenLabs voices and custom voices
        const allVoices = [
          ...response.data.elevenLabsVoices,
          ...response.data.customVoices
        ]
        setVoices(allVoices)
        
        // Set default voice if available
        if (allVoices.length > 0 && !selectedVoice) {
          setSelectedVoice(allVoices[0].voice_id)
        }
      } else {
        throw new Error('Failed to load voices')
      }
    } catch (error) {
      console.error('Error loading voices:', error)
      setError(`Failed to load voices: ${error instanceof Error ? error.message : 'Unknown error'}`)
      
      // Fallback to mock data if API fails
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

  const handleGenerate = async () => {
    if (!text.trim() || !selectedVoice) {
      setError('Please enter text and select a voice')
      return
    }
    
    setIsGenerating(true)
    setError(null)
    
    try {
      const response: TtsResponse = await ttsApi.generateSpeech({
        text: text.trim(),
        voiceId: selectedVoice,
        options: {
          voice_settings: {
            stability,
            similarity_boost: similarityBoost,
            style: 0.0,
            use_speaker_boost: true
          }
        }
      })
      
      if (response.success) {
        setGeneratedAudio(response.data)
        setAudioUrl(`http://localhost:5000${response.data.audioUrl}`)
        setError(null)
      } else {
        throw new Error('Failed to generate speech')
      }
      
    } catch (error) {
      console.error('Error generating speech:', error)
      setError(`Failed to generate speech: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsGenerating(false)
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

  const handleDownload = () => {
    if (audioUrl && generatedAudio) {
      const link = document.createElement('a')
      link.href = audioUrl
      link.download = generatedAudio.filename || 'voxwave-speech.mp3'
      link.click()
    }
  }

  const copyText = () => {
    navigator.clipboard.writeText(text)
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
              <FileText className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Text to Speech</h1>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Convert your text into natural-sounding speech
              </p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <div className="text-2xl font-bold text-green-400">{text.length}</div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Characters</div>
            </div>
            <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <div className="text-2xl font-bold text-green-400">~{Math.ceil(text.length / 200)}</div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Minutes</div>
            </div>
            <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <div className="text-2xl font-bold text-green-400">HD</div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Quality</div>
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
            
            {/* Text Input */}
            <div className={`p-6 rounded-2xl border-2 ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Enter Your Text</h2>
                <div className="flex space-x-2">
                  <button 
                    onClick={copyText}
                    className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type or paste your text here..."
                className={`w-full h-48 p-4 rounded-xl border-2 ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                } focus:border-green-500 focus:outline-none resize-none`}
              />
              
              {/* Example Texts */}
              <div className="mt-4">
                <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Try these examples:
                </p>
                <div className="flex flex-wrap gap-2">
                  {exampleTexts.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setText(example)}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        theme === 'dark'
                          ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      } transition-colors`}
                    >
                      Example {index + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Generated Audio */}
            {audioUrl && generatedAudio && (
              <div className={`p-6 rounded-2xl border-2 ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                <h2 className="text-xl font-semibold mb-4">Generated Audio</h2>
                
                <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} mb-4`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handlePlay}
                        className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-black hover:shadow-lg transition-all"
                      >
                        {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                      </button>
                      <div>
                        <div className="font-medium">Generated Speech</div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Voice: {voices.find(v => v.voice_id === selectedVoice)?.name || 'Unknown'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <div className="text-sm font-medium">{generatedAudio.characterCount} chars</div>
                        <div className="text-xs text-gray-500">{(generatedAudio.fileSize / 1024).toFixed(1)} KB</div>
                      </div>
                      <button
                        onClick={handleDownload}
                        className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Audio Waveform Visualization */}
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

                <audio 
                  ref={audioRef} 
                  src={audioUrl} 
                  onEnded={() => setIsPlaying(false)}
                  onError={() => setError('Failed to load generated audio')}
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
                Voice Selection
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

            {/* Language Selection */}
            <div className={`p-6 rounded-2xl border-2 ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <h3 className="text-lg font-semibold mb-4">Language</h3>
              <select className={`w-full p-3 rounded-xl border-2 ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-gray-50 border-gray-200 text-gray-900'
              } focus:border-green-500 focus:outline-none`}>
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Advanced Settings */}
            <div className={`p-6 rounded-2xl border-2 ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Voice Settings
              </h3>
              
              <div className="space-y-4">
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
                    Enhances similarity to the original voice
                  </p>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!text.trim() || !selectedVoice || isGenerating || isLoadingVoices}
              className="w-full bg-gradient-to-r from-green-400 to-green-600 text-black py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  <span>Generate Speech</span>
                </>
              )}
            </button>

            {/* Success Message */}
            {generatedAudio && (
              <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-4 flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400 text-sm">
                  Speech generated successfully! File: {generatedAudio.filename}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TextToSpeechPage