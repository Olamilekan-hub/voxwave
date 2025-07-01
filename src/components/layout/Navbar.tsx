'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Volume2, Sun, Moon, Mic, Waveform } from 'lucide-react'
import Link from 'next/link'
import { useTheme } from '@/contexts/ThemeContext'

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { theme, toggleTheme } = useTheme()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMenu = () => setIsOpen(!isOpen)

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/text-to-speech', label: 'Text-to-Speech' },
    { href: '/voice-cloning', label: 'Voice Cloning' },
    { href: '/speech-to-speech', label: 'Speech-to-Speech' },
    { href: '/speech-to-text', label: 'Speech-to-Text' },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'glass border-b border-border-secondary shadow-glass' 
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <div className="w-12 h-12 bg-gradient-neon rounded-2xl shadow-neon flex items-center justify-center transition-all duration-300 group-hover:shadow-neon-strong">
                <Volume2 className="w-6 h-6 text-black" />
              </div>
              {/* Audio waves around logo */}
              <div className="absolute -inset-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="waveform">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="waveform-bar w-1 bg-brand-neon"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    ></div>
                  ))}
                </div>
              </div>
            </motion.div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-gradient-neon font-display">
                VoxWave
              </span>
              <span className="text-xs text-text-secondary font-medium">
                AI Voice Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-text-secondary hover:text-brand-green-400 font-medium transition-all duration-200 py-2 group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-neon transition-all duration-300 group-hover:w-full rounded-full" />
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="w-10 h-10 glass rounded-xl flex items-center justify-center transition-all duration-200 border border-border-secondary hover:border-border-accent"
            >
              <AnimatePresence mode="wait">
                {theme === 'dark' ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="w-5 h-5 text-brand-green-400" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="w-5 h-5 text-brand-green-400" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Get Started Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-neon hover:shadow-neon text-black font-semibold px-6 py-3 rounded-xl transition-all duration-200 flex items-center space-x-2"
            >
              <Mic className="w-4 h-4" />
              <span>Get Started</span>
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center space-x-3">
            
            {/* Mobile Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="w-10 h-10 glass rounded-xl flex items-center justify-center transition-all duration-200 border border-border-secondary"
            >
              <AnimatePresence mode="wait">
                {theme === 'dark' ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="w-5 h-5 text-brand-green-400" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="w-5 h-5 text-brand-green-400" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Mobile Menu Toggle */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleMenu}
              className="w-10 h-10 glass rounded-xl flex items-center justify-center transition-all duration-200 border border-border-secondary"
            >
              {isOpen ? (
                <X className="w-5 h-5 text-text-primary" />
              ) : (
                <Menu className="w-5 h-5 text-text-primary" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden glass border-t border-border-secondary"
          >
            <div className="container mx-auto px-6 py-8">
              <div className="space-y-6">
                
                {/* Mobile Navigation Links */}
                <div className="space-y-4">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-3 text-xl font-medium text-text-secondary hover:text-brand-green-400 transition-colors duration-200 py-3 border-b border-border-primary"
                      >
                        <Waveform className="w-5 h-5" />
                        <span>{link.label}</span>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Mobile Get Started Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="pt-4"
                >
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-gradient-neon text-black font-semibold px-6 py-4 rounded-xl transition-all duration-200 shadow-neon flex items-center justify-center space-x-2"
                  >
                    <Mic className="w-5 h-5" />
                    <span>Get Started</span>
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

export default Navbar