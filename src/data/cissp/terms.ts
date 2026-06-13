// CISSP用語データ(雛形)
// ここに用語を追加・差し替えしてください。各項目は types.ts の CisspTerm 形式に従います。
// id は他の用語と重複しない一意な文字列にしてください。

import { CisspTerm } from './types'

export const cisspTerms: CisspTerm[] = [
  {
    id: 'cia-triad',
    term: 'CIA Triad',
    termJa: 'CIAトライアド(機密性・完全性・可用性)',
    domain: '1. セキュリティ・リスクマネジメント',
    definition:
      '情報セキュリティの基本目標である「Confidentiality(機密性)」「Integrity(完全性)」「Availability(可用性)」の3要素を指す。CISSPの全ドメインの基盤となる最重要概念。',
    tags: ['機密性', '完全性', '可用性'],
  },
  {
    id: 'due-care-diligence',
    term: 'Due Care / Due Diligence',
    termJa: 'デューケア / デューデリジェンス',
    domain: '1. セキュリティ・リスクマネジメント',
    definition:
      'Due Diligence(デューデリジェンス)はリスクを特定するための調査・分析を行うこと、Due Care(デューケア)はその結果に基づき合理的な対策を実施すること。経営層の責任範囲を説明する際に使われる。',
    tags: ['経営責任', 'リスク管理'],
  },
  {
    id: 'data-classification',
    term: 'Data Classification',
    termJa: 'データ分類',
    domain: '2. 資産セキュリティ',
    definition:
      '情報資産を機密性のレベル(例: 極秘・社外秘・社内・公開)に応じて分類し、それぞれに適切な保護策やアクセス制御を適用するためのプロセス。',
    tags: ['情報資産', '機密性レベル'],
  },
  {
    id: 'data-remanence',
    term: 'Data Remanence',
    termJa: 'データ残留性',
    domain: '2. 資産セキュリティ',
    definition:
      'ストレージメディアからデータを削除した後にも、物理的に残存してしまうデータの断片。完全な消去にはサニタイズ(上書き・消磁・物理破壊)が必要となる。',
    tags: ['媒体廃棄', 'サニタイゼーション'],
  },
  {
    id: 'defense-in-depth',
    term: 'Defense in Depth',
    termJa: '多層防御',
    domain: '3. セキュリティアーキテクチャ・エンジニアリング',
    definition:
      '単一の対策に依存せず、物理・技術・運用など複数の防御層を組み合わせることで、1つの対策が破られても全体のセキュリティを維持する考え方。',
    tags: ['多層防御', 'セキュリティモデル'],
  },
  {
    id: 'tcb',
    term: 'TCB (Trusted Computing Base)',
    termJa: 'TCB(信頼されたコンピューティング基盤)',
    domain: '3. セキュリティアーキテクチャ・エンジニアリング',
    definition:
      'システム内でセキュリティポリシーを実施するハードウェア・ソフトウェア・ファームウェアの総体。TCBの境界はセキュリティ境界(セキュリティペリメータ)と呼ばれる。',
    tags: ['セキュリティモデル', '境界'],
  },
  {
    id: 'osi-model',
    term: 'OSI Reference Model',
    termJa: 'OSI参照モデル',
    domain: '4. 通信・ネットワークセキュリティ',
    definition:
      'ネットワーク通信を物理層・データリンク層・ネットワーク層・トランスポート層・セッション層・プレゼンテーション層・アプリケーション層の7階層に分けたモデル。各層に対応する攻撃・対策を理解する基礎となる。',
    tags: ['7階層', 'ネットワーク基礎'],
  },
  {
    id: 'vpn',
    term: 'VPN (Virtual Private Network)',
    termJa: 'VPN(仮想プライベートネットワーク)',
    domain: '4. 通信・ネットワークセキュリティ',
    definition:
      '公衆ネットワーク上に暗号化されたトンネルを構築し、安全にプライベートネットワークへ接続するための技術。IPsecやTLSなどが利用される。',
    tags: ['暗号化', 'トンネリング'],
  },
  {
    id: 'rbac',
    term: 'RBAC (Role-Based Access Control)',
    termJa: 'RBAC(ロールベースアクセス制御)',
    domain: '5. ID・アクセス管理(IAM)',
    definition:
      'ユーザーに直接権限を割り当てるのではなく、職務に応じた「ロール」に権限を割り当て、ユーザーをロールに割り当てることでアクセス権を管理する方式。',
    tags: ['アクセス制御モデル'],
  },
  {
    id: 'mfa',
    term: 'MFA (Multi-Factor Authentication)',
    termJa: 'MFA(多要素認証)',
    domain: '5. ID・アクセス管理(IAM)',
    definition:
      '「知っているもの(パスワード)」「持っているもの(トークン・スマートフォン)」「自分自身のもの(指紋・顔)」のうち2つ以上の異なる要素を組み合わせて本人確認を行う認証方式。',
    tags: ['認証', '本人確認'],
  },
  {
    id: 'penetration-testing',
    term: 'Penetration Testing',
    termJa: 'ペネトレーションテスト(侵入テスト)',
    domain: '6. セキュリティ評価・テスト',
    definition:
      '実際の攻撃者と同様の手法でシステムへの侵入を試み、脆弱性が実際に悪用可能かどうかを検証するテスト。ブラックボックス・ホワイトボックス・グレーボックスなどの形式がある。',
    tags: ['脆弱性評価', '侵入テスト'],
  },
  {
    id: 'vulnerability-assessment',
    term: 'Vulnerability Assessment',
    termJa: '脆弱性評価',
    domain: '6. セキュリティ評価・テスト',
    definition:
      'システムやネットワークに存在する既知の脆弱性をスキャナ等で特定し、リスクの大きさを評価するプロセス。ペネトレーションテストと異なり実際の悪用までは行わない。',
    tags: ['脆弱性スキャン'],
  },
  {
    id: 'incident-response',
    term: 'Incident Response',
    termJa: 'インシデントレスポンス(インシデント対応)',
    domain: '7. セキュリティ運用',
    definition:
      'セキュリティインシデント発生時に「準備・検知/分析・抑制/根絶/復旧・事後対応」のプロセスに沿って被害を最小化し、再発を防止するための一連の活動。',
    tags: ['インシデント管理'],
  },
  {
    id: 'bcp-drp',
    term: 'BCP / DRP',
    termJa: 'BCP(事業継続計画) / DRP(災害復旧計画)',
    domain: '7. セキュリティ運用',
    definition:
      'BCP(Business Continuity Plan)は災害等発生時に重要な事業を継続するための計画、DRP(Disaster Recovery Plan)はITシステムを復旧するための計画。BIA(事業影響度分析)に基づいて策定される。',
    tags: ['事業継続', '災害対策', 'BIA'],
  },
  {
    id: 'sdlc',
    term: 'SDLC (Software Development Life Cycle)',
    termJa: 'SDLC(ソフトウェア開発ライフサイクル)',
    domain: '8. ソフトウェア開発セキュリティ',
    definition:
      '要件定義・設計・実装・テスト・リリース・保守といった開発工程の各フェーズにセキュリティ対策を組み込む(セキュアSDLC)ことで、脆弱性を早期に発見・低コストで修正する考え方。',
    tags: ['セキュアコーディング', '開発工程'],
  },
  {
    id: 'buffer-overflow',
    term: 'Buffer Overflow',
    termJa: 'バッファオーバーフロー',
    domain: '8. ソフトウェア開発セキュリティ',
    definition:
      'プログラムが確保したメモリ領域(バッファ)を超えてデータを書き込んでしまう脆弱性。攻撃者に悪用されると任意コード実行やサービス停止につながる。境界チェックの実装が対策となる。',
    tags: ['脆弱性', 'セキュアコーディング'],
  },
]
