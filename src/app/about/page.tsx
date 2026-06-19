import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export const metadata = {
  title: 'このサイトについて | 水野真紀の魔法のレストラン 紹介店検索',
  description: '当サイトの運営方針、データの出典、ご利用にあたっての注意事項について説明しています。',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-amber-50">
      <header className="bg-gradient-to-r from-purple-700 to-indigo-700 shadow-lg">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Link href="/" className="flex items-center space-x-3">
            <Sparkles className="w-8 h-8 text-amber-300" />
            <h1 className="text-xl sm:text-2xl font-bold text-white">水野真紀の魔法のレストラン 紹介店検索</h1>
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">このサイトについて</h2>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-8 text-slate-700 leading-relaxed">
          <section>
            <h3 className="font-bold text-slate-800 mb-2">非公式のファンサイトです</h3>
            <p>
              当サイトは、MBS（毎日放送）のテレビ番組「水野真紀の魔法のレストラン」で紹介されたお店を検索できる、個人運営の非公式ファンサイトです。
              MBSおよび番組制作者、出演者とは一切関係がありません。
            </p>
          </section>

          <section>
            <h3 className="font-bold text-slate-800 mb-2">データの出典</h3>
            <p>
              掲載している店舗情報は、番組公式サイト（mahou-contents.mbs.jp）で公開されている情報をもとに収集・整理したものです。
              店名・住所・ジャンル・座標などは自動処理によって生成しているため、誤りを含む場合があります。
            </p>
          </section>

          <section>
            <h3 className="font-bold text-slate-800 mb-2">最新情報は公式サイトをご確認ください</h3>
            <p>
              営業時間・定休日・メニュー・価格・閉店の有無などは変更されている可能性があります。
              ご来店前には、各店舗の公式サイトやSNS、お電話等で最新情報をご確認ください。
              当サイトの情報を利用したことによる損害について、運営者は責任を負いません。
            </p>
          </section>

          <section>
            <h3 className="font-bold text-slate-800 mb-2">著作権について</h3>
            <p>
              番組名・店舗写真等の著作権は、MBSおよび各権利者に帰属します。
              当サイトはファンサイトとして店舗検索の便宜のために情報を整理しているものであり、商用目的での無断転載・複製はご遠慮ください。
            </p>
          </section>

          <section>
            <h3 className="font-bold text-slate-800 mb-2">掲載内容の削除依頼について</h3>
            <p>
              店舗情報・画像等の掲載について、権利者の方からの削除・修正のご依頼があれば速やかに対応いたします。
              お問い合わせ方法は今後追記予定です。
            </p>
          </section>

          <section>
            <h3 className="font-bold text-slate-800 mb-2">関連ページ</h3>
            <p>
              <Link href="/privacy" className="text-purple-600 hover:underline">プライバシーポリシー</Link>
              {' '}もご確認ください。
            </p>
          </section>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-purple-600 hover:underline">← トップページに戻る</Link>
        </div>
      </div>

      <footer className="bg-slate-800 text-white py-8 mt-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-slate-400">© 2026 水野真紀の魔法のレストラン 紹介店検索</p>
        </div>
      </footer>
    </div>
  )
}
