'use client'

import { useMemo, useState } from 'react'
import { Search, CheckCircle2, RotateCcw, CircleDashed } from 'lucide-react'
import { cisspTerms } from '@/data/cissp/terms'
import { CISSP_DOMAINS, LEARNING_STATUS_LABEL, LearningStatus, TermFrequency } from '@/data/cissp/types'
import { useCisspProgress } from '@/lib/cissp/progress'

const STATUS_STYLES: Record<LearningStatus, string> = {
  unlearned: 'bg-slate-100 text-slate-600',
  review: 'bg-amber-100 text-amber-700',
  mastered: 'bg-emerald-100 text-emerald-700',
}

const STATUS_ICONS: Record<LearningStatus, typeof CircleDashed> = {
  unlearned: CircleDashed,
  review: RotateCcw,
  mastered: CheckCircle2,
}

const STATUS_ORDER: LearningStatus[] = ['unlearned', 'review', 'mastered']

const FREQ_STYLES: Record<TermFrequency, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-slate-100 text-slate-500',
}

const FREQ_LABELS: Record<TermFrequency, string> = {
  high: '★ 高頻出',
  medium: '☆ 中',
  low: '○ 低',
}

export default function GlossaryView() {
  const [keyword, setKeyword] = useState('')
  const [selectedDomain, setSelectedDomain] = useState<string>('')
  const [selectedFreq, setSelectedFreq] = useState<string>('')
  const { getStatus, setStatus, loaded } = useCisspProgress()

  const filteredTerms = useMemo(() => {
    const lowerKeyword = keyword.trim().toLowerCase()
    return cisspTerms.filter((t) => {
      if (selectedDomain && t.domain !== selectedDomain) return false
      if (selectedFreq && t.frequency !== selectedFreq) return false
      if (lowerKeyword) {
        const haystack = `${t.term} ${t.termJa} ${t.definition} ${(t.tags ?? []).join(' ')}`.toLowerCase()
        if (!haystack.includes(lowerKeyword)) return false
      }
      return true
    })
  }, [keyword, selectedDomain, selectedFreq])

  const cycleStatus = (termId: string) => {
    const current = getStatus(termId)
    const nextIndex = (STATUS_ORDER.indexOf(current) + 1) % STATUS_ORDER.length
    setStatus(termId, STATUS_ORDER[nextIndex])
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">用語集</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-900 mb-2">キーワード検索</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="用語・日本語訳・解説で検索"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-9 pr-4 py-3 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">ドメインで絞り込み</label>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="">すべてのドメイン</option>
              {CISSP_DOMAINS.map((domain) => (
                <option key={domain} value={domain}>{domain}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-semibold text-slate-900 mb-2">頻出度で絞り込み</label>
          <div className="flex flex-wrap gap-2">
            {(['', 'high', 'medium', 'low'] as const).map((freq) => (
              <button
                key={freq}
                onClick={() => setSelectedFreq(freq)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  selectedFreq === freq
                    ? 'bg-sky-600 text-white border-sky-600'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-sky-400'
                }`}
              >
                {freq === '' ? 'すべて' : FREQ_LABELS[freq]}
              </button>
            ))}
          </div>
        </div>
        <p className="text-sm text-slate-900 mt-4">{filteredTerms.length}件の用語が見つかりました</p>
      </div>

      <div className="space-y-4">
        {filteredTerms.map((t) => {
          const status = loaded ? getStatus(t.id) : 'unlearned'
          const StatusIcon = STATUS_ICONS[status]
          return (
            <div key={t.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h3 className="font-bold text-slate-800">{t.term}</h3>
                  <p className="text-sm text-slate-500">{t.termJa}</p>
                </div>
                <button
                  onClick={() => cycleStatus(t.id)}
                  className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${STATUS_STYLES[status]}`}
                  title="クリックして学習状況を切り替え"
                >
                  <StatusIcon className="w-3.5 h-3.5" />
                  {LEARNING_STATUS_LABEL[status]}
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full text-xs font-medium">
                  {t.domain}
                </span>
                {t.frequency && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${FREQ_STYLES[t.frequency]}`}>
                    {FREQ_LABELS[t.frequency]}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-700">{t.definition}</p>
              {t.tags && t.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {t.tags.map((tag) => (
                    <span key={tag} className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filteredTerms.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">該当する用語が見つかりませんでした</h3>
          <p className="text-slate-500">検索条件を変更してもう一度お試しください</p>
        </div>
      )}
    </div>
  )
}
