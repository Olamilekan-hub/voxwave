"use client";
import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  Mic, 
  FileText, 
  Waves, 
  Play, 
  Pause, 
  Upload, 
  Download,
  Settings,
  Sun,
  Moon,
  Menu,
  X,
  ArrowRight,
  Star,
  Sparkles
} from 'lucide-react';

const VoxWave = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSection, setCurrentSection] = useState('text-to-speech');

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const features = [
    {
      id: 'text-to-speech',
      title: 'Text to Speech',
      icon: FileText,
      description: 'Convert written text into natural-sounding speech'
    },
    {
      id: 'speech-to-speech',
      title: 'Speech to Speech',
      icon: Waves,
      description: 'Transform existing audio with different voices'
    },
    {
      id: 'speech-to-text',
      title: 'Speech to Text',
      icon: Mic,
      description: 'Convert spoken words into written text'
    }
  ];

  return (
    <div className={`min-h-screen transition-all duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${darkMode ? 'bg-black/80 border-gray-800' : 'bg-white/80 border-gray-200'} backdrop-blur-md border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                <Volume2 className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                  VoxWave
                </h1>
                <p className="text-xs text-gray-500">AI Voice Platform</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-green-500 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-green-500 transition-colors">Pricing</a>
              <a href="#about" className="text-gray-600 hover:text-green-500 transition-colors">About</a>
              
              {/* Theme Toggle */}
              <button 
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <button className="bg-gradient-to-r from-green-400 to-green-600 text-black px-6 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all">
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <button 
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className={`md:hidden border-t ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-200'}`}>
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block text-gray-600 hover:text-green-500">Features</a>
              <a href="#pricing" className="block text-gray-600 hover:text-green-500">Pricing</a>
              <a href="#about" className="block text-gray-600 hover:text-green-500">About</a>
              <button className="w-full bg-gradient-to-r from-green-400 to-green-600 text-black px-6 py-2 rounded-lg font-semibold">
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-green-500/10 text-green-400 px-4 py-2 rounded-full mb-6">
              <Star className="w-4 h-4" />
              <span className="text-sm font-semibold">#1 AI Voice Platform</span>
              <Sparkles className="w-4 h-4" />
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Transform{' '}
              <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                Voice
              </span>{' '}
              with AI
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Create stunning AI voices, clone any voice, and transform speech with our cutting-edge platform powered by ElevenLabs.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <button className="bg-gradient-to-r from-green-400 to-green-600 text-black px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all flex items-center justify-center space-x-2">
                <Play className="w-5 h-5" />
                <span>Try VoxWave Free</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className={`px-8 py-3 rounded-lg font-semibold border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-black transition-all`}>
                Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">50M+</div>
                <div className="text-sm text-gray-500">Voices Generated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">99%</div>
                <div className="text-sm text-gray-500">Accuracy Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">150+</div>
                <div className="text-sm text-gray-500">Languages</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Feature Tabs */}
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left Side - Feature List */}
            <div className="lg:w-1/3">
              <h2 className="text-3xl font-bold mb-8">Choose Your Voice Tool</h2>
              <div className="space-y-4">
                {features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <button
                      key={feature.id}
                      onClick={() => setCurrentSection(feature.id)}
                      className={`w-full text-left p-4 rounded-xl transition-all ${
                        currentSection === feature.id
                          ? 'bg-green-500/10 border-2 border-green-500'
                          : darkMode 
                            ? 'bg-gray-800 border-2 border-gray-700 hover:border-gray-600'
                            : 'bg-white border-2 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          currentSection === feature.id 
                            ? 'bg-green-500/20 text-green-400' 
                            : darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{feature.title}</h3>
                          <p className="text-sm text-gray-500">{feature.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Side - Feature Demo */}
            <div className="lg:w-2/3">
              <div className={`p-8 rounded-2xl border-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                
                {currentSection === 'text-to-speech' && (
                  <div>
                    <h3 className="text-2xl font-bold mb-6">Text to Speech</h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Enter your text</label>
                        <textarea
                          placeholder="Type or paste your text here..."
                          className={`w-full p-4 rounded-lg border-2 ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-gray-50 border-gray-200 text-gray-900'
                          } focus:border-green-500 focus:outline-none`}
                          rows={4}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Voice</label>
                          <select className={`w-full p-3 rounded-lg border-2 ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-gray-50 border-gray-200 text-gray-900'
                          }`}>
                            <option>Natural Voice</option>
                            <option>Professional Voice</option>
                            <option>Custom Voice</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Speed</label>
                          <input 
                            type="range" 
                            min="0.5" 
                            max="2" 
                            step="0.1" 
                            defaultValue="1"
                            className="w-full"
                          />
                        </div>
                      </div>

                      <button className="w-full bg-gradient-to-r from-green-400 to-green-600 text-black py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all flex items-center justify-center space-x-2">
                        <Play className="w-5 h-5" />
                        <span>Generate Speech</span>
                      </button>
                    </div>
                  </div>
                )}

                {currentSection === 'speech-to-speech' && (
                  <div>
                    <h3 className="text-2xl font-bold mb-6">Speech to Speech</h3>
                    <div className="space-y-6">
                      <div className={`border-2 border-dashed rounded-lg p-8 text-center ${
                        darkMode ? 'border-gray-600' : 'border-gray-300'
                      }`}>
                        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500">Drop your audio file here or click to upload</p>
                        <button className="mt-4 bg-green-500/10 text-green-400 px-4 py-2 rounded-lg">
                          Choose File
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Target Voice</label>
                          <select className={`w-full p-3 rounded-lg border-2 ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-gray-50 border-gray-200 text-gray-900'
                          }`}>
                            <option>Natural Voice</option>
                            <option>Professional Voice</option>
                            <option>Custom Voice</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Quality</label>
                          <select className={`w-full p-3 rounded-lg border-2 ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-gray-50 border-gray-200 text-gray-900'
                          }`}>
                            <option>High Quality</option>
                            <option>Medium Quality</option>
                            <option>Fast Processing</option>
                          </select>
                        </div>
                      </div>

                      <button className="w-full bg-gradient-to-r from-green-400 to-green-600 text-black py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all flex items-center justify-center space-x-2">
                        <Waves className="w-5 h-5" />
                        <span>Convert Speech</span>
                      </button>
                    </div>
                  </div>
                )}

                {currentSection === 'speech-to-text' && (
                  <div>
                    <h3 className="text-2xl font-bold mb-6">Speech to Text</h3>
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <button className={`p-6 rounded-lg border-2 transition-all ${
                          darkMode 
                            ? 'border-gray-600 hover:border-green-500' 
                            : 'border-gray-200 hover:border-green-500'
                        }`}>
                          <Mic className="w-8 h-8 mx-auto mb-2 text-green-400" />
                          <p className="font-medium">Record Audio</p>
                          <p className="text-sm text-gray-500">Start recording</p>
                        </button>

                        <button className={`p-6 rounded-lg border-2 transition-all ${
                          darkMode 
                            ? 'border-gray-600 hover:border-green-500' 
                            : 'border-gray-200 hover:border-green-500'
                        }`}>
                          <Upload className="w-8 h-8 mx-auto mb-2 text-green-400" />
                          <p className="font-medium">Upload File</p>
                          <p className="text-sm text-gray-500">Choose audio file</p>
                        </button>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Language</label>
                        <select className={`w-full p-3 rounded-lg border-2 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-gray-50 border-gray-200 text-gray-900'
                        }`}>
                          <option>English</option>
                          <option>Spanish</option>
                          <option>French</option>
                          <option>German</option>
                        </select>
                      </div>

                      <button className="w-full bg-gradient-to-r from-green-400 to-green-600 text-black py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all flex items-center justify-center space-x-2">
                        <FileText className="w-5 h-5" />
                        <span>Transcribe Audio</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 px-4 sm:px-6 lg:px-8 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-600 rounded-lg flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
              VoxWave
            </span>
          </div>
          <p className="text-gray-500">
            © 2025 VoxWave. All rights reserved. Powered by ElevenLabs.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default VoxWave;