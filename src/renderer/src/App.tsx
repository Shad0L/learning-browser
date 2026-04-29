import { useState, useEffect, useRef, memo } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Timer,
  Play,
  Pause,
  Coffee,
  Settings,
  Plus,
  X,
  Star,
  PanelRight,
  Trash2,
  Search,
  ShieldAlert,
  Globe,
  CheckCircle,
  ListTodo,
  History as HistoryIcon,
  ZoomIn,
  ZoomOut
} from 'lucide-react'
import './assets/browser.css'

type PomodoroStatus = 'IDLE' | 'WORK' | 'PROMPT' | 'BREAK' | 'BLOCKED'

interface Tab {
  id: string
  url: string
  title: string
  favicon?: string
  canGoBack: boolean
  canGoForward: boolean
  isLoading: boolean
  zoomLevel?: number
}

interface Bookmark {
  id: string
  url: string
  title: string
}

interface HistoryItem {
  id: string
  url: string
  title: string
  timestamp: number
}

interface TodoItem {
  id: string
  text: string
  completed: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WebviewElement = any

// --- Child Component for Webview to isolate listeners ---
const TabWebview = memo(({ 
  tab, 
  active, 
  onUpdate, 
  onNavigate, 
  isDarkMode, 
  setRef 
}: { 
  tab: Tab, 
  active: boolean, 
  onUpdate: (id: string, updates: any) => void,
  onNavigate: (url: string) => void,
  isDarkMode: boolean,
  setRef: (id: string, ref: any) => void
}) => {
  const ref = useRef<WebviewElement>(null)

  useEffect(() => {
    const webview = ref.current
    if (!webview) return

    setRef(tab.id, webview)

    const handleLoadStart = () => onUpdate(tab.id, { isLoading: true })
    const handleLoadStop = () => {
      onUpdate(tab.id, {
        isLoading: false,
        title: webview.getTitle(),
        canGoBack: webview.canGoBack(),
        canGoForward: webview.canGoForward(),
        url: webview.getURL()
      })
    }
    const handleTitle = (e: any) => onUpdate(tab.id, { title: e.title })
    const handleNavigate = (e: any) => {
      onNavigate(e.url)
      onUpdate(tab.id, { url: e.url })
    }
    const handleInPageNavigate = (e: any) => {
      if (e.isMainFrame) {
        onNavigate(e.url)
        onUpdate(tab.id, { url: e.url })
      }
    }
    const handleFavicon = (e: any) => {
      if (e.favicons && e.favicons.length > 0) {
        onUpdate(tab.id, { favicon: e.favicons[0] })
      }
    }

    webview.addEventListener('did-start-loading', handleLoadStart)
    webview.addEventListener('did-stop-loading', handleLoadStop)
    webview.addEventListener('page-title-updated', handleTitle)
    webview.addEventListener('page-favicon-updated', handleFavicon)
    webview.addEventListener('did-navigate', handleNavigate)
    webview.addEventListener('did-navigate-in-page', handleInPageNavigate)
    webview.addEventListener('will-navigate', (_e: any) => {
      // Logic for filter check is handled before loading
    })

    return () => {
      webview.removeEventListener('did-start-loading', handleLoadStart)
      webview.removeEventListener('did-stop-loading', handleLoadStop)
      webview.removeEventListener('page-title-updated', handleTitle)
      webview.removeEventListener('page-favicon-updated', handleFavicon)
      webview.removeEventListener('did-navigate', handleNavigate)
      webview.removeEventListener('did-navigate-in-page', handleInPageNavigate)
    }
  }, [tab.id]) // Only run once on mount

  useEffect(() => {
    const webview = ref.current
    if (!webview) return
    if (tab.zoomLevel !== undefined && webview.setZoomLevel) {
      try { webview.setZoomLevel(tab.zoomLevel) } catch (err) {}
    }
  }, [tab.zoomLevel])

  useEffect(() => {
    const webview = ref.current
    if (!webview) return
    
    const applyDarkMode = () => {
      try {
        if (isDarkMode) {
          webview.executeJavaScript(`
            (function() {
              let style = document.getElementById('dark-mode-style');
              if (!style) {
                style = document.createElement('style');
                style.id = 'dark-mode-style';
                document.head.appendChild(style);
              }
              style.textContent = "html, body { filter: invert(1) hue-rotate(180deg) !important; background-color: #000 !important; } img, video, iframe, canvas { filter: invert(1) hue-rotate(180deg) !important; }";
            })()
          `).catch(() => {})
        } else {
          webview.executeJavaScript(`
            (function() {
              const style = document.getElementById('dark-mode-style');
              if (style) style.remove();
            })()
          `).catch(() => {})
        }
      } catch (err) {
        // Ignore synchronous errors like "The WebView must be attached to the DOM and the dom-ready event emitted"
      }
    }
    
    applyDarkMode()
    
    // Also re-apply when dom is ready
    webview.addEventListener('dom-ready', applyDarkMode)
    return () => {
      webview.removeEventListener('dom-ready', applyDarkMode)
    }
  }, [isDarkMode, tab.isLoading])

  return (
    <div className={`webview-wrapper ${active ? 'active' : ''}`}>
      <webview 
        ref={ref} 
        src={tab.url} 
        style={{ width: '100%', height: '100%' }} 
      />
    </div>
  )
})

function App(): React.JSX.Element {
  // --- State ---
  const [tabs, setTabs] = useState<Tab[]>([
    { id: '1', url: 'https://www.google.com', title: 'Google', canGoBack: false, canGoForward: false, isLoading: false }
  ])
  const [activeTabId, setActiveTabId] = useState<string>('1')
  const [inputUrl, setInputUrl] = useState('https://www.google.com')

  const [showSidebar, setShowSidebar] = useState(false)
  const [sidebarTab, setSidebarTab] = useState<'NOTES'|'BOOKMARKS'|'TODOS'|'HISTORY'>('NOTES')
  const [notes, setNotes] = useState(() => localStorage.getItem('notes') || '')
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try { return JSON.parse(localStorage.getItem('bookmarks') || '[]') } catch { return [] }
  })
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('todos') || '[]') } catch { return [] }
  })
  const [newTodo, setNewTodo] = useState('')
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('history') || '[]') } catch { return [] }
  })
  const [filterMode, setFilterMode] = useState<'BLACKLIST'|'WHITELIST'>(() => {
    return (localStorage.getItem('filterMode') as 'BLACKLIST'|'WHITELIST') || 'BLACKLIST'
  })
  const [filterList, setFilterList] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('filterList') || '[]') } catch { return [] }
  })
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('isDarkMode') === 'true')

  const [workMinutes, setWorkMinutes] = useState(25)
  const [breakMinutes, _setBreakMinutes] = useState(5)
  const [showSettings, setShowSettings] = useState(false)
  const [_customWork, _setCustomWork] = useState('')
  const [_customBreak, _setCustomBreak] = useState('')
  const [newFilterDomain, setNewFilterDomain] = useState('')

  const [status, setStatus] = useState<PomodoroStatus>('IDLE')
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [_blockedUrl, setBlockedUrl] = useState('')

  const webviewRefs = useRef<{ [id: string]: WebviewElement }>({})
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0]

  // --- Effects ---
  useEffect(() => { localStorage.setItem('notes', notes) }, [notes])
  useEffect(() => { localStorage.setItem('bookmarks', JSON.stringify(bookmarks)) }, [bookmarks])
  useEffect(() => { localStorage.setItem('todos', JSON.stringify(todos)) }, [todos])
  useEffect(() => { localStorage.setItem('history', JSON.stringify(history.slice(0, 100))) }, [history]) // Limit history size
  useEffect(() => { localStorage.setItem('filterList', JSON.stringify(filterList)) }, [filterList])
  useEffect(() => { localStorage.setItem('filterMode', filterMode) }, [filterMode])
  useEffect(() => { localStorage.setItem('isDarkMode', isDarkMode.toString()) }, [isDarkMode])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if ((status === 'WORK' || status === 'BREAK' || status === 'BLOCKED') && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000)
    }
    return () => clearInterval(interval)
  }, [status, timeLeft])

  useEffect(() => {
    if (timeLeft === 0) {
      if (status === 'WORK' || status === 'BLOCKED') setStatus('PROMPT')
      else if (status === 'BREAK') {
        setStatus('IDLE')
        setTimeLeft(workMinutes * 60)
        alert('休息结束！')
      }
    }
  }, [timeLeft, status])

  // --- Handlers ---
  const updateTab = (id: string, updates: Partial<Tab>) => {
    setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)))
  }

  const checkFilter = (urlStr: string) => {
    if (status !== 'WORK') return false
    try {
      const host = new URL(urlStr).hostname
      const matched = filterList.some(d => host.includes(d))
      if ((filterMode === 'BLACKLIST' && matched) || (filterMode === 'WHITELIST' && !matched && filterList.length > 0)) {
        setBlockedUrl(urlStr)
        setStatus('BLOCKED')
        return true
      }
    } catch { /* ignore */ }
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
    setHistory(prev => [{ id: Date.now().toString(), url, title: activeTab.title, timestamp: Date.now() }, ...prev])
  }

  const createTab = (url = 'https://www.google.com') => {
    const id = Date.now().toString()
    setTabs([...tabs, { id, url, title: '新标签页', canGoBack: false, canGoForward: false, isLoading: false }])
    setActiveTabId(id)
    setInputUrl(url)
  }

  const closeTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (tabs.length === 1) return
    const newTabs = tabs.filter(t => t.id !== id)
    if (activeTabId === id) {
      const idx = tabs.findIndex(t => t.id === id)
      const next = newTabs[idx] || newTabs[idx - 1]
      setActiveTabId(next.id)
      setInputUrl(next.url)
    }
    setTabs(newTabs)
    delete webviewRefs.current[id]
  }

  const switchTab = (id: string) => {
    setActiveTabId(id)
    const t = tabs.find(x => x.id === id)
    if (t) setInputUrl(t.url)
  }

  const handleZoom = (direction: 'in' | 'out' | 'reset') => {
    const t = tabs.find(x => x.id === activeTabId)
    if (!t) return
    let newZoom = t.zoomLevel || 1
    if (direction === 'in') newZoom += 0.2
    if (direction === 'out') newZoom -= 0.2
    if (direction === 'reset') newZoom = 1
    updateTab(activeTabId, { zoomLevel: newZoom })
  }

  // --- Global Keyboard Shortcuts ---
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

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div className={`app-container ${isDarkMode ? 'dark-theme' : ''}`}>
      {showSettings && <div className="settings-overlay-clickaway" onClick={() => setShowSettings(false)} />}
      
      <div className="tabs-bar">
        {tabs.map((t) => (
          <div key={t.id} className={`tab ${activeTabId === t.id ? 'active' : ''}`} onClick={() => switchTab(t.id)}>
            {t.isLoading ? <RotateCcw size={14} className="animate-spin" style={{marginRight:'6px'}} /> : t.favicon ? <img src={t.favicon} width={14} height={14} style={{marginRight:'6px'}} alt="icon" /> : <Globe size={14} style={{marginRight:'6px'}} />}
            <span className="tab-title" title={t.title}>{t.title}</span>
            <X size={12} className="tab-close" onClick={(e) => closeTab(e, t.id)} />
          </div>
        ))}
        <div className="new-tab-button" onClick={() => createTab()} title="新建标签页 (Ctrl+T)"><Plus size={16} /></div>
      </div>

      <nav className="navbar">
        <div className="nav-buttons">
          <button className="nav-button" onClick={() => webviewRefs.current[activeTabId]?.goBack()} disabled={!activeTab.canGoBack}><ArrowLeft size={18} /></button>
          <button className="nav-button" onClick={() => webviewRefs.current[activeTabId]?.goForward()} disabled={!activeTab.canGoForward}><ArrowRight size={18} /></button>
          <button className="nav-button" onClick={() => webviewRefs.current[activeTabId]?.reload()}><RotateCcw size={18} className={activeTab.isLoading ? 'animate-spin' : ''} /></button>
        </div>
        <form className="address-bar-container" onSubmit={handleNavigate}>
          <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', color: '#9ca3af' }} />
            <input type="text" className="address-bar" style={{ paddingLeft: '32px', paddingRight: '90px' }} value={inputUrl} onChange={(e) => setInputUrl(e.target.value)} />
            <div style={{ position: 'absolute', right: '4px', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <button type="button" className="nav-button" onClick={() => handleZoom('out')} title="缩小 (Ctrl -)"><ZoomOut size={14} color="#9ca3af" /></button>
              <button type="button" className="nav-button" onClick={() => handleZoom('in')} title="放大 (Ctrl +)"><ZoomIn size={14} color="#9ca3af" /></button>
              <button type="button" className="nav-button" onClick={() => {
                const exists = bookmarks.find(b => b.url === activeTab.url)
                if (exists) setBookmarks(bookmarks.filter(b => b.id !== exists.id))
                else setBookmarks([...bookmarks, { id: Date.now().toString(), url: activeTab.url, title: activeTab.title }])
              }}>
                <Star size={16} fill={bookmarks.some(b => b.url === activeTab.url) ? '#f59e0b' : 'none'} color={bookmarks.some(b => b.url === activeTab.url) ? '#f59e0b' : '#9ca3af'} />
              </button>
            </div>
          </div>
        </form>
        <div className="pomodoro-section">
          <div className="timer-display" style={{ color: status === 'BREAK' ? '#10b981' : '#ef4444' }}>{formatTime(timeLeft)}</div>
          {status === 'IDLE' ? <button className="nav-button" onClick={() => setStatus('WORK')}><Play size={18} /></button> :
           (status === 'WORK' || status === 'BLOCKED') ? <button className="nav-button" onClick={() => { setStatus('IDLE'); setTimeLeft(workMinutes*60); }}><Pause size={18} /></button> :
           <div className="nav-button"><Timer size={18} /></div>}
          <button className="nav-button" onClick={() => setShowSettings(!showSettings)}><Settings size={18} /></button>
          <button className="nav-button" onClick={() => setShowSidebar(!showSidebar)}><PanelRight size={18} /></button>
        </div>

        {showSettings && (
          <div className="settings-dropdown">
            <div className="settings-item">
              <label>专注 (分钟):</label>
              <div className="preset-buttons">
                {[15, 25, 45, 60].map(m => <button key={m} className={`preset-button ${workMinutes===m?'active':''}`} onClick={() => { setWorkMinutes(m); if(status==='IDLE') setTimeLeft(m*60); }}>{m}</button>)}
              </div>
            </div>
            <div className="toggle-group">
              <label>深色模式</label>
              <label className="switch"><input type="checkbox" checked={isDarkMode} onChange={e => setIsDarkMode(e.target.checked)} /><span className="slider"></span></label>
            </div>
            <div className="settings-item" style={{marginTop:'12px'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px'}}>
                <label>网站过滤:</label>
                <select value={filterMode} onChange={e => setFilterMode(e.target.value as any)} style={{padding:'2px 4px', fontSize:'12px', borderRadius:'4px', border:'1px solid #d1d5db', background:'var(--bg-main)', color:'var(--text-main)'}}>
                  <option value="BLACKLIST">黑名单 (拦截这些)</option>
                  <option value="WHITELIST">白名单 (仅允许这些)</option>
                </select>
              </div>
              <div className="custom-input-group">
                <input type="text" className="custom-input" value={newFilterDomain} onChange={e => setNewFilterDomain(e.target.value)} onKeyDown={e => {
                  if(e.key === 'Enter' && newFilterDomain) {
                    setFilterList([...filterList, newFilterDomain]); setNewFilterDomain('');
                  }
                }} placeholder="域名 (例如: github.com)..." />
                <button className="preset-button active" style={{width:'40px'}} onClick={() => { if(newFilterDomain){ setFilterList([...filterList, newFilterDomain]); setNewFilterDomain(''); } }}><Plus size={14} style={{margin:'auto'}}/></button>
              </div>
              <div style={{maxHeight:'60px', overflowY:'auto', marginTop:'8px'}}>
                {filterList.map(d => <div key={d} className="blacklist-item"><span>{d}</span><button onClick={() => setFilterList(filterList.filter(x=>x!==d))}><Trash2 size={12}/></button></div>)}
              </div>
            </div>
            <div className="settings-item" style={{marginTop:'12px', borderTop:'1px solid var(--navbar-border)', paddingTop:'12px'}}>
              <button className="overlay-button secondary" style={{width:'100%', fontSize:'12px', padding:'6px'}} onClick={() => {
                webviewRefs.current[activeTabId]?.openDevTools()
                setShowSettings(false)
              }}>
                打开当前页开发者工具
              </button>
            </div>
          </div>
        )}
      </nav>

      <div className="main-layout">
        <div className="webview-container" style={{ flex: 1 }}>
          {tabs.map((t) => (
            <TabWebview 
              key={t.id} 
              tab={t} 
              active={activeTabId === t.id} 
              onUpdate={updateTab} 
              onNavigate={(url) => { 
                if(checkFilter(url)) return; 
                if(activeTabId === t.id) setInputUrl(url);
                if(url !== t.url) setHistory(prev => [{ id: Date.now().toString(), url, title: t.title, timestamp: Date.now() }, ...prev]);
              }}
              isDarkMode={isDarkMode}
              setRef={(id, ref) => { webviewRefs.current[id] = ref }}
            />
          ))}
          {status === 'BLOCKED' && (
            <div className="overlay block-overlay">
              <ShieldAlert size={64} style={{color:'#ef4444', marginBottom:'20px'}} />
              <h2>访问受限 (专注模式中)</h2>
              <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
                <button className="overlay-button" onClick={() => { setStatus('WORK'); webviewRefs.current[activeTabId]?.goBack(); }}>返回</button>
                <button className="overlay-button secondary" onClick={() => { setStatus('IDLE'); setTimeLeft(workMinutes*60); webviewRefs.current[activeTabId]?.reload(); }}>放弃专注</button>
              </div>
            </div>
          )}
          {status === 'PROMPT' && (
            <div className="overlay">
              <h2>时间到！</h2>
              <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
                <button className="overlay-button" onClick={() => { setStatus('BREAK'); setTimeLeft(breakMinutes*60); }}>开始休息</button>
                <button className="overlay-button secondary" onClick={() => { setStatus('IDLE'); setTimeLeft(workMinutes*60); }}>继续工作</button>
              </div>
            </div>
          )}
          {status === 'BREAK' && (
            <div className="overlay">
              <Coffee size={64} style={{color:'#10b981', marginBottom:'20px'}} />
              <div className="timer-display" style={{fontSize:'48px'}}>{formatTime(timeLeft)}</div>
              <button className="overlay-button secondary" style={{marginTop:'20px'}} onClick={() => { setStatus('IDLE'); setTimeLeft(workMinutes*60); }}>提前结束</button>
            </div>
          )}
        </div>

        {showSidebar && (
          <aside className="sidebar">
            <div className="sidebar-header">
              <div style={{display:'flex', gap:'8px', overflowX:'auto'}}>
                <button className={`nav-button ${sidebarTab==='NOTES'?'active':''}`} onClick={() => setSidebarTab('NOTES')} title="笔记"><Star size={14}/></button>
                <button className={`nav-button ${sidebarTab==='BOOKMARKS'?'active':''}`} onClick={() => setSidebarTab('BOOKMARKS')} title="书签"><Star size={14}/></button>
                <button className={`nav-button ${sidebarTab==='TODOS'?'active':''}`} onClick={() => setSidebarTab('TODOS')} title="待办"><ListTodo size={14}/></button>
                <button className={`nav-button ${sidebarTab==='HISTORY'?'active':''}`} onClick={() => setSidebarTab('HISTORY')} title="历史"><HistoryIcon size={14}/></button>
              </div>
              <X size={16} onClick={() => setShowSidebar(false)} style={{cursor:'pointer'}} />
            </div>
            <div className="sidebar-content" style={{display:'flex', flexDirection:'column', flex:1, overflow:'hidden'}}>
              {sidebarTab === 'NOTES' && (
                <div className="notes-section" style={{flex:1, display:'flex', flexDirection:'column'}}>
                  <textarea className="notes-area" style={{flex:1, resize:'none'}} value={notes} onChange={e => setNotes(e.target.value)} placeholder="随手记..." />
                </div>
              )}
              {sidebarTab === 'BOOKMARKS' && (
                <div className="bookmarks-section" style={{overflowY:'auto', flex:1}}>
                  {bookmarks.map(b => (
                    <div key={b.id} className="bookmark-item" onClick={() => createTab(b.url)}>
                      <span className="bookmark-item-title">{b.title}</span>
                      <X size={12} onClick={(e) => { e.stopPropagation(); setBookmarks(bookmarks.filter(x => x.id !== b.id)); }} />
                    </div>
                  ))}
                  {bookmarks.length === 0 && <div style={{padding:'10px', color:'#9ca3af', textAlign:'center', fontSize:'12px'}}>暂无书签</div>}
                </div>
              )}
              {sidebarTab === 'TODOS' && (
                <div className="todos-section" style={{display:'flex', flexDirection:'column', flex:1}}>
                  <div style={{display:'flex', gap:'5px', paddingBottom:'10px'}}>
                    <input type="text" className="custom-input" value={newTodo} onChange={e => setNewTodo(e.target.value)} onKeyDown={e => {
                      if (e.key === 'Enter' && newTodo.trim()) {
                        setTodos([...todos, { id: Date.now().toString(), text: newTodo.trim(), completed: false }]);
                        setNewTodo('');
                      }
                    }} placeholder="添加待办..." />
                  </div>
                  <div style={{overflowY:'auto', flex:1}}>
                    {todos.map(t => (
                      <div key={t.id} className="bookmark-item" style={{display:'flex', gap:'8px', alignItems:'center'}}>
                        <div onClick={() => setTodos(todos.map(x => x.id === t.id ? {...x, completed: !x.completed} : x))} style={{cursor:'pointer', color: t.completed ? '#10b981' : '#9ca3af'}}>
                          <CheckCircle size={14} />
                        </div>
                        <span className="bookmark-item-title" style={{textDecoration: t.completed ? 'line-through' : 'none', flex:1, color: t.completed ? '#9ca3af' : 'inherit'}}>{t.text}</span>
                        <X size={12} onClick={() => setTodos(todos.filter(x => x.id !== t.id))} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {sidebarTab === 'HISTORY' && (
                <div className="history-section" style={{overflowY:'auto', flex:1}}>
                  <div style={{display:'flex', justifyContent:'flex-end', paddingBottom:'5px'}}>
                    <button onClick={() => setHistory([])} style={{background:'none', border:'none', color:'#ef4444', cursor:'pointer', fontSize:'12px'}}>清除记录</button>
                  </div>
                  {history.map(h => (
                    <div key={h.id} className="bookmark-item" onClick={() => createTab(h.url)}>
                      <span className="bookmark-item-title" title={h.url}>{h.title || h.url}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}

export default App
