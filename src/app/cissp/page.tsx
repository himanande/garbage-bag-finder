'use client'

import Link from 'next/link'
import { BookOpen, Layers, ListChecks, CheckCircle2, RotateCcw, CircleDashed } from 'lucide-react'
import { cisspTerms } from '@/data/cissp/terms'
import { useCisspProgress } from '@/lib/cissp/progress'

const FEATURES = [
  {
    href: '/cissp/glossary',
    title: '用語集',
    description: '出題されやすいCISSP用語を一覧から検索・カテゴリ絞り込みできます。',
    icon: BookOpen,
  },
  {
    href: '/cissp/flashcards',
    title: 'フラッシュカード',
    description: '用語と解説をカードで切り替えながら、テンポよく記憶を定着させます。',
    icon: Layers,
  },
  {
    href: '/cissp/quiz',
    title: 'クイズ',
    description: '一問一答・4択形式の問題で、用語の理解度を確認できます。',
    icon: ListChecks,
  },
]

export default function CisspHome() {
  const { progress, loaded } = useCisspProgress()

  const total = cisspTerms.length
  const mastered = cisspTerms.filter((t) => progress[t.id] === 'mastered').length
  const review = cisspTerms.filter((t) => progress[t.id] === 'review').length
  const unlearned = total - mastered - review

  return (
    <div className="space-y-8">
      <section className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-1">CISSP頻出用語を、まずはここから</h2>
        <p className="text-slate-600 text-sm">
          CISSP試験のCBK8ドメインから出題されやすい用語・略語をピックアップしました。用語集で全体像をつかみ、フラッシュカードで反復し、クイズで定着度を確認しましょう。
        </p>
      </section>

      <section className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">学習の進捗</h3>
        {loaded ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              <div>
                <p className="text-2xl font-bold text-emerald-700">{mastered} / {total}</p>
                <p className="text-xs text-emerald-700">習得済み</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4">
              <RotateCcw className="w-8 h-8 text-amber-600" />
              <div>
                <p className="text-2xl font-bold text-amber-700">{review}</p>
                <p className="text-xs text-amber-700">要復習</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl p-4">
              <CircleDashed className="w-8 h-8 text-slate-500" />
              <div>
                <p className="text-2xl font-bold text-slate-700">{unlearned}</p>
                <p className="text-xs text-slate-600">未学習</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400">読み込み中...</p>
        )}
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {FEATURES.map(({ href, title, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-sky-300 transition-all p-5 flex flex-col"
          >
            <Icon className="w-8 h-8 text-sky-600 mb-3" />
            <h3 className="font-bold text-slate-800 mb-2">{title}</h3>
            <p className="text-sm text-slate-600 flex-1">{description}</p>
          </Link>
        ))}
      </section>
    </div>
  )
}
