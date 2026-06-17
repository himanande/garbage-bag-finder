// CISSP用語学習サービスの型定義
// 用語データは terms.ts に追加・差し替えしてください。

export const CISSP_DOMAINS = [
  '1. セキュリティ・リスクマネジメント',
  '2. 資産セキュリティ',
  '3. セキュリティアーキテクチャ・エンジニアリング',
  '4. 通信・ネットワークセキュリティ',
  '5. ID・アクセス管理(IAM)',
  '6. セキュリティ評価・テスト',
  '7. セキュリティ運用',
  '8. ソフトウェア開発セキュリティ',
] as const

export type CisspDomain = typeof CISSP_DOMAINS[number]

export interface CisspTerm {
  /** 一意なID(英数字・ハイフン推奨) */
  id: string
  /** 英語の用語・略語 (例: "RBAC") */
  term: string
  /** 日本語訳・読み方 */
  termJa: string
  /** 出題されやすいCISSPの8ドメインのいずれか */
  domain: CisspDomain
  /** 用語の解説文 */
  definition: string
  /** 補足の関連キーワード(任意) */
  tags?: string[]
  /** 出題頻度(任意) */
  frequency?: TermFrequency
}

/** 出題頻度 ◯=high / B=medium / A=low */
export type TermFrequency = 'high' | 'medium' | 'low'

/** 学習進捗のステータス */
export type LearningStatus = 'unlearned' | 'review' | 'mastered'

export const LEARNING_STATUS_LABEL: Record<LearningStatus, string> = {
  unlearned: '未学習',
  review: '要復習',
  mastered: '習得済み',
}
