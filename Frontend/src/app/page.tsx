import React from 'react'
import Link from 'next/link'
import { ArrowRight, Play, Star, Sparkles, Volume2, Mic, FileText, Waves, Users, Zap, Shield, Globe } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-green-400/5"></div>
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-green-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-400/5 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-2 rounded-full mb-8">
              <Star className="w-4 h-4" />
              <span className="text-sm font-semibold">#1 AI Voice Platform</span>
              <Sparkles className="w-4 h-4" />
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              Transform{' '}
              <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                Voice
              </span>{' '}
              with AI
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-4xl mx-auto leading-relaxed">
              Create stunning AI voices, clone any voice, and transform speech with our cutting-edge platform. 
              The future of voice technology is here.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
              <Link href="/text-to-speech">
                <button className="group bg-gradient-to-r from-green-400 to-green-600 text-black px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-green-500/25 transition-all duration-300 flex items-center justify-center space-x-3 hover:scale-105">
                  <Play className="w-6 h-6" />
                  <span>Start Creating Now</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              
              <button className="px-8 py-4 rounded-xl font-semibold text-lg border-2 border-green-500 text-green-400 hover:bg-green-500/10 transition-all duration-300 flex items-center justify-center space-x-3">
                <Play className="w-6 h-6" />
                <span>Watch Demo</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent mb-2">50M+</div>
                <div className="text-gray-400">Voices Generated</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent mb-2">99%</div>
                <div className="text-gray-400">Accuracy Rate</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent mb-2">150+</div>
                <div className="text-gray-400">Languages</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Powerful Voice{' '}
              <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                Solutions
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Three revolutionary tools to transform how you work with voice and audio content
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Text to Speech */}
            <Link href="/text-to-speech">
              <div className="group bg-gray-800/50 border border-gray-700 rounded-2xl p-8 hover:border-green-500/50 hover:bg-gray-800/70 transition-all duration-300 cursor-pointer">
                <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-500/20 transition-colors">
                  <FileText className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Text to Speech</h3>
                <p className="text-gray-400 mb-6">
                  Convert any written text into natural-sounding speech with our advanced AI voices. Perfect for content creation, accessibility, and more.
                </p>
                <div className="flex items-center text-green-400 group-hover:text-green-300">
                  <span className="font-semibold">Get Started</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Speech to Speech */}
            <Link href="/speech-to-speech">
              <div className="group bg-gray-800/50 border border-gray-700 rounded-2xl p-8 hover:border-green-500/50 hover:bg-gray-800/70 transition-all duration-300 cursor-pointer">
                <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-500/20 transition-colors">
                  <Waves className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Speech to Speech</h3>
                <p className="text-gray-400 mb-6">
                  Transform existing audio with different voices while preserving emotion and intonation. Clone voices or apply new characteristics.
                </p>
                <div className="flex items-center text-green-400 group-hover:text-green-300">
                  <span className="font-semibold">Try Now</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Speech to Text */}
            <Link href="/speech-to-text">
              <div className="group bg-gray-800/50 border border-gray-700 rounded-2xl p-8 hover:border-green-500/50 hover:bg-gray-800/70 transition-all duration-300 cursor-pointer">
                <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-500/20 transition-colors">
                  <Mic className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Speech to Text</h3>
                <p className="text-gray-400 mb-6">
                  Convert spoken words into accurate written text with advanced speech recognition. Support for multiple languages and accents.
                </p>
                <div className="flex items-center text-green-400 group-hover:text-green-300">
                  <span className="font-semibold">Start Converting</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Choose{' '}
              <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                VoxWave?
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Built for creators, powered by cutting-edge AI technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-bold mb-4">Lightning Fast</h3>
              <p className="text-gray-400">
                Generate high-quality audio in seconds, not minutes. Our optimized AI delivers results instantly.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-bold mb-4">Enterprise Security</h3>
              <p className="text-gray-400">
                Your data is protected with enterprise-grade security. We never store or share your content.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Globe className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-bold mb-4">Global Language Support</h3>
              <p className="text-gray-400">
                Support for 150+ languages and accents. Create content for audiences worldwide.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-bold mb-4">Trusted by Millions</h3>
              <p className="text-gray-400">
                Join millions of creators, businesses, and developers who trust VoxWave for their voice needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Simple{' '}
              <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                Pricing
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Choose the plan that fits your needs. Start free, scale as you grow.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            
            {/* Free Plan */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-4">Starter</h3>
                <div className="text-4xl font-bold mb-2">Free</div>
                <p className="text-gray-400">Perfect for trying out</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  <span>10,000 characters/month</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  <span>3 voice options</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  <span>Standard quality</span>
                </li>
              </ul>
              <button className="w-full border-2 border-green-500 text-green-400 py-3 rounded-xl font-semibold hover:bg-green-500/10 transition-all">
                Get Started
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-gradient-to-b from-green-500/10 to-transparent border-2 border-green-500 rounded-2xl p-8 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-black px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-4">Pro</h3>
                <div className="text-4xl font-bold mb-2">
                  $29<span className="text-lg text-gray-400">/month</span>
                </div>
                <p className="text-gray-400">For content creators</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  <span>500,000 characters/month</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  <span>All premium voices</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  <span>HD quality audio</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  <span>Voice cloning</span>
                </li>
              </ul>
              <button className="w-full bg-gradient-to-r from-green-400 to-green-600 text-black py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all">
                Upgrade to Pro
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-4">Enterprise</h3>
                <div className="text-4xl font-bold mb-2">Custom</div>
                <p className="text-gray-400">For large teams</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  <span>Unlimited characters</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  <span>Custom voices</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  <span>API access</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  <span>Priority support</span>
                </li>
              </ul>
              <button className="w-full border-2 border-green-500 text-green-400 py-3 rounded-xl font-semibold hover:bg-green-500/10 transition-all">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your{' '}
            <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
              Voice?
            </span>
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join millions of creators who are already using VoxWave to bring their content to life.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/text-to-speech">
              <button className="bg-gradient-to-r from-green-400 to-green-600 text-black px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-green-500/25 transition-all duration-300 flex items-center justify-center space-x-3">
                <Volume2 className="w-6 h-6" />
                <span>Start Creating for Free</span>
                <ArrowRight className="w-6 h-6" />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}