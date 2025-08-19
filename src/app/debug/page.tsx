"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navigation from '@/components/layout/Navigation'

export default function DebugPage() {
  const [cssLoaded, setCssLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    // Check if Tailwind CSS is loaded
    const testElement = document.createElement('div')
    testElement.className = 'hidden'
    document.body.appendChild(testElement)
    const styles = window.getComputedStyle(testElement)
    const isHidden = styles.display === 'none'
    document.body.removeChild(testElement)
    setCssLoaded(isHidden)
    
    // Check for errors
    window.addEventListener('error', (e) => {
      setError(e.message)
    })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-24 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Debug Page</h1>
          
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">CSS Status</h2>
            <div className="space-y-2">
              <p>
                Tailwind CSS Loaded: 
                <span className={cssLoaded ? "text-green-600 ml-2" : "text-red-600 ml-2"}>
                  {cssLoaded ? '✓ Yes' : '✗ No'}
                </span>
              </p>
              {error && (
                <p className="text-red-600">Error: {error}</p>
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Test Styles</h2>
            <div className="space-y-4">
              <div className="bg-blue-500 text-white p-4 rounded">
                This should be blue with white text
              </div>
              <div className="border-2 border-red-500 p-4 rounded">
                This should have a red border
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded">
                This should have a gradient background
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Navigation Test</h2>
            <p className="mb-4">Click these links to test navigation:</p>
            <div className="space-x-4">
              <Link href="/" className="text-blue-600 hover:underline">
                Home
              </Link>
              <Link href="/styler" className="text-blue-600 hover:underline">
                Styler
              </Link>
              <Link href="/pricing" className="text-blue-600 hover:underline">
                Pricing
              </Link>
              <Link href="/dashboard" className="text-blue-600 hover:underline">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}