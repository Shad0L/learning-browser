import { useRef, memo, useEffect, useState } from 'react'
import { AppProvider, useAppStore, Tab, WebviewElement } from './store'
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
  ZoomIn,
  ZoomOut,
  Book,
  Volume2,
  VolumeX
} from 'lucide-react'

import './assets/browser.css'
import { Sidebar } from './components/layout/Sidebar'

// --- Child Component for Webview to isolate listeners ---
const TabWebview = memo(
  ({
    tab,
    active,
    onUpdate,
    onNavigate,
    isDarkMode,
    setRef
  }: {
    tab: Tab
    active: boolean
    onUpdate: (id: string, updates: any) => void
    onNavigate: (url: string) => void
    isDarkMode: boolean
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
        try {
          webview.setZoomLevel(tab.zoomLevel)
        } catch (err) {}
      }
    }, [tab.zoomLevel])

    useEffect(() => {
      const webview = ref.current
      if (!webview) return

      const applyDarkMode = () => {
        try {
          if (isDarkMode) {
            webview
              .executeJavaScript(
                `
            (function() {
              let style = document.getElementById('dark-mode-style');
              if (!style) {
                style = document.createElement('style');
                style.id = 'dark-mode-style';
                document.head.appendChild(style);
              }
              style.textContent = "html, body { filter: invert(1) hue-rotate(180deg) !important; background-color: #000 !important; } img, video, iframe, canvas { filter: invert(1) hue-rotate(180deg) !important; }";
            })()
          `
              )
              .catch(() => {})
          } else {
            webview
              .executeJavaScript(
                `
            (function() {
              const style = document.getElementById('dark-mode-style');
              if (style) style.remove();
            })()
          `
              )
              .catch(() => {})
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
        <webview ref={ref} src={tab.url} style={{ width: '100%', height: '100%' }} />
      </div>
    )
  }
)

function AppContent(): React.JSX.Element {
  // Lightweight offline Custom Search Engine data for Phase 3.4 fallback
  const offlineSearchData = [
    { title: 'Learning Browser Intro', url: 'https://example.org/intro', snippet: 'Overview of features and offline fallback.' },
    { title: 'Pomodoro Tips', url: 'https://example.org/pomodoro', snippet: 'Maximize focus with short cycles.' },
    { title: 'Local Fallbacks', url: 'https://example.org/fallbacks', snippet: 'Offline-first strategies for resilience.' },
    { title: 'Filter Modes', url: 'https://example.org/filters', snippet: 'How to use blacklist/whitelist effectively.' }
  ]
  const [offlineResults, setOfflineResults] = useState<Array<{title:string, url:string, snippet:string}>>([])
  const [readerMode, setReaderMode] = useState<boolean>(false)
  const [readerText, setReaderText] = useState<string>("")

  const {
    tabs,
    activeTabId,
    inputUrl,
    setInputUrl,
    showSidebar,
    setShowSidebar,
    isDarkMode,
    setIsDarkMode,
    whiteNoiseEnabled,
    setWhiteNoiseEnabled,
    whiteNoiseVolume,
    setWhiteNoiseVolume,
    workMinutes,
    setWorkMinutes,
    breakMinutes,
    showSettings,
    setShowSettings,
    newFilterDomain,
    setNewFilterDomain,
    status,
    setStatus,
    timeLeft,
    setTimeLeft,
    webviewRefs,
    activeTab,
    updateTab,
    checkFilter,
    handleNavigate,
    createTab,
    closeTab,
    switchTab,
    handleZoom,
    bookmarks,
    setBookmarks,
    setHistory,
    filterMode,
    setFilterMode,
    filterList,
    setFilterList
  } = useAppStore()

  useEffect(() => {
    if (!whiteNoiseEnabled) return

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const bufferSize = 2 * audioCtx.sampleRate
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
    const output = noiseBuffer.getChannelData(0)

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1
    }

    const whiteNoise = audioCtx.createBufferSource()
    whiteNoise.buffer = noiseBuffer
    whiteNoise.loop = true

    const gainNode = audioCtx.createGain()
    gainNode.gain.value = whiteNoiseVolume

    whiteNoise.connect(gainNode)
    gainNode.connect(audioCtx.destination)

    whiteNoise.start()

    return () => {
      whiteNoise.stop()
      gainNode.disconnect()
      audioCtx.close()
    }
  }, [whiteNoiseEnabled, whiteNoiseVolume])

  // Local offline search handler for Phase 3.4 fallback
  const performOfflineSearch = (query: string) => {
    const q = query.toLowerCase()
    const results = offlineSearchData.filter(d =>
      d.title.toLowerCase().includes(q) || d.snippet.toLowerCase().includes(q)
    ).slice(0, 4)
    setOfflineResults(results)
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div className={`app-container ${isDarkMode ? 'dark-theme' : ''}`}>
      {showSettings && (
        <div className="settings-overlay-clickaway" onClick={() => setShowSettings(false)} />
      )}

        <div className="tabs-bar">
        {tabs.map((t) => (
          <div
            key={t.id}
            className={`tab ${activeTabId === t.id ? 'active' : ''}`}
            onClick={() => switchTab(t.id)}
          >
            {t.isLoading ? (
              <RotateCcw size={14} className="animate-spin" style={{ marginRight: '6px' }} />
            ) : t.favicon ? (
              <img
                src={t.favicon}
                width={14}
                height={14}
                style={{ marginRight: '6px' }}
                alt="icon"
              />
            ) : (
              <Globe size={14} style={{ marginRight: '6px' }} />
            )}
            <span className="tab-title" title={t.title}>
              {t.title}
            </span>
            <X size={12} className="tab-close" onClick={(e) => closeTab(e, t.id)} />
          </div>
        ))}
        <div className="new-tab-button" onClick={() => createTab()} title="新建标签页 (Ctrl+T)">
          <Plus size={16} />
        </div>
      </div>

      <nav className="navbar">
        <div className="nav-buttons">
          <button
            className="nav-button"
            onClick={() => {
              const webview = webviewRefs.current[activeTabId]
              if (webview && webview.goBack) webview.goBack()
            }}
            disabled={!activeTab.canGoBack}
          >
            <ArrowLeft size={18} />
          </button>
          <button
            className="nav-button"
            onClick={() => {
              const webview = webviewRefs.current[activeTabId]
              if (webview && webview.goForward) webview.goForward()
            }}
            disabled={!activeTab.canGoForward}
          >
            <ArrowRight size={18} />
          </button>
          <button className="nav-button" onClick={() => {
            const webview = webviewRefs.current[activeTabId]
            if (webview && webview.reload) webview.reload()
          }}>
            <RotateCcw size={18} className={activeTab.isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
        <form className="address-bar-container" onSubmit={(e) => {
          const value = (inputUrl ?? '').trim()
          const isQuery = !/^https?:\/\//i.test(value) && !value.includes('.')
          if (isQuery) {
            // Offline search fallback when the user enters a query instead of a URL
            performOfflineSearch(value)
            e.preventDefault()
            return
          }
          handleNavigate(e)
        }}>
          <div
            style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}
          >
            <Search size={14} style={{ position: 'absolute', left: '10px', color: '#9ca3af' }} />
            <input
              type="text"
              className="address-bar"
              style={{ paddingLeft: '32px', paddingRight: '90px' }}
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
            />
            <div
              style={{
                position: 'absolute',
                right: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '2px'
              }}
            >
              <button
                type="button"
                className="nav-button"
                onClick={() => handleZoom('out')}
                title="缩小 (Ctrl -)"
              >
                <ZoomOut size={14} color="#9ca3af" />
              </button>
              <button
                type="button"
                className="nav-button"
                onClick={() => handleZoom('in')}
                title="放大 (Ctrl +)"
              >
                <ZoomIn size={14} color="#9ca3af" />
              </button>
              <button
                type="button"
                className="nav-button"
                onClick={() => {
                  const exists = bookmarks.find((b) => b.url === activeTab.url)
                  if (exists) setBookmarks(bookmarks.filter((b) => b.id !== exists.id))
                  else
                    setBookmarks([
                      ...bookmarks,
                      { id: Date.now().toString(), url: activeTab.url, title: activeTab.title }
                    ])
                }}
              >
                <Star
                  size={16}
                  fill={bookmarks.some((b) => b.url === activeTab.url) ? '#f59e0b' : 'none'}
                  color={bookmarks.some((b) => b.url === activeTab.url) ? '#f59e0b' : '#9ca3af'}
                />
              </button>
            </div>
              </div>
            </form>
        <div className="pomodoro-section">
          <div
            className="timer-display"
            style={{ color: status === 'BREAK' ? '#10b981' : '#ef4444' }}
          >
            {formatTime(timeLeft)}
          </div>
          {status === 'IDLE' ? (
            <button className="nav-button" onClick={() => setStatus('WORK')}>
              <Play size={18} />
            </button>
          ) : status === 'WORK' || status === 'BLOCKED' ? (
            <button
              className="nav-button"
              onClick={() => {
                setStatus('IDLE')
                setTimeLeft(workMinutes * 60)
              }}
            >
              <Pause size={18} />
            </button>
          ) : (
            <div className="nav-button">
              <Timer size={18} />
            </div>
          )}
          <button className="nav-button" onClick={() => setShowSettings(!showSettings)}>
            <Settings size={18} />
          </button>
          <div className="white-noise-control" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '4px' }}>
            <button
              className="nav-button"
              onClick={() => setWhiteNoiseEnabled(!whiteNoiseEnabled)}
              title={whiteNoiseEnabled ? '关闭白噪音' : '开启白噪音'}
            >
              {whiteNoiseEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            {whiteNoiseEnabled && (
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={whiteNoiseVolume}
                onChange={(e) => setWhiteNoiseVolume(parseFloat(e.target.value))}
                style={{ width: '60px', height: '4px', cursor: 'pointer' }}
                aria-label="白噪音音量"
              />
            )}
          </div>
          <button className="nav-button" onClick={() => {
            // Toggle Reader View (lightweight)
            if (!readerMode) {
              const webview = webviewRefs.current[activeTabId]
              if (webview && webview.executeJavaScript) {
                webview.executeJavaScript('document.body.innerText')
                  .then((txt: string) => setReaderText(txt || ''))
              }
              setReaderMode(true)
            } else {
              setReaderMode(false)
              setReaderText('')
            }
          }} title="Reader View">
            <Book size={18} />
          </button>
          <button className="nav-button" onClick={() => setShowSidebar(!showSidebar)}>
            <PanelRight size={18} />
          </button>
        </div>

        {showSettings && (
            <div className="settings-dropdown">
            <div className="settings-item">
              <label>专注 (分钟):</label>
              <div className="preset-buttons">
                {[15, 25, 45, 60].map((m) => (
                  <button
                    key={m}
                    className={`preset-button ${workMinutes === m ? 'active' : ''}`}
                    onClick={() => {
                      setWorkMinutes(m)
                      if (status === 'IDLE') setTimeLeft(m * 60)
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div className="toggle-group">
              <label>深色模式</label>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={isDarkMode}
                  onChange={(e) => setIsDarkMode(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
            <div className="settings-item" style={{ marginTop: '12px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '4px'
                }}
              >
                <label>网站过滤:</label>
                <select
                  value={filterMode}
                  onChange={(e) => setFilterMode(e.target.value as any)}
                  style={{
                    padding: '2px 4px',
                    fontSize: '12px',
                    borderRadius: '4px',
                    border: '1px solid #d1d5db',
                    background: 'var(--bg-main)',
                    color: 'var(--text-main)'
                  }}
                >
                  <option value="BLACKLIST">黑名单 (拦截这些)</option>
                  <option value="WHITELIST">白名单 (仅允许这些)</option>
                </select>
              </div>
              <div className="custom-input-group">
                <input
                  type="text"
                  className="custom-input"
                  value={newFilterDomain}
                  onChange={(e) => setNewFilterDomain(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newFilterDomain) {
                      setFilterList([...filterList, newFilterDomain])
                      setNewFilterDomain('')
                    }
                  }}
                  placeholder="域名 (例如: github.com)..."
                />
                <button
                  className="preset-button active"
                  style={{ width: '40px' }}
                  onClick={() => {
                    if (newFilterDomain) {
                      setFilterList([...filterList, newFilterDomain])
                      setNewFilterDomain('')
                    }
                  }}
                >
                  <Plus size={14} style={{ margin: 'auto' }} />
                </button>
              </div>
              <div style={{ maxHeight: '60px', overflowY: 'auto', marginTop: '8px' }}>
                {filterList.map((d) => (
                  <div key={d} className="blacklist-item">
                    <span>{d}</span>
                    <button onClick={() => setFilterList(filterList.filter((x) => x !== d))}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div
              className="settings-item"
              style={{
                marginTop: '12px',
                borderTop: '1px solid var(--navbar-border)',
                paddingTop: '12px'
              }}
            >
              <button
                className="overlay-button secondary"
                style={{ width: '100%', fontSize: '12px', padding: '6px' }}
                onClick={() => {
                  const webview = webviewRefs.current[activeTabId]
                  if (webview && webview.openDevTools) webview.openDevTools()
                  setShowSettings(false)
                }}
              >
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
                if (checkFilter(url)) return
                if (activeTabId === t.id) setInputUrl(url)
                if (url !== t.url)
                  setHistory((prev) => [
                    { id: Date.now().toString(), url, title: t.title, timestamp: Date.now() },
                    ...prev
                  ])
              }}
              isDarkMode={isDarkMode}
              setRef={(id, ref) => {
                webviewRefs.current[id] = ref
              }}
            />
          ))}
          {readerMode && (
            <div className="reader-overlay" style={{ position:'absolute', top:0, left:0, right:0, bottom:0, background:'rgba(255,255,255,0.95)', padding: '20px', overflow:'auto' }}>
              <pre style={{ whiteSpace:'pre-wrap', fontFamily:'monospace' }}>{readerText}</pre>
            </div>
          )}
          {status === 'BLOCKED' && (
            <div className="overlay block-overlay">
              <ShieldAlert size={64} style={{ color: '#ef4444', marginBottom: '20px' }} />
              <h2>访问受限 (专注模式中)</h2>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  className="overlay-button"
                  onClick={() => {
                    setStatus('WORK')
                    const webview = webviewRefs.current[activeTabId]
                    if (webview && webview.goBack) webview.goBack()
                  }}
                >
                  返回
                </button>
                <button
                  className="overlay-button secondary"
                  onClick={() => {
                    setStatus('IDLE')
                    setTimeLeft(workMinutes * 60)
                    const webview = webviewRefs.current[activeTabId]
                    if (webview && webview.reload) webview.reload()
                  }}
                >
                  放弃专注
                </button>
              </div>
            </div>
          )}
          {status === 'PROMPT' && (
            <div className="overlay">
              <h2>时间到！</h2>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  className="overlay-button"
                  onClick={() => {
                    setStatus('BREAK')
                    setTimeLeft(breakMinutes * 60)
                  }}
                >
                  开始休息
                </button>
                <button
                  className="overlay-button secondary"
                  onClick={() => {
                    setStatus('IDLE')
                    setTimeLeft(workMinutes * 60)
                  }}
                >
                  继续工作
                </button>
              </div>
            </div>
          )}
          {status === 'BREAK' && (
            <div className="overlay">
              <Coffee size={64} style={{ color: '#10b981', marginBottom: '20px' }} />
              <div className="timer-display" style={{ fontSize: '48px' }}>
                {formatTime(timeLeft)}
              </div>
              <button
                className="overlay-button secondary"
                style={{ marginTop: '20px' }}
                onClick={() => {
                  setStatus('IDLE')
                  setTimeLeft(workMinutes * 60)
                }}
              >
                提前结束
              </button>
            </div>
          )}
        </div>

        {offlineResults.length > 0 && (
          <div
            className="offline-search-panel"
            style={{ position: 'absolute', bottom: 12, left: 12, right: 12, maxHeight: '180px', overflowY: 'auto', background: '#fff', border: '1px solid #ddd', padding: '10px', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,.1)' }}
            aria-label="Offline search results"
          >
            <div style={{ fontWeight: 'bold', marginBottom: 6 }}>
              Offline Search Results (engine: {localStorage.getItem('searchEngine') ?? 'Google'})
            </div>
            {offlineResults.map((r) => (
              <div key={r.url} className="offline-item" onClick={() => createTab(r.url)} style={{ cursor: 'pointer', padding: '4px 0' }}>
                <span style={{ fontWeight: 600 }}>{r.title}</span> - <span style={{ color: '#555' }}>{r.snippet}</span>
              </div>
            ))}
          </div>
        )}

        <Sidebar />
      </div>
    </div>
  )
}

function App(): React.JSX.Element {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App
