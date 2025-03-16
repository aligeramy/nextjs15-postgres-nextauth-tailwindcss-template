"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  // This helps prevent hydration mismatch by only rendering after mount
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Add a listener for system theme changes
  useEffect(() => {
    if (!mounted) return

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = () => {
      // This will trigger a re-render when system theme changes
      // if the theme is set to "system"
      document.documentElement.classList.toggle('force-theme-update', true)
      setTimeout(() => {
        document.documentElement.classList.toggle('force-theme-update', false)
      }, 100)
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [mounted])

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
