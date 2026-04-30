import React from 'react'
import { useAppStore } from '../../store'
import { RotateCcw, Plus, X, Globe } from 'lucide-react'

export const TabBar: React.FC = () => {
  const { tabs, activeTabId, closeTab, switchTab, createTab } = useAppStore()

  return (
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
  )
}

export default TabBar
