import Link from 'next/link'
import { BookOpen, Layers, ListChecks, GraduationCap } from 'lucide-react'

export const metadata = {
  title: 'CISSP用語マスター',
  description: 'CISSP試験で出題されやすい用語・キーワードを集中的に学習できるサービス',
}

const NAV_ITEMS = [
  { href: '/cissp', label: 'ホーム', icon: GraduationCap },
  { href: '/cissp/glossary', label: '用語集', icon: BookOpen },
  { href: '/cissp/flashcards', label: 'フラッシュカード', icon: Layers },
  { href: '/cissp/quiz', label: 'クイズ', icon: ListChecks },
]

export default function CisspLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50">
      <header className="bg-gradient-to-r from-slate-800 to-sky-800 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <Link href="/cissp" className="flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-emerald-300" />
            <h1 className="text-xl sm:text-2xl font-bold text-white">CISSP用語マスター</h1>
          </Link>
          <p className="text-sky-100 mt-1 text-sm">
            出題されやすい用語・キーワードを集中的に学習する、CISSP対策の入門サービス
          </p>
          <nav className="flex flex-wrap gap-2 mt-4">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>

      <footer className="bg-slate-800 text-white py-8 mt-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm">© 2026 CISSP用語マスター. 本サービスは学習支援を目的としたものです。</p>
        </div>
      </footer>
    </div>
  )
}
