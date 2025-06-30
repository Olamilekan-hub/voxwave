import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VoxWave - AI Voice Platform',
  description: 'Transform text into voice with cutting-edge AI technology. Create stunning voices, clone any voice, and transform speech with VoxWave.',
  keywords: 'AI voice, text to speech, voice cloning, speech synthesis, ElevenLabs',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}