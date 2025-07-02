'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Volume2, Sun, Moon, Menu, X, Mic } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { theme, toggleTheme, mounted } = useTheme()
  const pathname = usePathname()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigation = [
    { name: 'Text to Speech', href: '/text-to-speech' },
    { name: 'Speech to Speech', href: '/speech-to-speech' },
    { name: 'Speech to Text', href: '/speech-to-text' },
    { name: 'Pricing', href: '#pricing' },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled || pathname !== '/'
          ? theme === 'dark'
            ? 'bg-black/90 border-gray-800'
            : 'bg-white/90 border-gray-200'
          : 'bg-transparent'
      } ${isScrolled || pathname !== '/' ? 'backdrop-blur-md border-b' : ''}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <Volume2 className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                VoxWave
              </h1>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                AI Voice Platform
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`relative font-medium transition-colors duration-200 ${
                  isActive(item.href)
                    ? 'text-green-400'
                    : theme === 'dark'
                    ? 'text-gray-300 hover:text-green-400'
                    : 'text-gray-700 hover:text-green-600'
                }`}
              >
                {item.name}
                {isActive(item.href) && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-green-400 rounded-full" />
                )}
              </Link>
            ))}
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-800 hover:bg-gray-700'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {mounted ? (
                theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )
              ) : (
                <Sun className="w-5 h-5 text-yellow-400" />
              )}
            </button>
            
            <Link href="/text-to-speech">
              <button className="bg-gradient-to-r from-green-400 to-green-600 text-black px-6 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all flex items-center space-x-2">
                <Mic className="w-4 h-4" />
                <span>Get Started</span>
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'
              }`}
            >
              {mounted ? (
                theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )
              ) : (
                <Sun className="w-5 h-5 text-yellow-400" />
              )}
            </button>
            
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-lg ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'
              }`}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className={`md:hidden border-t ${
          theme === 'dark'
            ? 'bg-black/95 border-gray-800'
            : 'bg-white/95 border-gray-200'
        } backdrop-blur-md`}>
          <div className="px-4 py-6 space-y-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-green-400'
                    : theme === 'dark'
                    ? 'text-gray-300 hover:text-green-400'
                    : 'text-gray-700 hover:text-green-600'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <Link href="/text-to-speech">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full bg-gradient-to-r from-green-400 to-green-600 text-black px-6 py-3 rounded-lg font-semibold mt-4 flex items-center justify-center space-x-2"
              >
                <Mic className="w-4 h-4" />
                <span>Get Started</span>
              </button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar