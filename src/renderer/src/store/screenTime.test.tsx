// @ts-nocheck
import { renderHook, act } from '@testing-library/react'
import { useScreenTime } from './screenTime'
import { vi } from 'vitest'

describe('useScreenTime', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useScreenTime(undefined))
    expect(result.current.screenTime).toEqual({})
  })

  it('should increment time for active hostname', () => {
    const { result } = renderHook(() => useScreenTime('https://www.google.com'))

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(result.current.screenTime['www.google.com']).toBe(1)

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(result.current.screenTime['www.google.com']).toBe(3)
  })

  it('should persist to localStorage', () => {
    const { result } = renderHook(() => useScreenTime('https://www.google.com'))

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    const stored = JSON.parse(localStorage.getItem('screenTime'))
    expect(stored['www.google.com']).toBe(1)
  })

  it('should clear screen time', () => {
    const { result } = renderHook(() => useScreenTime('https://www.google.com'))

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(result.current.screenTime['www.google.com']).toBe(1)

    act(() => {
      result.current.clearScreenTime()
    })

    expect(result.current.screenTime).toEqual({})
  })
})
