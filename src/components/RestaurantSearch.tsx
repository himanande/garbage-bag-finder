'use client'

import React, { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, Search, Sparkles, List, Map as MapIcon, Calendar, Award } from 'lucide-react'
import { restaurants, REGIONS, GENRES } from '@/data/restaurants'

const RestaurantMap = dynamic(() => import('@/components/RestaurantMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-slate-500">
      地図を読み込み中...
    </div>
  ),
})

export default function RestaurantSearch() {
  const [keyword, setKeyword] = useState('')
  const [selectedRegion, setSelectedRegion] = useState<string>('')
  const [selectedGenre, setSelectedGenre] = useState<string>('')
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')

  const filteredRestaurants = useMemo(() => {
    const lowerKeyword = keyword.trim().toLowerCase()
    return restaurants.filter((restaurant) => {
      if (selectedRegion && restaurant.region !== selectedRegion) return false
      if (selectedGenre && restaurant.genre !== selectedGenre) return false
      if (lowerKeyword) {
        const haystack = `${restaurant.name} ${restaurant.prefecture} ${restaurant.city} ${restaurant.address} ${restaurant.description}`.toLowerCase()
        if (!haystack.includes(lowerKeyword)) return false
      }
      return true
    })
  }, [keyword, selectedRegion, selectedGenre])

  const resetFilters = () => {
    setKeyword('')
    setSelectedRegion('')
    setSelectedGenre('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-amber-50">
      <header className="bg-gradient-to-r from-purple-700 to-indigo-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-8 h-8 text-amber-300" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white">魔法のレストラン セレクション</h1>
          </div>
          <p className="text-purple-100 mt-2">
            番組で紹介された全国の名店を、地域・ジャンル・地図から検索できます
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 検索フォーム */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-semibold text-slate-700 mb-2">キーワード検索</label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="店名・地名で検索"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">地域で絞り込み</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">すべての地域</option>
                {REGIONS.map((region) => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">ジャンルで絞り込み</label>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">すべてのジャンル</option>
                {GENRES.map((genre) => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-6">
            <div className="flex items-center gap-2">
              <button
                onClick={resetFilters}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                条件をリセット
              </button>
              <span className="text-slate-300">|</span>
              <span className="text-sm text-slate-600">{filteredRestaurants.length}件のお店が見つかりました</span>
            </div>

            <div className="flex bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <List className="w-4 h-4" />
                リスト表示
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'map' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <MapIcon className="w-4 h-4" />
                マップ表示
              </button>
            </div>
          </div>
        </div>

        {/* 検索結果 */}
        {viewMode === 'list' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-lg transition-all p-5 flex flex-col"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-slate-800">{restaurant.name}</h3>
                  <span className="shrink-0 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                    {restaurant.genre}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-sm text-slate-600 mb-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{restaurant.region} / {restaurant.prefecture}{restaurant.city}</span>
                </div>

                <p className="text-sm text-slate-500 mb-3">{restaurant.address}</p>

                <p className="text-sm text-slate-700 mb-4 flex-1">{restaurant.description}</p>

                <div className="space-y-1 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-1 text-sm text-amber-700 font-semibold">
                    <Award className="w-4 h-4 shrink-0" />
                    <span>{restaurant.award}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>放送日: {restaurant.broadcastDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-[600px]">
              <RestaurantMap restaurants={filteredRestaurants} />
            </div>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {filteredRestaurants.map((restaurant) => (
                <div key={restaurant.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-slate-800 text-sm">{restaurant.name}</h3>
                    <span className="shrink-0 bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-medium">
                      {restaurant.genre}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-1">{restaurant.prefecture}{restaurant.city}</p>
                  <p className="text-xs text-amber-700 font-semibold">{restaurant.award}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredRestaurants.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">該当するお店が見つかりませんでした</h3>
            <p className="text-slate-500 mb-6">検索条件を変更してもう一度お試しください</p>
            <button onClick={resetFilters} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors">
              検索条件をリセット
            </button>
          </div>
        )}
      </div>

      <footer className="bg-slate-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400">© 2026 魔法のレストラン セレクション. すべての権利を保有します。</p>
        </div>
      </footer>
    </div>
  )
}
