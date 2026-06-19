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

export interface ProgressExport {
  app: 'cissp-master'
  version: 1
  exportedAt: string
  progress: ProgressMap
}

function isValidStatus(value: unknown): value is LearningStatus {
  return value === 'unlearned' || value === 'review' || value === 'mastered'
}

export function buildProgressExport(progress: ProgressMap): ProgressExport {
  return {
    app: 'cissp-master',
    version: 1,
    exportedAt: new Date().toISOString(),
    progress,
  }
}

export function parseProgressImport(json: string): ProgressMap {
  let data: unknown
  try {
    data = JSON.parse(json)
  } catch {
    throw new Error('JSONとして読み込めませんでした。エクスポートしたファイルを選択してください。')
  }
  if (!data || typeof data !== 'object' || !('progress' in data) || typeof (data as { progress: unknown }).progress !== 'object') {
    throw new Error('進捗データの形式が正しくありません。')
  }
  const rawProgress = (data as { progress: Record<string, unknown> }).progress
  const result: ProgressMap = {}
  for (const [termId, status] of Object.entries(rawProgress)) {
    if (isValidStatus(status)) {
      result[termId] = status
    }
  }
  return result
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

  const exportProgress = useCallback(() => {
    if (typeof window === 'undefined') return
    const data = buildProgressExport(progress)
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const dateStr = new Date().toISOString().slice(0, 10)
    link.href = url
    link.download = `cissp-progress-${dateStr}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [progress])

  const importProgress = useCallback(async (file: File) => {
    const text = await file.text()
    const imported = parseProgressImport(text)
    setProgress((prev) => {
      const next = { ...prev, ...imported }
      saveProgress(next)
      return next
    })
    return Object.keys(imported).length
  }, [])

  return { progress, loaded, getStatus, setStatus, resetProgress, exportProgress, importProgress }
}
