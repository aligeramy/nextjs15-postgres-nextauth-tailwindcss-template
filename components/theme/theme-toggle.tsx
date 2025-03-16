"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Only render after component is mounted to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Function to toggle theme based on the current resolved theme
  const toggleTheme = () => {
    // Use resolvedTheme instead of theme to handle "system" preference correctly
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  // Don't render the toggle until after client-side hydration
  if (!mounted) {
    return <div className="w-9 h-9" /> // Placeholder with same size to prevent layout shift
  }

  // Use resolvedTheme for determining the current actual theme (light/dark)
  // This accounts for when theme is set to "system"
  const currentTheme = resolvedTheme || theme

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      title={currentTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      suppressHydrationWarning
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
} 