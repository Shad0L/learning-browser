import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'
import { usePomodoroAnalytics, PomodoroSession } from './pomodoroAnalytics'
import { useScreenTime, ScreenTimeData } from './screenTime'

export type PomodoroStatus = 'IDLE' | 'WORK' | 'PROMPT' | 'BREAK' | 'BLOCKED'

export interface Tab {
  id: string
  url: string
  title: string
  favicon?: string
  canGoBack: boolean
  canGoForward: boolean
  isLoading: boolean
  zoomLevel?: number
}

export interface Bookmark {
  id: string
  url: string
  title: string
}

export interface HistoryItem {
  id: string
  url: string
  title: string
  timestamp: number
}

export interface TodoItem {
  id: string
  text: string
  completed: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WebviewElement = any

interface AppState {
  tabs: Tab[]
  setTabs: React.Dispatch<React.SetStateAction<Tab[]>>
  activeTabId: string
  setActiveTabId: React.Dispatch<React.SetStateAction<string>>
  inputUrl: string
  setInputUrl: React.Dispatch<React.SetStateAction<string>>

  showSidebar: boolean
  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>
  sidebarTab: 'NOTES' | 'BOOKMARKS' | 'TODOS' | 'HISTORY' | 'STATS'
  setSidebarTab: React.Dispatch<React.SetStateAction<'NOTES' | 'BOOKMARKS' | 'TODOS' | 'HISTORY' | 'STATS'>>
  notes: string
  setNotes: React.Dispatch<React.SetStateAction<string>>
  bookmarks: Bookmark[]
  setBookmarks: React.Dispatch<React.SetStateAction<Bookmark[]>>
  todos: TodoItem[]
  setTodos: React.Dispatch<React.SetStateAction<TodoItem[]>>
  newTodo: string
  setNewTodo: React.Dispatch<React.SetStateAction<string>>
  history: HistoryItem[]
  setHistory: React.Dispatch<React.SetStateAction<HistoryItem[]>>
  filterMode: 'BLACKLIST' | 'WHITELIST'
  setFilterMode: React.Dispatch<React.SetStateAction<'BLACKLIST' | 'WHITELIST'>>
  filterList: string[]
  setFilterList: React.Dispatch<React.SetStateAction<string[]>>
  isDarkMode: boolean
  setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>
  isAdblockerEnabled: boolean
  setIsAdblockerEnabled: React.Dispatch<React.SetStateAction<boolean>>

  whiteNoiseEnabled: boolean
  setWhiteNoiseEnabled: React.Dispatch<React.SetStateAction<boolean>>
  whiteNoiseVolume: number
  setWhiteNoiseVolume: React.Dispatch<React.SetStateAction<number>>

  workMinutes: number
  setWorkMinutes: React.Dispatch<React.SetStateAction<number>>
  breakMinutes: number
  setBreakMinutes: React.Dispatch<React.SetStateAction<number>>
  showSettings: boolean
  setShowSettings: React.Dispatch<React.SetStateAction<boolean>>
  customWork: string
  setCustomWork: React.Dispatch<React.SetStateAction<string>>
  customBreak: string
  setCustomBreak: React.Dispatch<React.SetStateAction<string>>
  newFilterDomain: string
  setNewFilterDomain: React.Dispatch<React.SetStateAction<string>>

  status: PomodoroStatus
  setStatus: React.Dispatch<React.SetStateAction<PomodoroStatus>>
  timeLeft: number
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>
  blockedUrl: string
  setBlockedUrl: React.Dispatch<React.SetStateAction<string>>

  sessions: PomodoroSession[]
  addSession: (duration: number) => void
  getSessionsByDay: () => { date: string; count: number; totalDuration: number }[]
  clearSessions: () => void

  screenTime: ScreenTimeData
  clearScreenTime: () => void

  webviewRefs: React.MutableRefObject<{ [id: string]: WebviewElement }>
  activeTab: Tab

