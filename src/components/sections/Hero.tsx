'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Mic, Volume2, Waveform, ArrowRight, Star, Sparkles } from 'lucide-react'
import Link from 'next/link'

const Hero: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentDemo, setCurrentDemo] = useState(0)

  const demoTexts = [
    "Transform your words into powerful speech",
    "Create custom voices with AI precision",
    "Convert speech to speech instantly",
    "Generate natural sounding audio"
  ]

  // Auto-cycle demo texts
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDemo((prev) => (prev + 1) % demoTexts.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="min-h-screen pt-20 relative overflow-hidden">
      {/* Hero Content */}
      <div className="container mx-auto px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Column - Content */}
            <div className="space-y-8 text-center lg:text-left">
              
              {/* Badge */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 glass border border-brand-green-500/30 rounded-full"
              >
                <Star className="w-4 h-4 text-brand-neon" />
                <span className="text-sm font-semibold text-brand-green-400">
                  #1 AI Voice Platform
                </span>
                <Sparkles className="w-4 h-4 text-brand-neon" />
              </motion.div>

              {/* Main Headline */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="space-y-6"
              >
                <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold font-display leading-tight">
                  Transform{' '}
                  <span className="text-gradient-neon">
                    Voice
                  </span>{' '}
                  with AI
                </h1>
                
                <p className="text-xl text-text-secondary leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Create stunning AI voices, clone any voice, and transform speech with our cutting-edge platform powered by ElevenLabs.
                </p>
              </motion.div>

              {/* Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Link href="/text-to-speech" className="inline-block">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto bg-gradient-neon hover:shadow-neon text-black font-semibold px-8 py-4 rounded-2xl text-lg transition-all duration-200 flex items-center justify-center gap-3"
                  >
                    <Play className="w-5 h-5" />
                    Try VoxWave Free
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
                
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto glass border-2 border-brand-green-500 hover:bg-brand-green-500/10 text-text-primary font-semibold px-8 py-4 rounded-2xl text-lg transition-all duration-200"
                >
                  Watch Demo
                </motion.button>
              </motion.div>

              {/* Stats */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="grid grid-cols-3 gap-8 pt-8 border-t border-border-primary"
              >
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-gradient-neon">50M+</div>
                  <div className="text-sm text-text-secondary">Voices Generated</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-gradient-neon">99%</div>
                  <div className="text-sm text-text-secondary">Accuracy Rate</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-gradient-neon">150+</div>
                  <div className="text-sm text-text-secondary">Languages</div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Interactive Demo */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="glass-strong rounded-3xl shadow-neon p-8 relative overflow-hidden">
                
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-green-500/5 to-brand-neon/5"></div>
                
                {/* Demo Header */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-2xl font-bold text-text-primary mb-2 font-display">
                        Live Voice Synthesis
                      </h3>
                      <p className="text-text-secondary">
                        Type text and hear it come to life
                      </p>
                    </div>
                    <motion.button
                      onClick={togglePlay}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-16 h-16 bg-gradient-neon hover:shadow-neon text-black rounded-2xl flex items-center justify-center transition-all duration-200"
                    >
                      <Play className="w-7 h-7 ml-1" />
                    </motion.button>
                  </div>

                  {/* Demo Text Display */}
                  <div className="mb-8">
                    <div className="glass rounded-xl p-6 min-h-[120px] flex items-center">
                      <motion.p
                        key={currentDemo}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="text-lg text-text-primary font-medium"
                      >
                        "{demoTexts[currentDemo]}"
                      </motion.p>
                    </div>
                  </div>

                  {/* Audio Visualizer */}
                  <div className="glass rounded-2xl p-6 mb-6">
                    <div className="flex items-center justify-center h-20">
                      <div className="audio-visualizer">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <motion.div
                            key={i}
                            className="visualizer-bar"
                            animate={isPlaying ? {
                              height: [12, Math.random() * 48 + 20, 12],
                            } : { height: 12 }}
                            transition={{
                              duration: 1.5,
                              repeat: isPlaying ? Infinity : 0,
                              delay: i * 0.1,
                              ease: "easeInOut",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Voice Options */}
                  <div className="grid grid-cols-3 gap-3">
                    <button className="glass border border-brand-green-500/50 text-brand-green-400 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-brand-green-500/10">
                      Natural
                    </button>
                    <button className="glass border border-border-secondary text-text-secondary px-4 py-3 rounded-xl text-sm font-medium hover:border-brand-green-500/50 hover:text-brand-green-400 transition-all duration-200">
                      Professional
                    </button>
                    <button className="glass border border-border-secondary text-text-secondary px-4 py-3 rounded-xl text-sm font-medium hover:border-brand-green-500/50 hover:text-brand-green-400 transition-all duration-200">
                      Custom
                    </button>
                  </div>
                </div>
              </div>

              {/* Floating Feature Cards */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 glass rounded-2xl shadow-neon p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-green-500/20 rounded-xl flex items-center justify-center">
                    <Volume2 className="w-5 h-5 text-brand-neon" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-text-primary">Instant</div>
                    <div className="text-xs text-text-secondary">{'< 2 seconds'}</div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-4 -left-4 glass rounded-2xl shadow-neon p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-neon/20 rounded-xl flex items-center justify-center">
                    <Mic className="w-5 h-5 text-brand-neon" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-text-primary">Premium</div>
                    <div className="text-xs text-text-secondary">Studio Grade</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-brand-neon/30 rounded-full"
            animate={{
              y: [Math.random() * window.innerHeight, -100],
              x: [Math.random() * 50 - 25, Math.random() * 50 - 25],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default Hero