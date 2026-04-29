import React from 'react'
import { useAppStore } from '../../store'
import { BarChart2, Trash2, Clock, Zap } from 'lucide-react'
import { useScreenTime } from '../../store/screenTime'

export const PomodoroStats: React.FC = () => {
  const { getSessionsByDay, clearSessions, activeTab } = useAppStore()
  const { screenTime, clearScreenTime } = useScreenTime(activeTab?.url)
  const stats = getSessionsByDay()

  const totalPomodoros = stats.reduce((acc, curr) => acc + curr.count, 0)
  const totalMinutes = stats.reduce((acc, curr) => acc + curr.totalDuration, 0)

  const formatSeconds = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return h > 0 ? `${h}h ${m}m ${sec}s` : `${m}m ${sec}s`
  }

  return (
    <div className="stats-container" style={{ 
      padding: '20px', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '24px',
      height: '100%',
      overflowY: 'auto'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.1)', 
            padding: '8px', 
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <BarChart2 size={20} color="#ef4444" />
          </div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em' }}>专注统计</h3>
        </div>
        {stats.length > 0 && (
          <button 
            onClick={() => {
              if (confirm('确定要清除所有专注记录吗？')) {
                clearSessions()
              }
            }}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#9ca3af', 
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
              transition: 'all 0.2s'
            }}
            title="清除记录"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '12px' 
      }}>
        <div style={{ 
          background: 'var(--bg-main)', 
          border: '1px solid var(--navbar-border)', 
          padding: '16px', 
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444' }}>
            <Zap size={14} />
            <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>总次数</span>
          </div>
          <span style={{ fontSize: '24px', fontWeight: 800 }}>{totalPomodoros}</span>
        </div>
        <div style={{ 
          background: 'var(--bg-main)', 
          border: '1px solid var(--navbar-border)', 
          padding: '16px', 
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#3b82f6' }}>
            <Clock size={14} />
            <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>总时长</span>
          </div>
          <span style={{ fontSize: '24px', fontWeight: 800 }}>{totalMinutes}<small style={{ fontSize: '14px', fontWeight: 500, marginLeft: '2px' }}>m</small></span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#6b7280' }}>屏幕使用时间</h4>
          <button 
            onClick={clearScreenTime}
            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px' }}
          >
            重置
          </button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Object.entries(screenTime).length === 0 ? (
            <div style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center', padding: '10px' }}>暂无数据</div>
          ) : (
            Object.entries(screenTime)
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .slice(0, 5)
              .map(([host, seconds]) => {
                const totalSeconds = Object.values(screenTime).reduce((a, b) => (a as number) + (b as number), 0) as number
                const percentage = Math.round(((seconds as number) / totalSeconds) * 100)
                
                return (
                  <div key={host} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }} title={host}>
                        {host}
                      </span>
                      <span style={{ color: '#6b7280' }}>{formatSeconds(seconds as number)}</span>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(0,0,0,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ 
                        height: '100%', 
                        width: `${percentage}%`, 
                        background: '#3b82f6',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                )
              })
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#6b7280' }}>每日专注详情</h4>
        
        {stats.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            color: '#9ca3af', 
            padding: '40px 20px', 
            fontSize: '14px',
            background: 'rgba(0,0,0,0.02)',
            borderRadius: '12px',
            border: '1px dashed var(--navbar-border)'
          }}>
            暂无专注记录
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {stats.map((item) => (
              <div
                key={item.date}
                style={{
                  background: 'var(--bg-main)',
                  border: '1px solid var(--navbar-border)',
                  borderRadius: '12px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700 }}>{item.date}</span>
                  <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 600 }}>
                    {item.count} 次 · {item.totalDuration}m
                  </span>
                </div>
                <div
                  style={{
                    height: '6px',
                    width: '100%',
                    background: 'rgba(0,0,0,0.05)',
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(100, (item.count / 8) * 100)}%`,
                      background: 'linear-gradient(90deg, #ef4444, #f87171)',
                      borderRadius: '3px',
                      transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

