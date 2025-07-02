'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted before checking localStorage
  useEffect(() => {
    setMounted(true)
    // Check for saved theme preference or default to dark (VoxWave's primary theme)
    const savedTheme = localStorage.getItem('voxwave-theme') as Theme | null
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    
    setThemeState(savedTheme || systemPreference || 'dark')
  }, [])

  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    
    // Remove both theme classes
    root.classList.remove('light', 'dark')
    
    // Add current theme class
    root.classList.add(theme)
    
    // Set data attribute for CSS variables
    root.setAttribute('data-theme', theme)
    
    // Save to localStorage
    localStorage.setItem('voxwave-theme', theme)
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        theme === 'dark' ? '#000000' : '#ffffff'
      )
    }
  }, [theme, mounted])

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light')
  }

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}