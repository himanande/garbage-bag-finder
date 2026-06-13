'use client'

import { useCallback, useEffect, useState } from 'react'
import { LearningStatus } from '@/data/cissp/types'

const STORAGE_KEY = 'cissp-progress'

export type ProgressMap = Record<string, LearningStatus>

function loadProgress(): ProgressMap {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ProgressMap) : {}
  } catch {
    return {}
  }
}

function saveProgress(progress: ProgressMap) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function useCisspProgress() {
  const [progress, setProgress] = useState<ProgressMap>({})
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setProgress(loadProgress())
    setLoaded(true)
  }, [])

  const setStatus = useCallback((termId: string, status: LearningStatus) => {
    setProgress((prev) => {
      const next = { ...prev, [termId]: status }
      saveProgress(next)
      return next
    })
  }, [])

  const getStatus = useCallback(
    (termId: string): LearningStatus => progress[termId] ?? 'unlearned',
    [progress]
  )

  const resetProgress = useCallback(() => {
    setProgress({})
    saveProgress({})
  }, [])

  return { progress, loaded, getStatus, setStatus, resetProgress }
}
