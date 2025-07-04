"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Mic, Volume2, ArrowRight, Star, Sparkles } from "lucide-react";
import Link from "next/link";

const Hero: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentDemo, setCurrentDemo] = useState(0);

  const demoTexts = [
    "Transform your words into powerful speech",
    "Create custom voices with AI precision",
    "Convert speech to speech instantly",
    "Generate natural sounding audio",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDemo((prev) => (prev + 1) % demoTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <section className="w-full min-h-screen pt-24 pb-16">
      <div className="w-full max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 glass border border-brand-green-500/30 rounded-full">
            <Star className="w-4 h-4 text-brand-neon" />
            <span className="text-sm font-semibold text-brand-green-400">
              #1 AI Voice Platform
            </span>
            <Sparkles className="w-4 h-4 text-brand-neon" />
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left Column - Content */}
          <div className="space-y-10 text-center lg:text-left">
            {/* Main Headline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold font-display leading-tight">
                Transform <span className="text-gradient-neon">Voice</span> with
                AI
              </h1>

              <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Create stunning AI voices, clone any voice, and transform speech
                with our cutting-edge platform powered by VoxWave.
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center lg:justify-start"
            >
              <Link href="/text-to-speech">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-black font-bold px-8 lg:px-10 py-4 lg:py-5 rounded-2xl text-lg transition-all duration-200 flex items-center justify-center gap-3 shadow-lg shadow-green-500/25"
                >
                  <Play className="w-5 h-5 lg:w-6 lg:h-6" />
                  Try VoxWave Free
                  <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6" />
                </motion.button>
              </Link>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto bg-gray-800/50 backdrop-blur-sm border-2 border-green-500 hover:bg-green-500/10 text-white font-bold px-8 lg:px-10 py-4 lg:py-5 rounded-2xl text-lg transition-all duration-200 flex items-center justify-center gap-3"
              >
                <Volume2 className="w-5 h-5 lg:w-6 lg:h-6" />
                Watch Demo
              </motion.button>
            </motion.div>

            {/* Stats Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="pt-12 lg:pt-16"
            >
              <div className="grid grid-cols-3 gap-8 lg:gap-12">
                <div className="text-center lg:text-left">
                  <div className="text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent mb-2">
                    50M+
                  </div>
                  <div className="text-sm lg:text-base text-gray-400 font-medium">
                    Voices Generated
                  </div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent mb-2">
                    99%
                  </div>
                  <div className="text-sm lg:text-base text-gray-400 font-medium">
                    Accuracy Rate
                  </div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent mb-2">
                    150+
                  </div>
                  <div className="text-sm lg:text-base text-gray-400 font-medium">
                    Languages
                  </div>
                </div>
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
            {/* Main Demo Container */}
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-3xl p-6 lg:p-8 relative overflow-hidden shadow-2xl shadow-green-500/10">
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-400/5 rounded-3xl"></div>

              {/* Demo Content */}
              <div className="relative space-y-6 lg:space-y-8">
                {/* Demo Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl lg:text-2xl font-bold text-white mb-2">
                      Live Voice Synthesis
                    </h3>
                    <p className="text-gray-400 text-sm lg:text-base">
                      Type text and hear it come to life
                    </p>
                  </div>
                  <motion.button
                    onClick={togglePlay}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-green-400 to-green-500 text-black rounded-2xl flex items-center justify-center transition-all duration-200 shadow-lg shadow-green-500/25"
                  >
                    <Play className="w-6 h-6 lg:w-7 lg:h-7 ml-1" />
                  </motion.button>
                </div>

                {/* Demo Text Display */}
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-600 rounded-xl p-6 lg:p-8 min-h-[120px] lg:min-h-[140px] flex items-center">
                  <motion.p
                    key={currentDemo}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="text-lg lg:text-xl text-white font-medium leading-relaxed"
                  >
                    "{demoTexts[currentDemo]}"
                  </motion.p>
                </div>

                {/* Audio Visualizer */}
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-600 rounded-2xl p-6 lg:p-8">
                  <div className="flex items-center justify-center h-20 lg:h-24">
                    <div className="flex items-center justify-center gap-1">
                      {Array.from({ length: 15 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1 bg-gradient-to-t from-green-600 to-green-400 rounded-full"
                          animate={
                            isPlaying
                              ? {
                                  height: [8, Math.random() * 50 + 15, 8],
                                }
                              : { height: 8 }
                          }
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
                <div className="grid grid-cols-3 gap-3 lg:gap-4">
                  <button className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 lg:px-6 py-3 lg:py-4 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-green-500/20">
                    Natural
                  </button>
                  <button className="bg-gray-800/50 border border-gray-600 text-gray-300 px-4 lg:px-6 py-3 lg:py-4 rounded-xl text-sm font-medium hover:border-green-500/50 hover:text-green-400 transition-all duration-200">
                    Professional
                  </button>
                  <button className="bg-gray-800/50 border border-gray-600 text-gray-300 px-4 lg:px-6 py-3 lg:py-4 rounded-xl text-sm font-medium hover:border-green-500/50 hover:text-green-400 transition-all duration-200">
                    Custom
                  </button>
                </div>
              </div>
            </div>

            {/* Floating Feature Cards */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 bg-gray-800/70 backdrop-blur-sm border border-gray-600 rounded-2xl p-4 lg:p-6 shadow-lg shadow-green-500/10"
            >
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <Volume2 className="w-5 h-5 lg:w-6 lg:h-6 text-green-400" />
                </div>
                <div>
                  <div className="text-sm lg:text-base font-bold text-white">
                    Instant
                  </div>
                  <div className="text-xs lg:text-sm text-gray-400">
                    {"< 2 seconds"}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute -bottom-4 -left-4 bg-gray-800/70 backdrop-blur-sm border border-gray-600 rounded-2xl p-4 lg:p-6 shadow-lg shadow-green-500/10"
            >
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-400/20 rounded-xl flex items-center justify-center">
                  <Mic className="w-5 h-5 lg:w-6 lg:h-6 text-green-400" />
                </div>
                <div>
                  <div className="text-sm lg:text-base font-bold text-white">
                    Premium
                  </div>
                  <div className="text-xs lg:text-sm text-gray-400">
                    Studio Grade
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-green-400/20 rounded-full"
            animate={{
              y: [
                Math.random() *
                  (typeof window !== "undefined" ? window.innerHeight : 800),
                -100,
              ],
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
    </section>
  );
};

export default Hero;
