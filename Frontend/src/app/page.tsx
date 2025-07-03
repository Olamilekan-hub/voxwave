'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { 
  ArrowRight, 
  Play, 
  Pause,
  Star, 
  Sparkles, 
  Volume2, 
  Mic, 
  FileText, 
  Waves, 
  Zap, 
  Shield, 
  Globe, 
  Users,
  CheckCircle,
  TrendingUp,
  Award,
  Headphones,
  // Waveform,
  Cpu,
  Brain,
  Rocket,
  // Lightning
} from 'lucide-react'

// Demo text options for the voice synthesis
const demoTexts = [
  "Welcome to the future of voice technology with VoxWave AI.",
  "Transform any text into natural, human-like speech instantly.",
  "Experience the power of artificial intelligence in voice generation.",
  "Create custom voices that sound incredibly realistic and engaging."
]

// Voice samples data
const voiceSamples = [
  { id: 'sarah', name: 'Sarah', description: 'Professional & Clear', accent: 'American' },
  { id: 'david', name: 'David', description: 'Warm & Friendly', accent: 'British' },
  { id: 'emma', name: 'Emma', description: 'Energetic & Young', accent: 'Australian' },
  { id: 'james', name: 'James', description: 'Authoritative & Deep', accent: 'Canadian' }
]

// Trust indicators data
const trustIndicators = [
  { metric: '50M+', label: 'Voices Generated', icon: Volume2 },
  { metric: '99.9%', label: 'Uptime', icon: Zap },
  { metric: '150+', label: 'Languages', icon: Globe },
  { metric: '500K+', label: 'Happy Users', icon: Users }
]

// Company logos for social proof
const trustedCompanies = [
  'Microsoft', 'Google', 'Amazon', 'Meta', 'Apple', 'Netflix', 'Spotify', 'Adobe'
]

