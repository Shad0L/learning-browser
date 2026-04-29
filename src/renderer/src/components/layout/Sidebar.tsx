import React, { useState, useEffect } from 'react'
import { useAppStore } from '../../store'
import { Star, ListTodo, History as HistoryIcon, BarChart2, X, CheckCircle } from 'lucide-react'
import { PomodoroStats } from '../stats/PomodoroStats'

export const Sidebar: React.FC = () => {
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

  const [MarkdownComp, setMarkdownComp] = useState<any>(null)
  const [mdReady, setMdReady] = useState<boolean>(false)

  useEffect(() => {
    let alive = true
    // @ts-ignore: react-markdown might not be installed in all environments
    import('react-markdown').then((mod) => {
      if (!alive) return
      const Comp = (mod as any).default ?? mod
      setMarkdownComp(() => Comp)
      setMdReady(true)
    }).catch(() => {
      setMdReady(false)
    })
    return () => {
      alive = false
    }
  }, [])

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
            <Star size={14} />
          </button>
          <button
            className={`nav-button ${sidebarTab === 'BOOKMARKS' ? 'active' : ''}`}
            onClick={() => setSidebarTab('BOOKMARKS')}
            title="书签"
          >
            <Star size={14} />
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
            {mdReady ? (
              <div style={{ display: 'flex', gap: '8px', height: '100%' }}>
                <textarea
                  className="notes-area"
                  style={{ flex: 1, resize: 'none' }}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="随手记..."
                />
                <div style={{ width: '50%', borderLeft: '1px solid #e5e7eb', paddingLeft: '8px', overflowY: 'auto' }}>
                  {MarkdownComp && <MarkdownComp>{notes}</MarkdownComp>}
                </div>
              </div>
            ) : (
              <textarea
                className="notes-area"
                style={{ flex: 1, resize: 'none' }}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="随手记..."
              />
            )}
            <div style={{ marginTop: '6px', display: 'flex', gap: '6px' }}>
              <button
                className="overlay-button"
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
                Clip Page
              </button>
            </div>
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
                  padding: '10px',
                  color: '#9ca3af',
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
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: '5px' }}>
              <button
                onClick={() => setHistory([])}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                  fontSize: '12px'
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
