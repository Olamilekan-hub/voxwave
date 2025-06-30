'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Play, AudioWaveform, Mic, Volume2, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

const Hero: React.FC = () => {
  const features = [
    { icon: <Volume2 className="w-5 h-5" />, label: "Text-to-Speech" },
    { icon: <Mic className="w-5 h-5" />, label: "Voice Cloning" },
    { icon: <AudioWaveform className="w-5 h-5" />, label: "Speech-to-Speech" },
  ]

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Audio Waves */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 bg-green-500/20 rounded-full"
            style={{
              left: `${15 + i * 15}%`,
              height: '60px',
            }}
            animate={{
              height: [60, 120, 80, 160, 60],
              opacity: [0.2, 0.6, 0.3, 0.8, 0.2],
            }}
            transition={{
              duration: 2 + i * 0.3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full mb-8"
          >
            <Sparkles className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-green-500">
              Next-Gen Voice AI Platform
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight"
          >
            Transform{' '}
            <span className="bg-gradient-to-r from-green-500 to-green-400 bg-clip-text text-transparent relative">
              Text
              {/* Animated underline */}
              <motion.div
                className="absolute -bottom-2 left-0 right-0 h-1 bg-green-500"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 1 }}
              />
            </span>
            <br />
            Into{' '}
            <span className="relative">
              Voice
              {/* Glowing effect */}
              <motion.div
                className="absolute inset-0 blur-2xl bg-green-500/30"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Create stunning AI voices, clone any voice, and transform speech with 
            our cutting-edge text-to-speech platform powered by ElevenLabs.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16"
          >
            <Link href="/text-to-speech">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary flex items-center space-x-3 px-8 py-4 text-lg font-semibold glow-green"
              >
                <Play className="w-6 h-6" />
                <span>Try VoxWave Now</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border-2 border-green-500 text-green-500 font-semibold px-8 py-4 text-lg rounded-lg transition-all duration-200 hover:bg-green-500 hover:text-black flex items-center space-x-3"
            >
              <Volume2 className="w-6 h-6" />
              <span>Listen to Demo</span>
            </motion.button>
          </motion.div>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-16"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-full backdrop-blur-sm hover:border-green-500/50 transition-all duration-300"
              >
                <span className="text-green-500">{feature.icon}</span>
                <span className="text-sm font-medium text-gray-300">
                  {feature.label}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* Demo Audio Visualizer */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
            className="relative max-w-2xl mx-auto"
          >
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8 transition-all duration-200 hover:border-green-500/70 hover:bg-slate-800/70">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">
                  Live Voice Preview
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-12 h-12 bg-green-500 text-black rounded-full flex items-center justify-center hover:bg-green-400 transition-all duration-300"
                >
                  <Play className="w-5 h-5 ml-0.5" />
                </motion.button>
              </div>
              
              {/* Audio Waveform Visualization */}
              <div className="flex items-center justify-center space-x-1 h-16">
                {[...Array(40)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-green-500/60 rounded-full"
                    animate={{
                      height: [8, 32, 16, 48, 8],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.1,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
              
              <p className="text-center text-gray-400 mt-4">
                Welcome to VoxWave, where your words become amazing voices.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-green-500/50 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 16, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-green-500 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  )
}

export default Hero