  updateTab: (id: string, updates: Partial<Tab>) => void
  checkFilter: (urlStr: string) => boolean
  handleNavigate: (e?: React.FormEvent) => void
  createTab: (url?: string) => void
  closeTab: (e: React.MouseEvent, id: string) => void
  switchTab: (id: string) => void
  handleZoom: (direction: 'in' | 'out' | 'reset') => void
}

const AppContext = createContext<AppState | undefined>(undefined)

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: '1',
      url: 'https://www.google.com',
      title: 'Google',
      canGoBack: false,
      canGoForward: false,
      isLoading: false
    }
  ])
  const [activeTabId, setActiveTabId] = useState<string>('1')
  const [inputUrl, setInputUrl] = useState('https://www.google.com')

  const [showSidebar, setShowSidebar] = useState(false)
  const [sidebarTab, setSidebarTab] = useState<'NOTES' | 'BOOKMARKS' | 'TODOS' | 'HISTORY' | 'STATS'>('NOTES')
  const [notes, setNotes] = useState(() => localStorage.getItem('notes') || '')
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('bookmarks') || '[]')
    } catch {
      return []
    }
  })
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('todos') || '[]')
    } catch {
      return []
    }
  })
  const [newTodo, setNewTodo] = useState('')
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('history') || '[]')
    } catch {
      return []
    }
  })
  const [filterMode, setFilterMode] = useState<'BLACKLIST' | 'WHITELIST'>(() => {
    return (localStorage.getItem('filterMode') as 'BLACKLIST' | 'WHITELIST') || 'BLACKLIST'
  })
  const defaultAdDomains = [
    'doubleclick.net',
    'ads',
    'googlesyndication.com',
    'adservice.google.com',
    'adsrvr.org',
    'banner.ads',
    'clicktale',
    'advertising'
  ]
  const [filterList, setFilterList] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('filterList')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) return parsed
      }
      return defaultAdDomains
    } catch {
      return defaultAdDomains
    }
  })
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('isDarkMode') === 'true')
  const [isAdblockerEnabled, setIsAdblockerEnabled] = useState(() => localStorage.getItem('isAdblockerEnabled') !== 'false')

  const [whiteNoiseEnabled, setWhiteNoiseEnabled] = useState(() => localStorage.getItem('whiteNoiseEnabled') === 'true')
  const [whiteNoiseVolume, setWhiteNoiseVolume] = useState(() => {
    const stored = localStorage.getItem('whiteNoiseVolume')
    return stored ? parseFloat(stored) : 0.5
  })

  const [workMinutes, setWorkMinutes] = useState(25)
  const [breakMinutes, setBreakMinutes] = useState(5)
  const [showSettings, setShowSettings] = useState(false)
  const [customWork, setCustomWork] = useState('')
  const [customBreak, setCustomBreak] = useState('')
  const [newFilterDomain, setNewFilterDomain] = useState('')

  const [status, setStatus] = useState<PomodoroStatus>('IDLE')
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [blockedUrl, setBlockedUrl] = useState('')

  const { sessions, addSession, getSessionsByDay, clearSessions } = usePomodoroAnalytics()
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0]
  const { screenTime, clearScreenTime } = useScreenTime(activeTab?.url)

  const webviewRefs = useRef<{ [id: string]: WebviewElement }>({})

  useEffect(() => {
    localStorage.setItem('notes', notes)
  }, [notes])
  useEffect(() => {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks))
  }, [bookmarks])
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])
  useEffect(() => {
    localStorage.setItem('history', JSON.stringify(history.slice(0, 100)))
  }, [history])
  useEffect(() => {
    localStorage.setItem('filterList', JSON.stringify(filterList))
  }, [filterList])
  useEffect(() => {
    localStorage.setItem('filterMode', filterMode)
  }, [filterMode])
  useEffect(() => {
    localStorage.setItem('isDarkMode', isDarkMode.toString())
  }, [isDarkMode])

  useEffect(() => {
    localStorage.setItem('whiteNoiseEnabled', whiteNoiseEnabled.toString())
  }, [whiteNoiseEnabled])
  useEffect(() => {
    localStorage.setItem('whiteNoiseVolume', whiteNoiseVolume.toString())
  }, [whiteNoiseVolume])

  useEffect(() => {
    localStorage.setItem('isAdblockerEnabled', isAdblockerEnabled.toString())
    window.electron.ipcRenderer.send('toggle-adblocker', isAdblockerEnabled)
  }, [isAdblockerEnabled])

  useEffect(() => {
    window.electron.ipcRenderer.invoke('get-adblocker-status').then((status) => {
      if (status !== isAdblockerEnabled) {
        window.electron.ipcRenderer.send('toggle-adblocker', isAdblockerEnabled)
      }
    })
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if ((status === 'WORK' || status === 'BREAK' || status === 'BLOCKED') && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000)
    }
    return () => clearInterval(interval)
  }, [status, timeLeft])

  useEffect(() => {
    if (timeLeft === 0) {
      if (status === 'WORK' || status === 'BLOCKED') {
        setStatus('PROMPT')
        addSession(workMinutes)
      } else if (status === 'BREAK') {
        setStatus('IDLE')
        setTimeLeft(workMinutes * 60)
        alert('休息结束！')
      }
    }
  }, [timeLeft, status, workMinutes, addSession])

  const updateTab = (id: string, updates: Partial<Tab>) => {
    setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)))
  }

  const checkFilter = (urlStr: string) => {
    if (status !== 'WORK') return false
    try {
      const host = new URL(urlStr).hostname
      const matched = filterList.some((d) => host.includes(d))
      if (
        (filterMode === 'BLACKLIST' && matched) ||
        (filterMode === 'WHITELIST' && !matched && filterList.length > 0)
      ) {
        setBlockedUrl(urlStr)
        setStatus('BLOCKED')
        return true
      }
    } catch {
    }
    return false
  }

  const handleNavigate = (e?: React.FormEvent) => {
    e?.preventDefault()
    let url = inputUrl.trim()
    if (!url.includes('.') && !url.startsWith('http')) {
      url = `https://www.google.com/search?q=${encodeURIComponent(url)}`
    } else if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url
    }
    if (checkFilter(url)) return
    updateTab(activeTabId, { url })
    webviewRefs.current[activeTabId]?.loadURL(url)
    setHistory((prev) => [
      { id: Date.now().toString(), url, title: activeTab.title, timestamp: Date.now() },
      ...prev
    ])
  }

  const createTab = (url = 'https://www.google.com') => {
    const id = Date.now().toString()
    setTabs([
      ...tabs,
      { id, url, title: '新标签页', canGoBack: false, canGoForward: false, isLoading: false }
    ])
    setActiveTabId(id)
    setInputUrl(url)
  }

  const closeTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (tabs.length === 1) return
    const newTabs = tabs.filter((t) => t.id !== id)
    if (activeTabId === id) {
      const idx = tabs.findIndex((t) => t.id === id)
      const next = newTabs[idx] || newTabs[idx - 1]
      setActiveTabId(next.id)
      setInputUrl(next.url)
    }
    setTabs(newTabs)
    delete webviewRefs.current[id]
  }

  const switchTab = (id: string) => {
    setActiveTabId(id)
    const t = tabs.find((x) => x.id === id)
    if (t) setInputUrl(t.url)
  }

  const handleZoom = (direction: 'in' | 'out' | 'reset') => {
    const t = tabs.find((x) => x.id === activeTabId)
    if (!t) return
    let newZoom = t.zoomLevel || 1
    if (direction === 'in') newZoom += 0.2
    if (direction === 'out') newZoom -= 0.2
    if (direction === 'reset') newZoom = 1
    updateTab(activeTabId, { zoomLevel: newZoom })
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 't':
            e.preventDefault()
            createTab()
            break
          case 'w':
            e.preventDefault()
            closeTab(e as any, activeTabId)
            break
          case '=':
          case '+':
            e.preventDefault()
            handleZoom('in')
            break
          case '-':
            e.preventDefault()
            handleZoom('out')
            break
          case '0':
            e.preventDefault()
            handleZoom('reset')
            break
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeTabId, tabs])

  const value: AppState = {
    tabs,
    setTabs,
    activeTabId,
    setActiveTabId,
    inputUrl,
    setInputUrl,
    showSidebar,
    setShowSidebar,
    sidebarTab,
    setSidebarTab,
    notes,
    setNotes,
    bookmarks,
    setBookmarks,
    todos,
    setTodos,
    newTodo,
    setNewTodo,
    history,
    setHistory,
    filterMode,
    setFilterMode,
    filterList,
    setFilterList,
    isDarkMode,
    setIsDarkMode,
    isAdblockerEnabled,
    setIsAdblockerEnabled,
    whiteNoiseEnabled,
    setWhiteNoiseEnabled,
    whiteNoiseVolume,
    setWhiteNoiseVolume,
    workMinutes,
    setWorkMinutes,
    breakMinutes,
    setBreakMinutes,
    showSettings,
    setShowSettings,
    customWork,
    setCustomWork,
    customBreak,
    setCustomBreak,
    newFilterDomain,
    setNewFilterDomain,
    status,
    setStatus,
    timeLeft,
    setTimeLeft,
    blockedUrl,
    setBlockedUrl,
    sessions,
    addSession,
    getSessionsByDay,
    clearSessions,
    screenTime,
    clearScreenTime,
    webviewRefs,
    activeTab,
    updateTab,
    checkFilter,
    handleNavigate,
    createTab,
    closeTab,
    switchTab,
    handleZoom
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useAppStore = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppStore must be used within an AppProvider')
  }
  return context
}
