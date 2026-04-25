import { useEffect } from 'react'

/**
 * Locks body scroll while a modal/overlay is open.
 * Automatically restores scroll on unmount.
 */
export function useScrollLock(active = true) {
  useEffect(() => {
    if (!active) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [active])
}

/**
 * Drop-in component version — render inside any modal to lock body scroll.
 * <ScrollLock />
 */
export function ScrollLock() {
  useScrollLock(true)
  return null
}
