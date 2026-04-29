import React from 'react'

// Enhanced WebviewContainer with a lightweight offline-split-mode fallback (Phase 5.1)
export const WebviewContainer: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const split = typeof window !== 'undefined' ? localStorage.getItem('splitView') === 'true' : false
  if (split) {
    // Offline-split fallback: show two panes side-by-side as placeholders when real IPC-driven split is unavailable
    return (
      <div className="layout-webview-container" aria-label="WebviewContainer (split-skeleton)">
        <div style={{ display: 'flex', height: '100%', width: '100%' }}>
          <div style={{ flex: 1, borderRight: '1px solid #ddd', padding: 8 }}>
            Pane 1 (offline)
          </div>
          <div style={{ flex: 1, padding: 8 }}>
            Pane 2 (offline)
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="layout-webview-container" aria-label="WebviewContainer (skeleton)">
      {children ?? 'WebviewContainer (skeleton)'}
    </div>
  )
}
