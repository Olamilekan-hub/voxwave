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

// Script to prevent flash - this should be inlined in the HTML head
const themeScript = `
(function() {
  function getInitialTheme() {
    const persistedTheme = localStorage.getItem('voxwave-theme');
    if (persistedTheme) return persistedTheme;
    
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    return systemPreference;
  }
  
  const theme = getInitialTheme();
  document.documentElement.classList.add(theme);
  document.documentElement.setAttribute('data-theme', theme);
  
  // Set CSS custom properties immediately
  if (theme === 'dark') {
    document.documentElement.style.setProperty('--bg-primary', '#000000');
    document.documentElement.style.setProperty('--bg-secondary', '#111827');
    document.documentElement.style.setProperty('--text-primary', '#ffffff');
    document.documentElement.style.setProperty('--text-secondary', '#d1d5db');
  } else {
    document.documentElement.style.setProperty('--bg-primary', '#ffffff');
    document.documentElement.style.setProperty('--bg-secondary', '#f9fafb');
    document.documentElement.style.setProperty('--text-primary', '#111827');
    document.documentElement.style.setProperty('--text-secondary', '#6b7280');
  }
})();
`;

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  // Inject the theme script on first render
  useEffect(() => {
    // Create script element to prevent flash
    const script = document.createElement('script')
    script.innerHTML = themeScript
    document.head.appendChild(script)
    
    setMounted(true)
    
    // Get the theme that was set by the script
    const initialTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    setThemeState(initialTheme)
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('voxwave-theme')) {
        const newTheme = e.matches ? 'dark' : 'light'
        setThemeState(newTheme)
        applyTheme(newTheme)
      }
    }
    
    mediaQuery.addEventListener('change', handleSystemThemeChange)
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
      // Clean up script
      const existingScript = document.head.querySelector('script[data-theme-script]')
      if (existingScript) {
        document.head.removeChild(existingScript)
      }
    }
  }, [])

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement
    
    // Temporarily disable transitions to prevent flash
    const css = document.createElement('style')
    css.type = 'text/css'
    css.innerHTML = `
      *, *::before, *::after {
        transition-duration: 0s !important;
        transition-delay: 0s !important;
        animation-duration: 0s !important;
        animation-delay: 0s !important;
      }
    `
    document.head.appendChild(css)
    
    // Remove both theme classes and add the new one
    root.classList.remove('light', 'dark')
    root.classList.add(newTheme)
    root.setAttribute('data-theme', newTheme)
    
    // Update CSS custom properties for immediate changes
    if (newTheme === 'dark') {
      root.style.setProperty('--bg-primary', '#000000')
      root.style.setProperty('--bg-secondary', '#111827')
      root.style.setProperty('--bg-tertiary', '#1f2937')
      root.style.setProperty('--bg-elevated', '#374151')
      root.style.setProperty('--text-primary', '#ffffff')
      root.style.setProperty('--text-secondary', '#d1d5db')
      root.style.setProperty('--text-tertiary', '#9ca3af')
      root.style.setProperty('--border-primary', '#374151')
      root.style.setProperty('--border-secondary', '#4b5563')
      root.style.setProperty('--surface-glass', 'rgba(255, 255, 255, 0.05)')
      root.style.setProperty('--green-glow', 'rgba(34, 197, 94, 0.2)')
    } else {
      root.style.setProperty('--bg-primary', '#ffffff')
      root.style.setProperty('--bg-secondary', '#f9fafb')
      root.style.setProperty('--bg-tertiary', '#f3f4f6')
      root.style.setProperty('--bg-elevated', '#ffffff')
      root.style.setProperty('--text-primary', '#111827')
      root.style.setProperty('--text-secondary', '#6b7280')
      root.style.setProperty('--text-tertiary', '#9ca3af')
      root.style.setProperty('--border-primary', '#e5e7eb')
      root.style.setProperty('--border-secondary', '#d1d5db')
      root.style.setProperty('--surface-glass', 'rgba(0, 0, 0, 0.05)')
      root.style.setProperty('--green-glow', 'rgba(34, 197, 94, 0.1)')
    }
    
    // Save to localStorage
    localStorage.setItem('voxwave-theme', newTheme)
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', newTheme === 'dark' ? '#000000' : '#ffffff')
    }
    
    // Re-enable transitions after a brief delay
    setTimeout(() => {
      document.head.removeChild(css)
    }, 50)
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setThemeState(newTheme)
    applyTheme(newTheme)
  }

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    applyTheme(newTheme)
  }

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, mounted }}>
      <div className={`theme-wrapper ${theme}`} style={{ minHeight: '100vh' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}