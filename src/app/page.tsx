import React from 'react'
import { ThemeProvider } from '@/contexts/ThemeContext'
import Layout from '@/components/layout/Layout'
import Navbar from '@/components/layout/Navbar'
import Hero from '@/components/sections/Hero'

export default function Home() {
  return (
    <ThemeProvider>
      <Layout>
        <Navbar />
        <Hero />
      </Layout>
    </ThemeProvider>
  )
}