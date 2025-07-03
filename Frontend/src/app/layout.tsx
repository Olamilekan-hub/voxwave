import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ThemeProvider } from '@/components/ThemeProvider'

export const metadata: Metadata = {
  title: 'VoxWave - AI Voice Platform | Transform Voice with Cutting-Edge AI',
  description: 'Experience the future of voice technology with VoxWave. Generate natural-sounding speech, clone voices, and transform audio with our advanced AI platform powered by ElevenLabs.',
  keywords: 'AI voice, text to speech, voice cloning, speech synthesis, ElevenLabs, voice generation, artificial intelligence, audio transformation',
  authors: [{ name: 'VoxWave Team' }],
  creator: 'VoxWave',
  publisher: 'VoxWave',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://voxwave.ai',
    title: 'VoxWave - AI Voice Platform',
    description: 'Transform voice with cutting-edge AI technology. Create stunning voices, clone any voice, and transform speech.',
    siteName: 'VoxWave',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'VoxWave AI Voice Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VoxWave - AI Voice Platform',
    description: 'Transform voice with cutting-edge AI technology.',
    creator: '@voxwave',
    images: ['/og-image.jpg'],
  },
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#22c55e' },
    ],
  },
  manifest: '/manifest.json',
}

// Script to prevent theme flash - injected before any content renders
const themeScript = `
(function() {
  function getInitialTheme() {
    const persistedTheme = localStorage.getItem('voxwave-theme');
    if (persistedTheme && ['light', 'dark'].includes(persistedTheme)) {
      return persistedTheme;
    }
    
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    return systemPreference;
  }
  
  const theme = getInitialTheme();
  const root = document.documentElement;
  
  // Apply theme class immediately
  root.classList.add(theme);
  root.setAttribute('data-theme', theme);
  
  // Set CSS custom properties immediately to prevent flash
  if (theme === 'dark') {
    root.style.setProperty('--bg-primary', '#000000');
    root.style.setProperty('--bg-secondary', '#111827');
    root.style.setProperty('--bg-tertiary', '#1f2937');
    root.style.setProperty('--text-primary', '#ffffff');
    root.style.setProperty('--text-secondary', '#d1d5db');
    root.style.setProperty('--border-primary', '#374151');
    root.style.setProperty('--surface-glass', 'rgba(255, 255, 255, 0.05)');
  } else {
    root.style.setProperty('--bg-primary', '#ffffff');
    root.style.setProperty('--bg-secondary', '#f9fafb');
    root.style.setProperty('--bg-tertiary', '#f3f4f6');
    root.style.setProperty('--text-primary', '#111827');
    root.style.setProperty('--text-secondary', '#6b7280');
    root.style.setProperty('--border-primary', '#e5e7eb');
    root.style.setProperty('--surface-glass', 'rgba(255, 255, 255, 0.8)');
  }
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevent theme flash script - must be inline and before any content */}
        <script
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
        
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          as="style"
        />
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;300;400;500;600;700;800;900&display=swap"
          as="style"
        />
        
        {/* DNS prefetch for performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      
      <body 
        className="antialiased font-sans"
        style={{
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)',
        }}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <div className="min-h-screen flex flex-col relative">
            {/* Background gradient effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-400/5 rounded-full blur-3xl"></div>
            </div>
            
            {/* Navigation */}
            <Navbar />
            
            {/* Main content */}
            <main className="flex-1 relative z-10">
              {children}
            </main>
            
            {/* Footer */}
            <Footer />
            
            {/* Floating particles for ambient effect */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
              {Array.from({ length: 15 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-green-400/20 rounded-full animate-float"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 5}s`,
                    animationDuration: `${8 + Math.random() * 4}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </ThemeProvider>
        
        {/* Performance and analytics scripts would go here */}
        {process.env.NODE_ENV === 'production' && (
          <>
            {/* Add your analytics scripts here */}
          </>
        )}
      </body>
    </html>
  )
}