import React from 'react'
import Layout from '@/components/layout/Layout'
import Navbar from '@/components/layout/Navbar'
import Hero from '@/components/sections/Hero'

export default function Home() {
  return (
    <Layout>
      <Navbar />
      <Hero />
    </Layout>
  )
}