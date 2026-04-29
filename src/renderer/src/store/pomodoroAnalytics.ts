import { useState, useEffect } from 'react'

export interface PomodoroSession {
  id: string
  timestamp: number
  duration: number // in minutes
}

export const usePomodoroAnalytics = () => {
  const [sessions, setSessions] = useState<PomodoroSession[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('pomodoroSessions') || '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('pomodoroSessions', JSON.stringify(sessions))
  }, [sessions])

  const addSession = (duration: number) => {
    const newSession: PomodoroSession = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      duration
    }
    setSessions((prev) => [newSession, ...prev])
  }

  const getSessionsByDay = () => {
    const dailyStats: { [date: string]: { count: number; totalDuration: number } } = {}
    sessions.forEach((s) => {
      const date = new Date(s.timestamp).toLocaleDateString()
      if (!dailyStats[date]) {
        dailyStats[date] = { count: 0, totalDuration: 0 }
      }
      dailyStats[date].count += 1
      dailyStats[date].totalDuration += s.duration
    })
    return Object.entries(dailyStats)
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  const clearSessions = () => {
    setSessions([])
  }

  return {
    sessions,
    addSession,
    getSessionsByDay,
    clearSessions
  }
}
