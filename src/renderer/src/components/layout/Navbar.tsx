import React, { useEffect } from 'react'
import { useAppStore } from '../../store'
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Timer,
  Play,
  Pause,
  Settings,
  Search,
  Star,
  ZoomIn,
  ZoomOut,
  Book,
  PanelRight,
  Volume2,
  VolumeX,
  Plus,
  Trash2
} from 'lucide-react'

export const Navbar: React.FC = () => {
  const {
    activeTabId,
    activeTab,
    inputUrl,
    setInputUrl,
    isDarkMode,
    setIsDarkMode,
    whiteNoiseEnabled,
    setWhiteNoiseEnabled,
    whiteNoiseVolume,
    setWhiteNoiseVolume,
    noiseType,
    setNoiseType,
    workMinutes,
    setWorkMinutes,
    showSettings,
    setShowSettings,
    newFilterDomain,
    setNewFilterDomain,
    status,
    setStatus,
    timeLeft,
    setTimeLeft,
    webviewRefs,
    bookmarks,
    setBookmarks,
    filterMode,
    setFilterMode,
    filterList,
    setFilterList,
    handleNavigate,
    handleZoom,
    setShowSidebar,
    readerMode,
    setReaderMode,
    setReaderText,
    performOfflineSearch
  } = useAppStore()

  // Ambient sound engine: brown noise / rain / ocean waves
  useEffect(() => {
    if (!whiteNoiseEnabled) return

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const sampleRate = audioCtx.sampleRate
    const durationSec = 6
    const bufferSize = durationSec * sampleRate
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, sampleRate)
    const output = noiseBuffer.getChannelData(0)

    // Fill buffer based on noise type
    if (noiseType === 'brown') {
      let last = 0
      for (let i = 0; i < bufferSize; i++) {
        last += (Math.random() * 2 - 1) * 0.02
        if (last > 1.5) last = 1.5
        if (last < -1.5) last = -1.5
        output[i] = last * 0.35
      }
    } else if (noiseType === 'rain') {
      // Rain: layered filtered white noise with occasional droplet peaks
      let last = 0
      for (let i = 0; i < bufferSize; i++) {
        // Base: brown-ish noise for steady rainfall
        last += (Math.random() * 2 - 1) * 0.03
        if (last > 1.2) last = 1.2
        if (last < -1.2) last = -1.2
        let sample = last * 0.25
        // Occasional droplet "splash" — sharp transient in higher frequencies
        if (Math.random() < 0.002) {
          sample += (Math.random() * 2 - 1) * 0.6
        }
        output[i] = sample
      }
    } else if (noiseType === 'ocean') {
      // Ocean: brown noise with slow sinusoidal amplitude modulation
      let last = 0
      for (let i = 0; i < bufferSize; i++) {
        last += (Math.random() * 2 - 1) * 0.015
        if (last > 1.3) last = 1.3
        if (last < -1.3) last = -1.3
        const t = i / sampleRate
        // Dual LFO: primary wave (~7 sec) + subtle secondary (~3 sec)
        const envelope =
          0.5 +
          0.35 * Math.sin(2 * Math.PI * 0.14 * t) +
          0.15 * Math.sin(2 * Math.PI * 0.33 * t + 1.2)
        output[i] = last * 0.4 * envelope
      }
    }

    const source = audioCtx.createBufferSource()
    source.buffer = noiseBuffer
    source.loop = true

    const lowpass = audioCtx.createBiquadFilter()
    lowpass.type = 'lowpass'
    lowpass.frequency.value = noiseType === 'rain' ? 2000 : noiseType === 'ocean' ? 600 : 400

    const gainNode = audioCtx.createGain()
    gainNode.gain.value = whiteNoiseVolume

    source.connect(lowpass)
    lowpass.connect(gainNode)
    gainNode.connect(audioCtx.destination)

    source.start()

    return () => {
      source.stop()
      gainNode.disconnect()
      lowpass.disconnect()
      audioCtx.close()
    }
  }, [whiteNoiseEnabled, whiteNoiseVolume, noiseType])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <>
      {showSettings && (
        <div className="settings-overlay-clickaway" onClick={() => setShowSettings(false)} />
      )}

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
          <button
            className="nav-button"
            onClick={() => {
              const webview = webviewRefs.current[activeTabId]
              if (webview && webview.reload) webview.reload()
            }}
          >
            <RotateCcw size={18} className={activeTab.isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
        <form
          className="address-bar-container"
          onSubmit={(e) => {
            const value = (inputUrl ?? '').trim()
            const isQuery = !/^https?:\/\//i.test(value) && !value.includes('.')
            if (isQuery) {
              performOfflineSearch(value)
              e.preventDefault()
              return
            }
            handleNavigate(e)
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              display: 'flex',
              alignItems: 'center'
            }}
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
                      {
                        id: Date.now().toString(),
                        url: activeTab.url,
                        title: activeTab.title
                      }
                    ])
                }}
              >
                <Star
                  size={16}
                  fill={bookmarks.some((b) => b.url === activeTab.url) ? 'var(--warning)' : 'none'}
                  color={
                    bookmarks.some((b) => b.url === activeTab.url) ? 'var(--warning)' : 'var(--text-muted)'
                  }
                />
              </button>
            </div>
          </div>
        </form>
        <div className="pomodoro-section">
          <div
            className="timer-display"
            style={{ color: status === 'BREAK' ? 'var(--success)' : 'var(--danger)' }}
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
          <div
            className="white-noise-control"
            style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '4px' }}
          >
            <button
              className="nav-button"
              onClick={() => setWhiteNoiseEnabled(!whiteNoiseEnabled)}
              title={whiteNoiseEnabled ? '关闭环境音' : '开启环境音'}
            >
              {whiteNoiseEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            {whiteNoiseEnabled && (
              <>
                <select
                  value={noiseType}
                  onChange={(e) => setNoiseType(e.target.value as 'brown' | 'rain' | 'ocean')}
                  style={{
                    padding: '2px 4px',
                    fontSize: '11px',
                    borderRadius: '4px',
                    border: '1px solid var(--navbar-border)',
                    background: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    height: '24px'
                  }}
                  title="环境音类型"
                >
                  <option value="ocean">🌊</option>
                  <option value="rain">🌧️</option>
                  <option value="brown">🔥</option>
                </select>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={whiteNoiseVolume}
                  onChange={(e) => setWhiteNoiseVolume(parseFloat(e.target.value))}
                  style={{ width: '60px', height: '4px', cursor: 'pointer' }}
                  aria-label="环境音音量"
                />
              </>
            )}
          </div>
          <button
            className="nav-button"
            onClick={() => {
              if (!readerMode) {
                const webview = webviewRefs.current[activeTabId]
                if (webview && webview.executeJavaScript) {
                  webview.executeJavaScript('document.body.innerText').then((txt: string) => setReaderText(txt || ''))
                }
                setReaderMode(true)
              } else {
                setReaderMode(false)
                setReaderText('')
              }
            }}
            title="Reader View"
          >
            <Book size={18} />
          </button>
          <button className="nav-button" onClick={() => setShowSidebar((prev: boolean) => !prev)}>
            <PanelRight size={18} />
          </button>
        </div>

      </nav>

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
                  padding: '4px 8px',
                  fontSize: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)'
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
              borderTop: '1px solid var(--border)',
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
    </>
  )
}

export default Navbar
