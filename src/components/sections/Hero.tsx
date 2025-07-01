'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Play, ArrowRight, Star, Zap } from 'lucide-react'
import Link from 'next/link'

const Hero: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-20">
      <div className="container mx-auto px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto">
          
          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Column - Content */}
            <div className="space-y-8">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-full">
                <Star className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  #1 AI Voice Platform
                </span>
              </div>

              {/* Main Headline */}
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 dark:text-white leading-tight">
                  Transform{' '}
                  <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                    Text to Voice
                  </span>{' '}
                  with AI
                </h1>
                
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl">
                  Create stunning AI voices, clone any voice, and transform speech with our cutting-edge platform powered by ElevenLabs.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/text-to-speech" className="inline-block">
                  <button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-4 rounded-2xl text-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-3">
                    <Play className="w-5 h-5" />
                    Try VoxWave Free
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
                
                <button className="w-full sm:w-auto border-2 border-gray-300 dark:border-gray-600 hover:border-emerald-500 text-gray-700 dark:text-gray-300 hover:text-emerald-600 font-semibold px-8 py-4 rounded-2xl text-lg transition-all duration-200">
                  Watch Demo
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center sm:text-left">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">50M+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Voices Generated</div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">99%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy Rate</div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">150+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Languages</div>
                </div>
              </div>
            </div>

            {/* Right Column - Demo */}
            <div className="relative">
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8">
                
                {/* Demo Header */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Live Voice Synthesis
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Type text and hear it come to life
                    </p>
                  </div>
                  <button className="w-16 h-16 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl shadow-lg flex items-center justify-center transition-all duration-200">
                    <Play className="w-7 h-7 ml-1" />
                  </button>
                </div>

                {/* Text Input */}
                <div className="mb-8">
                  <textarea
                    className="w-full h-24 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Type your text here to convert to speech..."
                    defaultValue="Welcome to VoxWave, where your words become amazing voices."
                  />
                </div>

                {/* Audio Visualizer */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6 mb-6">
                  <div className="flex items-center justify-center h-20 gap-1">
                    {Array.from({ length: 40 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-emerald-500 rounded-full"
                        animate={{
                          height: [8, Math.random() * 60 + 20, 8],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.03,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Voice Options */}
                <div className="grid grid-cols-3 gap-3">
                  <button className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200">
                    Natural
                  </button>
                  <button className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 px-4 py-3 rounded-xl text-sm font-medium hover:border-emerald-200 transition-all duration-200">
                    Professional
                  </button>
                  <button className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 px-4 py-3 rounded-xl text-sm font-medium hover:border-emerald-200 transition-all duration-200">
                    Custom
                  </button>
                </div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">Instant</div>
                    <div className="text-xs text-gray-500">{'< 2 seconds'}</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                    <Star className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">Premium</div>
                    <div className="text-xs text-gray-500">Studio Grade</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero