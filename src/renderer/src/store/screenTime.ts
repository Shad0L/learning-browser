import { useState, useEffect } from 'react'

export interface ScreenTimeData {
  [hostname: string]: number
}

export const useScreenTime = (activeTabUrl: string | undefined) => {
  const [screenTime, setScreenTime] = useState<ScreenTimeData>(() => {
    try {
      const stored = localStorage.getItem('screenTime')
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    localStorage.setItem('screenTime', JSON.stringify(screenTime))
  }, [screenTime])

  useEffect(() => {
    if (!activeTabUrl) return

    let hostname: string
    try {
      hostname = new URL(activeTabUrl).hostname
    } catch {
      return
    }

    const interval = setInterval(() => {
      setScreenTime((prev) => ({
        ...prev,
        [hostname]: (prev[hostname] || 0) + 1
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [activeTabUrl])

  const clearScreenTime = () => {
    setScreenTime({})
  }

  return { screenTime, clearScreenTime }
}
