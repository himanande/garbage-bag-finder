import { CisspTerm } from '@/data/cissp/types'

export interface MultipleChoiceQuestion {
  term: CisspTerm
  /** 解説文の選択肢(シャッフル済み) */
  choices: string[]
  /** choices内における正解のインデックス */
  correctIndex: number
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * 出題対象の用語リストから、ランダムな順序の出題キューを作成する。
 */
export function buildQuizQueue(terms: CisspTerm[], count?: number): CisspTerm[] {
  const shuffled = shuffle(terms)
  return count ? shuffled.slice(0, count) : shuffled
}

/**
 * 指定した用語について、4択(正解の解説 + 他の用語の解説3つ)の問題を作成する。
 * allTerms には出題対象全体を渡すことで、誤答の選択肢を生成する。
 */
export function createMultipleChoiceQuestion(
  term: CisspTerm,
  allTerms: CisspTerm[]
): MultipleChoiceQuestion {
  const distractorPool = allTerms.filter((t) => t.id !== term.id)
  const distractors = shuffle(distractorPool).slice(0, 3)
  const choices = shuffle([term.definition, ...distractors.map((d) => d.definition)])
  const correctIndex = choices.indexOf(term.definition)

  return { term, choices, correctIndex }
}
