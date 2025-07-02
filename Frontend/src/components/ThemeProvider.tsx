'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
  mounted: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted before checking localStorage
  useEffect(() => {
    setMounted(true)
    // Check for saved theme preference or default to dark
    const savedTheme = localStorage.getItem('voxwave-theme') as Theme | null
    
    if (savedTheme) {
      setThemeState(savedTheme)
    } else {
      setThemeState('dark') // Default to dark theme for VoxWave
    }
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
    
    // Update body background for smooth transitions
    document.body.className = theme === 'dark' 
      ? 'bg-black text-white transition-colors' 
      : 'bg-white text-gray-900 transition-colors'
    
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

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, mounted }}>
      <div className={theme === 'dark' ? 'dark' : 'light'}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}