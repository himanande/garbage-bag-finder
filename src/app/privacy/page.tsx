import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export const metadata = {
  title: 'プライバシーポリシー | 水野真紀の魔法のレストラン 紹介店検索',
  description: '当サイトのプライバシーポリシー、広告配信・アクセス解析について説明しています。',
}

export default function PrivacyPage() {
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
        <h2 className="text-2xl font-bold text-slate-800 mb-6">プライバシーポリシー</h2>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-8 text-slate-700 leading-relaxed">
          <section>
            <h3 className="font-bold text-slate-800 mb-2">個人情報の収集について</h3>
            <p>
              当サイトでは、お問い合わせの際に名前・メールアドレス等の個人情報をご入力いただく場合がありますが、
              これらの情報は個人を特定する目的では使用いたしません。
            </p>
          </section>

          <section>
            <h3 className="font-bold text-slate-800 mb-2">アクセス解析ツールについて</h3>
            <p>
              当サイトでは、サイトの利用状況を把握するためにGoogle Analytics等のアクセス解析ツールを使用する場合があります。
              これらのツールはトラフィックデータの収集のためにCookieを使用しますが、このトラフィックデータは匿名で収集されており、個人を特定するものではありません。
            </p>
          </section>

          <section>
            <h3 className="font-bold text-slate-800 mb-2">広告の配信について</h3>
            <p>
              当サイトは、第三者配信の広告サービス（Google AdSense等）を利用する場合があります。
              このような広告配信事業者は、ユーザーの興味に応じた商品やサービスの広告を表示するため、当サイトや他サイトへのアクセス情報を含むCookieを使用することがあります。
            </p>
            <p className="mt-2">
              Googleが広告配信に使用するCookie（「DARTクッキー」）の無効化は、
              <a
                href="https://policies.google.com/technologies/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:underline"
              >
                Google広告と検索広告のポリシー
              </a>
              のページから行うことができます。
            </p>
          </section>

          <section>
            <h3 className="font-bold text-slate-800 mb-2">アフィリエイトプログラムについて</h3>
            <p>
              当サイトは、商品・サービスのリンク先で成果が発生した場合に報酬を受け取るアフィリエイトプログラムに参加する場合があります。
              紹介する店舗・サービスは実際の評価に基づいて掲載しており、アフィリエイト報酬の有無が紹介内容に影響することはありません。
            </p>
          </section>

          <section>
            <h3 className="font-bold text-slate-800 mb-2">免責事項</h3>
            <p>
              当サイトに掲載する情報については、できる限り正確な情報を掲載するよう努めておりますが、
              正確性や安全性を保証するものではありません。当サイトの情報を用いて行う行為に関しては、すべて自己責任で行っていただくようお願いいたします。
            </p>
          </section>

          <section>
            <h3 className="font-bold text-slate-800 mb-2">プライバシーポリシーの変更について</h3>
            <p>
              当サイトは、個人情報の取り扱いについて適宜見直しを行い、内容を予告なく変更することがあります。
              変更後のプライバシーポリシーについては、本ページに掲載した時点から効力が発生するものとします。
            </p>
          </section>

          <section>
            <p className="text-sm text-slate-500">最終更新日: 2026年6月19日</p>
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
