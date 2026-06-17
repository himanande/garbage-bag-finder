'use client'

import { useMemo, useState } from 'react'
import { CheckCircle2, XCircle, RotateCcw, ListChecks, MessageCircleQuestion } from 'lucide-react'
import { cisspTerms } from '@/data/cissp/terms'
import { CISSP_DOMAINS, CisspTerm, LearningStatus } from '@/data/cissp/types'
import { useCisspProgress } from '@/lib/cissp/progress'
import { buildQuizQueue, createMultipleChoiceQuestion } from '@/lib/cissp/quiz'

type QuizMode = 'oneQuestion' | 'multipleChoice'
type Phase = 'setup' | 'playing' | 'result'
type StatusFilter = '' | 'needsReview' | LearningStatus

const QUESTION_COUNT_OPTIONS = [5, 10, 0] as const // 0 = 全問

export default function QuizView() {
  const [phase, setPhase] = useState<Phase>('setup')
  const [mode, setMode] = useState<QuizMode>('multipleChoice')
  const [selectedDomain, setSelectedDomain] = useState<string>('')
  const [selectedFreq, setSelectedFreq] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('')
  const [questionCount, setQuestionCount] = useState<number>(10)

  const [queue, setQueue] = useState<CisspTerm[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null)

  const { setStatus, getStatus, loaded } = useCisspProgress()

  const availableTerms = useMemo(() => {
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

  const currentTerm = queue[currentIndex]
  const mcQuestion = useMemo(() => {
    if (mode !== 'multipleChoice' || !currentTerm) return null
    return createMultipleChoiceQuestion(currentTerm, cisspTerms)
  }, [mode, currentTerm])

  const startQuiz = () => {
    const count = questionCount === 0 ? availableTerms.length : Math.min(questionCount, availableTerms.length)
    setQueue(buildQuizQueue(availableTerms, count))
    setCurrentIndex(0)
    setScore(0)
    setRevealed(false)
    setSelectedChoice(null)
    setPhase('playing')
  }

  const finishOrNext = () => {
    if (currentIndex + 1 >= queue.length) {
      setPhase('result')
    } else {
      setCurrentIndex((i) => i + 1)
      setRevealed(false)
      setSelectedChoice(null)
    }
  }

  const handleSelfAssessment = (knew: boolean) => {
    if (!currentTerm) return
    setStatus(currentTerm.id, knew ? 'mastered' : 'review')
    if (knew) setScore((s) => s + 1)
    finishOrNext()
  }

  const handleChoiceSelect = (choiceIndex: number) => {
    if (selectedChoice !== null || !mcQuestion || !currentTerm) return
    setSelectedChoice(choiceIndex)
    const correct = choiceIndex === mcQuestion.correctIndex
    setStatus(currentTerm.id, correct ? 'mastered' : 'review')
    if (correct) setScore((s) => s + 1)
  }

  if (phase === 'setup') {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 space-y-6">
        <h2 className="text-lg font-bold text-slate-800">クイズ設定</h2>

        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">出題形式</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => setMode('multipleChoice')}
              className={`flex items-center gap-2 border rounded-lg px-4 py-3 text-left transition-colors ${
                mode === 'multipleChoice' ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-300 text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ListChecks className="w-5 h-5" />
              <div>
                <p className="font-semibold">4択クイズ</p>
                <p className="text-xs text-slate-900">用語に合う解説を4つの選択肢から選びます</p>
              </div>
            </button>
            <button
              onClick={() => setMode('oneQuestion')}
              className={`flex items-center gap-2 border rounded-lg px-4 py-3 text-left transition-colors ${
                mode === 'oneQuestion' ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-300 text-slate-900 hover:bg-slate-50'
              }`}
            >
              <MessageCircleQuestion className="w-5 h-5" />
              <div>
                <p className="font-semibold">一問一答クイズ</p>
                <p className="text-xs text-slate-900">用語の意味を思い出し、答えを見て自己採点します</p>
              </div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">頻出度で絞り込み</label>
            <select
              value={selectedFreq}
              onChange={(e) => setSelectedFreq(e.target.value)}
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
              onChange={(e) => setSelectedStatus(e.target.value as StatusFilter)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="">すべて</option>
              <option value="needsReview">要復習モード(習得済み以外)</option>
              <option value="unlearned">未学習のみ</option>
              <option value="review">要復習のみ</option>
              <option value="mastered">習得済みのみ</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">出題数</label>
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            >
              {QUESTION_COUNT_OPTIONS.map((count) => (
                <option key={count} value={count}>{count === 0 ? '全問' : `${count}問`}</option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-sm text-slate-900">{availableTerms.length}件の用語が対象です</p>

        <button
          onClick={startQuiz}
          disabled={availableTerms.length === 0}
          className="w-full bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-lg transition-colors"
        >
          クイズを開始
        </button>
      </div>
    )
  }

  if (phase === 'result') {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center space-y-6">
        <h2 className="text-lg font-bold text-slate-800">クイズ結果</h2>
        <p className="text-4xl font-bold text-sky-600">
          {score} / {queue.length}
        </p>
        <p className="text-slate-600">
          {score === queue.length ? '全問正解です!すばらしい!' : '間違えた用語は「要復習」として記録されました。用語集やフラッシュカードで復習しましょう。'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => setPhase('setup')}
            className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-6 py-3 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            設定を変更する
          </button>
          <button
            onClick={startQuiz}
            className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-6 py-3 rounded-lg transition-colors"
          >
            同じ条件でもう一度
          </button>
        </div>
      </div>
    )
  }

  // phase === 'playing'
  if (!currentTerm) {
    return null
  }

  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-slate-900">
        第 {currentIndex + 1} 問 / 全{queue.length}問(現在のスコア: {score})
      </p>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <span className="inline-block bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full text-xs font-medium mb-3">
          {currentTerm.domain}
        </span>
        <h3 className="text-2xl font-bold text-slate-800 mb-1">{currentTerm.term}</h3>
        <p className="text-slate-500 mb-6">{currentTerm.termJa}</p>

        {mode === 'multipleChoice' && mcQuestion ? (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-900">この用語の説明として正しいものを選んでください</p>
            {mcQuestion.choices.map((choice, i) => {
              const isSelected = selectedChoice === i
              const isCorrect = i === mcQuestion.correctIndex
              let style = 'border-slate-300 hover:bg-slate-50 text-slate-700'
              if (selectedChoice !== null) {
                if (isCorrect) style = 'border-emerald-500 bg-emerald-50 text-emerald-800'
                else if (isSelected) style = 'border-red-400 bg-red-50 text-red-700'
                else style = 'border-slate-200 text-slate-400'
              }
              return (
                <button
                  key={i}
                  onClick={() => handleChoiceSelect(i)}
                  disabled={selectedChoice !== null}
                  className={`w-full text-left border rounded-lg px-4 py-3 text-sm transition-colors flex items-start gap-2 ${style}`}
                >
                  {selectedChoice !== null && isCorrect && <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />}
                  {selectedChoice !== null && isSelected && !isCorrect && <XCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                  <span>{choice}</span>
                </button>
              )
            })}

            {selectedChoice !== null && (
              <button
                onClick={finishOrNext}
                className="w-full mt-2 bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 rounded-lg transition-colors"
              >
                {currentIndex + 1 >= queue.length ? '結果を見る' : '次の問題へ'}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {!revealed ? (
              <button
                onClick={() => setRevealed(true)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 rounded-lg transition-colors"
              >
                答え(解説)を見る
              </button>
            ) : (
              <>
                <p className="text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-4 leading-relaxed">
                  {currentTerm.definition}
                </p>
                <p className="text-sm font-semibold text-slate-700 text-center">説明できましたか?</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleSelfAssessment(false)}
                    className="flex-1 flex items-center justify-center gap-2 bg-amber-100 hover:bg-amber-200 text-amber-800 font-medium py-3 rounded-lg transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    わからなかった
                  </button>
                  <button
                    onClick={() => handleSelfAssessment(true)}
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-medium py-3 rounded-lg transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    わかった
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