export default function LandingPage() {
  const [currentDemoText, setCurrentDemoText] = useState(0)
  const [selectedVoice, setSelectedVoice] = useState('sarah')
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  const [userHasInteracted, setUserHasInteracted] = useState(false)
  
  const heroRef = useRef<HTMLElement>(null)
  const featuresRef = useRef<HTMLElement>(null)
  
  const { scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.8])
  
  const isHeroInView = useInView(heroRef, { once: true })
  const isFeaturesInView = useInView(featuresRef, { once: true })

  // Rotate demo text every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDemoText((prev) => (prev + 1) % demoTexts.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // Initialize audio context on first user interaction
  const initializeAudio = async () => {
    if (!audioContext && !userHasInteracted) {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
        setAudioContext(ctx)
        setUserHasInteracted(true)
      } catch (error) {
        console.log('Audio not supported')
      }
    }
  }

  // Handle voice playback (mock for now - would integrate with actual TTS)
  const handlePlayVoice = async () => {
    await initializeAudio()
    setIsPlaying(!isPlaying)
    
    // Mock audio playback - in real implementation, this would call TTS API
    if (!isPlaying) {
      setTimeout(() => setIsPlaying(false), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white overflow-hidden">
      
      {/* Hero Section */}
      <motion.section 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8"
        style={{ opacity: heroOpacity, scale: heroScale }}
      >
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-green-500/20 rounded-full blur-3xl animate-pulse-glow"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-green-500/5 to-transparent rounded-full"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Side - Content */}
            <motion.div 
              className="text-center lg:text-left space-y-8"
              initial={{ opacity: 0, x: -50 }}
              animate={isHeroInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* Badge */}
              <motion.div 
                className="inline-flex items-center space-x-2 glass px-6 py-3 rounded-full border border-green-500/30"
                initial={{ opacity: 0, y: 20 }}
                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-sm font-semibold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                  #1 AI Voice Platform
                </span>
                <Sparkles className="w-5 h-5 text-green-400" />
              </motion.div>

              {/* Main Headline */}
              <div className="space-y-4">
                <motion.h1 
                  className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
                  initial={{ opacity: 0, y: 30 }}
                  animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  Transform{' '}
                  <span className="gradient-neon animate-pulse-glow">Voice</span>
                  <br />
                  with AI Magic
                </motion.h1>
                
                <motion.p 
                  className="text-xl md:text-2xl text-gray-300 max-w-2xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  Experience the future of voice technology. Create natural speech, 
                  clone voices, and transform audio with cutting-edge AI powered by ElevenLabs.
                </motion.p>
              </div>

              {/* CTA Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 1 }}
              >
                <Link href="/text-to-speech">
                  <button className="btn-primary group">
                    <Rocket className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                    Start Creating Now
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                
                <button 
                  onClick={handlePlayVoice}
                  className="btn-secondary group"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  )}
                  Hear the Magic
                </button>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div 
                className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                {trustIndicators.map((item, index) => (
                  <div key={index} className="text-center">
                    <item.icon className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <div className="text-3xl font-bold gradient-text">{item.metric}</div>
                    <div className="text-sm text-gray-400">{item.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Side - Interactive Demo */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={isHeroInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {/* Main Demo Container */}
              <div className="glass-strong rounded-3xl p-8 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-blue-500/5 rounded-3xl"></div>
                
                <div className="relative space-y-6">
                  {/* Demo Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        Live Voice Synthesis
                      </h3>
                      <p className="text-gray-400">
                        Experience AI voice generation in real-time
                      </p>
                    </div>
                    <motion.button
                      onClick={handlePlayVoice}
                      className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-500 text-black rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isPlaying ? (
                        <Pause className="w-8 h-8" />
                      ) : (
                        <Play className="w-8 h-8 ml-1" />
                      )}
                    </motion.button>
                  </div>

                  {/* Demo Text Display */}
                  <div className="glass rounded-2xl p-6 min-h-[120px] flex items-center">
                    <motion.p
                      key={currentDemoText}
                      className="text-lg text-white font-medium leading-relaxed"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                    >
                      "{demoTexts[currentDemoText]}"
                    </motion.p>
                  </div>

                  {/* Audio Visualizer */}
                  <div className="glass rounded-2xl p-6">
                    <div className="audio-visualizer">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div
                          key={i}
                          className={`audio-bar ${isPlaying ? 'active' : ''}`}
                          style={{
                            height: isPlaying ? `${Math.random() * 40 + 10}px` : '8px',
                            animationDelay: `${i * 0.1}s`,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Voice Options */}
                  <div className="grid grid-cols-2 gap-3">
                    {voiceSamples.map((voice) => (
                      <button
                        key={voice.id}
                        onClick={() => setSelectedVoice(voice.id)}
                        className={`p-4 rounded-xl text-left transition-all ${
                          selectedVoice === voice.id
                            ? 'bg-green-500/20 border-2 border-green-500'
                            : 'glass border border-gray-600 hover:border-green-500/50'
                        }`}
                      >
                        <div className="font-medium text-white">{voice.name}</div>
                        <div className="text-sm text-gray-400">{voice.description}</div>
                        <div className="text-xs text-green-400">{voice.accent}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Feature Cards */}
              <motion.div 
                className="absolute -top-6 -right-6 glass rounded-2xl p-4 border border-green-500/30"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="flex items-center gap-3">
                  {/* <Lightning className="w-8 h-8 text-yellow-400" /> */}
                  <div>
                    <div className="font-bold text-white">Instant</div>
                    <div className="text-xs text-gray-400"> 2 seconds</div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="absolute -bottom-6 -left-6 glass rounded-2xl p-4 border border-blue-500/30"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <div className="flex items-center gap-3">
                  <Brain className="w-8 h-8 text-blue-400" />
                  <div>
                    <div className="font-bold text-white">Premium</div>
                    <div className="text-xs text-gray-400">Studio Grade</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Social Proof Section */}
      <section className="py-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-400 text-lg">Trusted by industry leaders worldwide</p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8 items-center opacity-50"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.5 }}
            transition={{ duration: 0.8, staggerChildren: 0.1 }}
            viewport={{ once: true }}
          >
            {trustedCompanies.map((company, index) => (
              <motion.div
                key={company}
                className="text-center font-semibold text-gray-500 hover:text-gray-300 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                {company}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section - Bento Box Layout */}
      <motion.section 
        ref={featuresRef}
        className="py-20 px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Three Powerful{' '}
              <span className="gradient-neon">AI Tools</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Everything you need to transform voice and audio content with cutting-edge artificial intelligence
            </p>
          </motion.div>

          {/* Bento Grid */}
          <div className="bento-grid">
            
            {/* Text to Speech - Large Card */}
            <motion.div 
              className="bento-card lg:col-span-2 lg:row-span-2 relative overflow-hidden group"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <FileText className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-3xl font-bold mb-4">Text to Speech</h3>
                <p className="text-gray-400 mb-8 text-lg leading-relaxed">
                  Convert any written text into natural-sounding speech with our advanced AI voices. 
                  Perfect for content creation, accessibility, and bringing your words to life.
                </p>
                
                {/* Feature highlights */}
                <div className="space-y-3 mb-8">
                  {[
                    'Natural human-like voices',
                    '150+ languages supported',
                    'Custom voice cloning',
                    'Real-time generation'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Link href="/text-to-speech">
                  <button className="btn-primary group">
                    <span>Get Started</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </div>
            </motion.div>

            {/* Speech to Speech */}
            <motion.div 
              className="bento-card relative overflow-hidden group"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Waves className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Speech to Speech</h3>
                <p className="text-gray-400 mb-6">
                  Transform existing audio with different voices while preserving emotion and intonation.
                </p>
                <Link href="/speech-to-speech">
                  <button className="btn-secondary text-sm">
                    <span>Try Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </motion.div>

            {/* Speech to Text */}
            <motion.div 
              className="bento-card relative overflow-hidden group"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Mic className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Speech to Text</h3>
                <p className="text-gray-400 mb-6">
                  Convert spoken words into accurate written text with advanced speech recognition.
                </p>
                <Link href="/speech-to-text">
                  <button className="btn-secondary text-sm">
                    <span>Convert Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </motion.div>

            {/* Performance Stats */}
            <motion.div 
              className="bento-card lg:col-span-2 relative overflow-hidden"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="grid grid-cols-3 gap-8 text-center">
                <div>
                  <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold gradient-text">99.9%</div>
                  <div className="text-gray-400">Accuracy</div>
                </div>
                <div>
                  <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold gradient-text">2s</div>
                  <div className="text-gray-400">Generation Time</div>
                </div>
                <div>
                  <Award className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold gradient-text">Enterprise</div>
                  <div className="text-gray-400">Grade Security</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-blue-500/5 to-purple-500/10"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your{' '}
              <span className="gradient-neon">Voice?</span>
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Join millions of creators, businesses, and developers who trust VoxWave 
              for their voice AI needs. Start creating today.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/text-to-speech">
                <button className="btn-primary group text-lg px-8 py-4">
                  <Rocket className="w-6 h-6" />
                  Start Creating for Free
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}