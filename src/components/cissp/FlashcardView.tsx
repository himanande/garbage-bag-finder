'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Shuffle, RotateCw, CheckCircle2, RotateCcw, CircleDashed } from 'lucide-react'
import { cisspTerms } from '@/data/cissp/terms'
import { CISSP_DOMAINS, LearningStatus, TermFrequency } from '@/data/cissp/types'
import { useCisspProgress } from '@/lib/cissp/progress'

type StatusFilter = '' | 'needsReview' | LearningStatus

const FREQ_LABELS: Record<TermFrequency, string> = {
  high: '★ 高頻出',
  medium: '☆ 中',
  low: '○ 低',
}

const FREQ_STYLES: Record<TermFrequency, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-slate-100 text-slate-500',
}

function shuffleArray<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export default function FlashcardView() {
  const [selectedDomain, setSelectedDomain] = useState<string>('')
  const [selectedFreq, setSelectedFreq] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('')
  const [order, setOrder] = useState<number[]>(() => cisspTerms.map((_, i) => i))
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const { getStatus, setStatus, loaded } = useCisspProgress()

  const terms = useMemo(() => {
    return cisspTerms.filter((t) => {
      if (selectedDomain && t.domain !== selectedDomain) return false
      if (selectedFreq && t.frequency !== selectedFreq) return false
      if (selectedStatus && loaded) {
        const s = getStatus(t.id)
        if (selectedStatus === 'needsReview') {
          if (s === 'mastered') return false
        } else if (s !== selectedStatus) {
          return false
        }
      }
      return true
    })
  }, [selectedDomain, selectedFreq, selectedStatus, loaded, getStatus])

  const visibleOrder = useMemo(() => {
    const validIndices = terms.map((t) => cisspTerms.indexOf(t))
    return order.filter((i) => validIndices.includes(i))
  }, [order, terms])

  const safeIndex = Math.min(index, Math.max(visibleOrder.length - 1, 0))
  const currentTerm = visibleOrder.length > 0 ? cisspTerms[visibleOrder[safeIndex]] : null

  const goTo = (newIndex: number) => {
    if (visibleOrder.length === 0) return
    const wrapped = (newIndex + visibleOrder.length) % visibleOrder.length
    setIndex(wrapped)
    setFlipped(false)
  }

  const handleShuffle = () => {
    setOrder(shuffleArray(cisspTerms.map((_, i) => i)))
    setIndex(0)
    setFlipped(false)
  }

  const handleMark = (status: LearningStatus) => {
    if (!currentTerm) return
    setStatus(currentTerm.id, status)
    goTo(safeIndex + 1)
  }

  const status = currentTerm && loaded ? getStatus(currentTerm.id) : 'unlearned'

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">フラッシュカード</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">ドメインで絞り込み</label>
            <select
              value={selectedDomain}
              onChange={(e) => {
                setSelectedDomain(e.target.value)
                setIndex(0)
                setFlipped(false)
              }}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="">すべてのドメイン</option>
              {CISSP_DOMAINS.map((domain) => (
                <option key={domain} value={domain}>{domain}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">頻出度で絞り込み</label>
            <select
              value={selectedFreq}
              onChange={(e) => {
                setSelectedFreq(e.target.value)
                setIndex(0)
                setFlipped(false)
              }}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="">すべての頻出度</option>
              <option value="high">★ 高頻出</option>
              <option value="medium">☆ 中</option>
              <option value="low">○ 低</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">学習状況で絞り込み</label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value as StatusFilter)
                setIndex(0)
                setFlipped(false)
              }}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="">すべて</option>
              <option value="needsReview">要復習モード(習得済み以外)</option>
              <option value="unlearned">未学習のみ</option>
              <option value="review">要復習のみ</option>
              <option value="mastered">習得済みのみ</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleShuffle}
            className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-3 rounded-lg font-medium transition-colors"
          >
            <Shuffle className="w-4 h-4" />
            シャッフル
          </button>
        </div>
      </div>

      {currentTerm ? (
        <div className="space-y-4">
          <p className="text-center text-sm text-slate-900">
            {safeIndex + 1} / {visibleOrder.length} 枚目
          </p>

          <button
            onClick={() => setFlipped((f) => !f)}
            className="w-full bg-white rounded-2xl shadow-lg border border-slate-200 p-8 min-h-[240px] flex flex-col items-center justify-center text-center hover:shadow-xl transition-shadow"
          >
            {!flipped ? (
              <>
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  <span className="bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full text-xs font-medium">
                    {currentTerm.domain}
                  </span>
                  {currentTerm.frequency && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${FREQ_STYLES[currentTerm.frequency]}`}>
                      {FREQ_LABELS[currentTerm.frequency]}
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">{currentTerm.term}</h3>
                <p className="text-slate-500">{currentTerm.termJa}</p>
                <p className="text-xs text-slate-400 mt-6 flex items-center gap-1">
                  <RotateCw className="w-3.5 h-3.5" /> タップして解説を表示
                </p>
              </>
            ) : (
              <>
                <h3 className="font-bold text-slate-800 mb-3">{currentTerm.term} / {currentTerm.termJa}</h3>
                <p className="text-slate-700 leading-relaxed">{currentTerm.definition}</p>
              </>
            )}
          </button>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleMark('unlearned')}
              className={`flex flex-col items-center justify-center gap-1 px-2 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                status === 'unlearned' ? 'bg-slate-200 text-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              <CircleDashed className="w-4 h-4" />
              未学習
            </button>
            <button
              onClick={() => handleMark('review')}
              className={`flex flex-col items-center justify-center gap-1 px-2 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                status === 'review' ? 'bg-amber-200 text-amber-800' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              要復習
            </button>
            <button
              onClick={() => handleMark('mastered')}
              className={`flex flex-col items-center justify-center gap-1 px-2 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                status === 'mastered' ? 'bg-emerald-200 text-emerald-800' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              習得済み
            </button>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => goTo(safeIndex - 1)}
              className="flex items-center gap-1 text-slate-600 hover:text-slate-800 font-medium px-3 py-2"
            >
              <ChevronLeft className="w-5 h-5" />
              前へ
            </button>
            <button
              onClick={() => goTo(safeIndex + 1)}
              className="flex items-center gap-1 text-slate-600 hover:text-slate-800 font-medium px-3 py-2"
            >
              次へ
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-slate-500">該当する用語がありません</p>
        </div>
      )}
    </div>
  )
}
