'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { BookOpen, Layers, ListChecks, CheckCircle2, RotateCcw, CircleDashed, Download, Upload } from 'lucide-react'
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
  const { progress, loaded, exportProgress, importProgress } = useCisspProgress()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importMessage, setImportMessage] = useState<string | null>(null)

  const total = cisspTerms.length
  const mastered = cisspTerms.filter((t) => progress[t.id] === 'mastered').length
  const review = cisspTerms.filter((t) => progress[t.id] === 'review').length
  const unlearned = total - mastered - review

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const count = await importProgress(file)
      setImportMessage(`${count}件の学習状況を取り込みました。`)
    } catch (err) {
      setImportMessage(err instanceof Error ? err.message : 'インポートに失敗しました。')
    }
  }

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

        <div className="mt-6 pt-6 border-t border-slate-100">
          <h4 className="text-sm font-semibold text-slate-900 mb-2">進捗データのバックアップ</h4>
          <p className="text-xs text-slate-600 mb-3">
            学習状況はこの端末のブラウザにのみ保存されています。他の端末に移したり、消えてしまうのを防ぐためにバックアップ(エクスポート)しておくことをおすすめします。
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={exportProgress}
              className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              進捗をエクスポート
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              <Upload className="w-4 h-4" />
              進捗をインポート
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleImportFile}
              className="hidden"
            />
          </div>
          {importMessage && <p className="text-xs text-slate-500 mt-2">{importMessage}</p>}
        </div>
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
