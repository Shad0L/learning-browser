import React, { useRef, memo, useEffect } from 'react'
import { useAppStore, Tab, WebviewElement } from '../../store'
import { ShieldAlert, Coffee } from 'lucide-react'

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
    onUpdate: (id: string, updates: Partial<Tab>) => void
    onNavigate: (url: string) => void
    isDarkMode: boolean
    setRef: (id: string, ref: WebviewElement) => void
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
    }, [tab.id])

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

export const WebviewContainer: React.FC = () => {
  const {
    tabs,
    activeTabId,
    isDarkMode,
    status,
    setStatus,
    timeLeft,
    setTimeLeft,
    webviewRefs,
    updateTab,
    checkFilter,
    setInputUrl,
    setHistory,
    readerMode,
    setReaderMode,
    setReaderText,
    readerText,
    workMinutes,
    breakMinutes,
    offlineResults,
    createTab
  } = useAppStore()

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  return (
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
        <div
          className="reader-overlay"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'var(--bg-surface)',
            padding: '24px',
            overflow: 'auto',
            color: 'var(--text-primary)',
            zIndex: 999
          }}
        >
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>阅读模式</h3>
            <button
              style={{
                padding: '6px 14px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-app)',
                color: 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all var(--transition)'
              }}
              onClick={() => {
                setReaderMode(false)
                setReaderText('')
              }}
            >
              关闭
            </button>
          </div>
          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', lineHeight: 1.7, fontSize: '14px' }}>{readerText}</pre>
        </div>
      )}
      {status === 'BLOCKED' && (
        <div className="overlay block-overlay">
          <ShieldAlert size={64} style={{ color: 'var(--danger)', marginBottom: '20px' }} />
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
          <Coffee size={64} style={{ color: 'var(--success)', marginBottom: '20px' }} />
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

      {offlineResults.length > 0 && (
        <div
          className="offline-search-panel"
          style={{
            position: 'absolute',
            bottom: 12,
            left: 12,
            right: 12,
            maxHeight: '180px',
            overflowY: 'auto',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            padding: '12px',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            color: 'var(--text-primary)'
          }}
          aria-label="Offline search results"
        >
          <div style={{ fontWeight: 'bold', marginBottom: 6 }}>
            Offline Search Results (engine: {localStorage.getItem('searchEngine') ?? 'Google'})
          </div>
          {offlineResults.map((r) => (
            <div
              key={r.url}
              className="offline-item"
              onClick={() => createTab(r.url)}
              style={{ cursor: 'pointer', padding: '4px 0' }}
            >
              <span style={{ fontWeight: 600 }}>{r.title}</span> —{' '}
              <span style={{ color: 'var(--text-secondary)' }}>{r.snippet}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default WebviewContainer
