"use client"

import { useState, useEffect, useRef, useCallback } from "react"

/**
 * Buffered text field hook.
 * Local state updates immediately for responsive typing.
 * Canonical commit happens on blur and after an idle delay.
 * External value changes re-sync the buffer when they differ from the last commit.
 */
export function useBufferedField(
  value: string,
  onCommit: (v: string) => void,
  delayMs = 300
) {
  const [local, setLocal] = useState(value)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const commitRef = useRef(onCommit)
  commitRef.current = onCommit
  const lastCommitRef = useRef(value)

  // Re-sync when external value changes (hydrate, restore, save)
  // but not when we caused the change ourselves
  useEffect(() => {
    if (value !== lastCommitRef.current) {
      setLocal(value)
      lastCommitRef.current = value
    }
  }, [value])

  const onChange = useCallback(
    (next: string) => {
      setLocal(next)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        lastCommitRef.current = next
        commitRef.current(next)
      }, delayMs)
    },
    [delayMs]
  )

  const onBlur = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setLocal((current) => {
      lastCommitRef.current = current
      commitRef.current(current)
      return current
    })
  }, [])

  // Cleanup timer on unmount
  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    []
  )

  return { value: local, onChange, onBlur }
}
