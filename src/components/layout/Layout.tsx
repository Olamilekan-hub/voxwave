'use client'

import React from 'react'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background-primary text-text-primary transition-colors duration-300">
      {/* Background Elements */}
      <div className="fixed inset-0 -z-50">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
        
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.1)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        </div>
        
        {/* Glowing Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-green-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-neon/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        
        {/* Audio Wave Pattern */}
        <div className="absolute bottom-0 left-0 right-0 h-32 opacity-5">
          <div className="waveform absolute bottom-0 left-0 right-0 flex justify-center items-end gap-1 h-full">
            {Array.from({ length: 100 }).map((_, i) => (
              <div
                key={i}
                className="waveform-bar bg-brand-green-500"
                style={{ 
                  animationDelay: `${i * 0.05}s`,
                  height: `${Math.random() * 80 + 20}%` 
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Floating Audio Elements */}
      <div className="fixed bottom-8 right-8 z-40">
        <div className="glass rounded-2xl p-4 hidden lg:block">
          <div className="audio-visualizer">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="visualizer-bar"
                style={{ animationDelay: `${i * 0.1}s` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Layout