'use client'

import React, { useState, useRef } from 'react'
import { Play, Pause, Download, Copy, Volume2, FileText, Settings, Mic, Upload, Loader } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'

const TextToSpeechPage = () => {
  const { theme, mounted } = useTheme()
  const [text, setText] = useState('')
  const [selectedVoice, setSelectedVoice] = useState('sarah')
  const [speed, setSpeed] = useState(1)
  const [pitch, setPitch] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const voices = [
    { id: 'sarah', name: 'Sarah', description: 'Natural, warm female voice', category: 'Premium' },
    { id: 'michael', name: 'Michael', description: 'Professional male voice', category: 'Premium' },
    { id: 'emma', name: 'Emma', description: 'Young, energetic female voice', category: 'Premium' },
    { id: 'david', name: 'David', description: 'Deep, authoritative male voice', category: 'Premium' },
    { id: 'custom', name: 'Custom Voice', description: 'Your uploaded voice clone', category: 'Custom' },
  ]

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  ]

  const handleGenerate = async () => {
    if (!text.trim()) return
    
    setIsGenerating(true)
    
    // Simulate API call to ElevenLabs
    try {
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // In real implementation, this would be the actual audio URL from ElevenLabs
      setAudioUrl('/api/generated-audio.mp3')
      
    } catch (error) {
      console.error('Error generating speech:', error)
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
    if (audioUrl) {
      const link = document.createElement('a')
      link.href = audioUrl
      link.download = 'voxwave-speech.mp3'
      link.click()
    }
  }

  const exampleTexts = [
    "Welcome to VoxWave, where your words come to life with stunning AI voices.",
    "The future of voice technology is here. Experience natural, human-like speech generation.",
    "Create podcasts, audiobooks, and content with professional-quality voice synthesis.",
  ]

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Text Input */}
            <div className={`p-6 rounded-2xl border-2 ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Enter Your Text</h2>
                <div className="flex space-x-2">
                  <button className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}>
                    <Upload className="w-4 h-4" />
                  </button>
                  <button className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}>
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
            {audioUrl && (
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

                <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />
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
              </h3>
              
              <div className="space-y-3">
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
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        voice.category === 'Premium'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {voice.category}
                      </span>
                    </div>
                  </button>
                ))}
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
                Advanced Settings
              </h3>
              
              <div className="space-y-4">
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
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Pitch: {pitch}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={pitch}
                    onChange={(e) => setPitch(parseFloat(e.target.value))}
                    className="w-full accent-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!text.trim() || isGenerating}
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default TextToSpeechPage