import React from 'react'
import { useAppStore } from '../../store'
import { FileText, Bookmark, ListTodo, History as HistoryIcon, BarChart2, X, CheckCircle, Scissors } from 'lucide-react'
import { PomodoroStats } from '../stats/PomodoroStats'

const Sidebar: React.FC = () => {
  const {
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
    activeTab,
    createTab
  } = useAppStore()

  if (!showSidebar) return null

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
          <button
            className={`nav-button ${sidebarTab === 'NOTES' ? 'active' : ''}`}
            onClick={() => setSidebarTab('NOTES')}
            title="笔记"
          >
            <FileText size={14} />
          </button>
          <button
            className={`nav-button ${sidebarTab === 'BOOKMARKS' ? 'active' : ''}`}
            onClick={() => setSidebarTab('BOOKMARKS')}
            title="书签"
          >
            <Bookmark size={14} />
          </button>
          <button
            className={`nav-button ${sidebarTab === 'TODOS' ? 'active' : ''}`}
            onClick={() => setSidebarTab('TODOS')}
            title="待办"
          >
            <ListTodo size={14} />
          </button>
          <button
            className={`nav-button ${sidebarTab === 'HISTORY' ? 'active' : ''}`}
            onClick={() => setSidebarTab('HISTORY')}
            title="历史"
          >
            <HistoryIcon size={14} />
          </button>
          <button
            className={`nav-button ${sidebarTab === 'STATS' ? 'active' : ''}`}
            onClick={() => setSidebarTab('STATS')}
            title="统计"
          >
            <BarChart2 size={14} />
          </button>
        </div>

        <X size={16} onClick={() => setShowSidebar(false)} style={{ cursor: 'pointer' }} />
      </div>
      <div
        className="sidebar-content"
        style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}
      >
        {sidebarTab === 'NOTES' && (
          <div className="notes-section" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <textarea
              className="notes-area"
              style={{ flex: 1, resize: 'none' }}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="随手记..."
            />
            <button
              style={{
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px 0',
                width: '100%',
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
                const sel =
                  typeof window !== 'undefined' && window.getSelection()
                    ? window.getSelection()?.toString()
                    : ''
                if (sel) {
                  setNotes(notes + (notes ? '\n' : '') + sel)
                  try {
                    const existing = JSON.parse(localStorage.getItem('clips') || '[]')
                    const clip = { text: sel, url: activeTab?.url ?? '', ts: Date.now() }
                    existing.push(clip)
                    localStorage.setItem('clips', JSON.stringify(existing))
                  } catch {
                  }
                }
              }}
            >
              <Scissors size={12} />
              Clip Page
            </button>
          </div>
        )}
        {sidebarTab === 'BOOKMARKS' && (
          <div className="bookmarks-section" style={{ overflowY: 'auto', flex: 1 }}>
            {bookmarks.map((b) => (
              <div key={b.id} className="bookmark-item" onClick={() => createTab(b.url)}>
                <span className="bookmark-item-title">{b.title}</span>
                <X
                  size={12}
                  onClick={(e) => {
                    e.stopPropagation()
                    setBookmarks(bookmarks.filter((x) => x.id !== b.id))
                  }}
                />
              </div>
            ))}
            {bookmarks.length === 0 && (
              <div
                style={{
                  padding: '24px 10px',
                  color: 'var(--text-muted)',
                  textAlign: 'center',
                  fontSize: '12px'
                }}
              >
                暂无书签
              </div>
            )}
          </div>
        )}
        {sidebarTab === 'TODOS' && (
          <div className="todos-section" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ display: 'flex', gap: '5px', paddingBottom: '10px' }}>
              <input
                type="text"
                className="custom-input"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newTodo.trim()) {
                    setTodos([
                      ...todos,
                      { id: Date.now().toString(), text: newTodo.trim(), completed: false }
                    ])
                    setNewTodo('')
                  }
                }}
                placeholder="添加待办..."
              />
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {todos.map((t) => (
                <div
                  key={t.id}
                  className="bookmark-item"
                  style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
                >
                  <div
                    onClick={() =>
                      setTodos(
                        todos.map((x) => (x.id === t.id ? { ...x, completed: !x.completed } : x))
                      )
                    }
                    style={{ cursor: 'pointer', color: t.completed ? '#10b981' : '#9ca3af' }}
                  >
                    <CheckCircle size={14} />
                  </div>
                  <span
                    className="bookmark-item-title"
                    style={{
                      textDecoration: t.completed ? 'line-through' : 'none',
                      flex: 1,
                      color: t.completed ? '#9ca3af' : 'inherit'
                    }}
                  >
                    {t.text}
                  </span>
                  <X size={12} onClick={() => setTodos(todos.filter((x) => x.id !== t.id))} />
                </div>
              ))}
            </div>
          </div>
        )}
        {sidebarTab === 'HISTORY' && (
          <div className="history-section" style={{ overflowY: 'auto', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: '4px' }}>
              <button
                onClick={() => setHistory([])}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 500,
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'all var(--transition)'
                }}
              >
                清除记录
              </button>
            </div>
            {history.map((h) => (
              <div key={h.id} className="bookmark-item" onClick={() => createTab(h.url)}>
                <span className="bookmark-item-title" title={h.url}>
                  {h.title || h.url}
                </span>
              </div>
            ))}
          </div>
        )}
        {sidebarTab === 'STATS' && <PomodoroStats />}
      </div>
    </aside>
  )
}

export default Sidebar
