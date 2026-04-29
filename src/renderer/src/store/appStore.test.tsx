// @ts-nocheck
import { renderHook, act } from '@testing-library/react'
import { AppProvider, useAppStore } from './appStore'
import React from 'react'

describe('appStore', () => {
  it('should provide initial state', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AppProvider>{children}</AppProvider>
    )
    const { result } = renderHook(() => useAppStore(), { wrapper })

    expect(result.current.tabs.length).toBe(1)
    expect(result.current.tabs[0].title).toBe('Google')
    expect(result.current.activeTabId).toBe('1')
  })

  it('should create a new tab', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AppProvider>{children}</AppProvider>
    )
    const { result } = renderHook(() => useAppStore(), { wrapper })

    act(() => {
      result.current.createTab('https://example.com')
    })

    expect(result.current.tabs.length).toBe(2)
    expect(result.current.tabs[1].url).toBe('https://example.com')
    expect(result.current.activeTabId).toBe(result.current.tabs[1].id)
  })

  it('should update a tab', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AppProvider>{children}</AppProvider>
    )
    const { result } = renderHook(() => useAppStore(), { wrapper })

    act(() => {
      result.current.updateTab('1', { title: 'Updated Title' })
    })

    expect(result.current.tabs[0].title).toBe('Updated Title')
  })

  it('should close a tab', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AppProvider>{children}</AppProvider>
    )
    const { result } = renderHook(() => useAppStore(), { wrapper })

    act(() => {
      result.current.createTab('https://example.com')
    })

    expect(result.current.tabs.length).toBe(2)
    const newTabId = result.current.tabs[1].id

    act(() => {
      result.current.closeTab({ stopPropagation: () => {} } as any, newTabId)
    })

    expect(result.current.tabs.length).toBe(1)
    expect(result.current.activeTabId).toBe('1')
  })
})
