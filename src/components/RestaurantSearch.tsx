'use client'

import React, { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, Search, Sparkles, List, Map as MapIcon, Calendar, Award, Navigation, RotateCcw } from 'lucide-react'
import { restaurants, GENRES, PREFECTURES } from '@/data/restaurants'

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const RestaurantMap = dynamic(() => import('@/components/RestaurantMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-slate-500">
      地図を読み込み中...
    </div>
  ),
})

interface Appearance {
  id: string
  broadcastDate: string
  episodeTitle?: string
  award: string
}

interface GroupedRestaurant {
  id: string
  name: string
  genre: string
  region: string
  prefecture: string
  city: string
  address: string
  lat: number
  lng: number
  description: string
  imageUrl?: string
  nearStation?: string
  tel?: string
  appearances: Appearance[]
  distanceKm?: number
}

type GeoStatus = 'idle' | 'loading' | 'success' | 'error'

export default function RestaurantSearch() {
  const [keyword, setKeyword] = useState('')
  const [selectedPrefecture, setSelectedPrefecture] = useState<string>('')
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [selectedGenre, setSelectedGenre] = useState<string>('')
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [geoStatus, setGeoStatus] = useState<GeoStatus>('idle')
  const [nearbyRadius, setNearbyRadius] = useState(5)

  const hasFilter = keyword.trim() !== '' || selectedPrefecture !== '' || selectedCity !== '' || selectedGenre !== '' || userLocation !== null

  const citiesForPrefecture = useMemo(() => {
    if (!selectedPrefecture) return []
    const cities = new Set<string>()
    for (const r of restaurants) {
      if (r.prefecture === selectedPrefecture && r.city) cities.add(r.city)
    }
    return Array.from(cities).sort((a, b) => a.localeCompare(b, 'ja'))
  }, [selectedPrefecture])

  const handleLocate = () => {
    if (!navigator.geolocation) { setGeoStatus('error'); return }
    setGeoStatus('loading')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setGeoStatus('success')
      },
      () => setGeoStatus('error'),
    )
  }

  const groupedRestaurants = useMemo((): GroupedRestaurant[] => {
    if (!hasFilter) return []
    const lowerKeyword = keyword.trim().toLowerCase()
    const filtered = restaurants.filter((r) => {
      if (selectedPrefecture && r.prefecture !== selectedPrefecture) return false
      if (selectedCity && r.city !== selectedCity) return false
      if (selectedGenre && r.genre !== selectedGenre) return false
      if (lowerKeyword) {
        const haystack = `${r.name} ${r.prefecture} ${r.city} ${r.address} ${r.description}`.toLowerCase()
        if (!haystack.includes(lowerKeyword)) return false
      }
      if (userLocation) {
        if (r.lat === 0 && r.lng === 0) return false
        if (haversineKm(userLocation.lat, userLocation.lng, r.lat, r.lng) > nearbyRadius) return false
      }
      return true
    })

    const map = new Map<string, GroupedRestaurant>()
    for (const r of filtered) {
      const existing = map.get(r.name)
      const appearance: Appearance = {
        id: r.id,
        broadcastDate: r.broadcastDate,
        episodeTitle: r.episodeTitle,
        award: r.award,
      }
      if (existing) {
        existing.appearances.push(appearance)
      } else {
        const distanceKm = userLocation && r.lat !== 0
          ? haversineKm(userLocation.lat, userLocation.lng, r.lat, r.lng)
          : undefined
        map.set(r.name, {
          id: r.id,
          name: r.name,
          genre: r.genre,
          region: r.region,
          prefecture: r.prefecture,
          city: r.city,
          address: r.address,
          lat: r.lat,
          lng: r.lng,
          description: r.description,
          imageUrl: r.imageUrl,
          nearStation: r.nearStation,
          tel: r.tel,
          appearances: [appearance],
          distanceKm,
        })
      }
    }
    const result = Array.from(map.values())
    if (userLocation) result.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999))
    return result
  }, [keyword, selectedPrefecture, selectedCity, selectedGenre, hasFilter, userLocation, nearbyRadius])

  const handlePrefectureChange = (value: string) => {
    setSelectedPrefecture(value)
    setSelectedCity('')
  }

  const resetFilters = () => {
    setKeyword('')
    setSelectedPrefecture('')
    setSelectedCity('')
    setSelectedGenre('')
    setUserLocation(null)
    setGeoStatus('idle')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-amber-50">
      <header className="bg-gradient-to-r from-purple-700 to-indigo-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-8 h-8 text-amber-300" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white">水野真紀の魔法のレストラン 紹介店検索</h1>
          </div>
          <p className="text-purple-100 mt-2">
            番組で紹介されたお店を、地域・ジャンル・キーワードから検索できます
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 検索フォーム */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">キーワード検索</label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="店名・地名で検索"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">都道府県で絞り込み</label>
              <select
                value={selectedPrefecture}
                onChange={(e) => handlePrefectureChange(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-slate-900"
              >
                <option value="">すべての都道府県</option>
                {PREFECTURES.map((pref) => (
                  <option key={pref} value={pref}>{pref}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">市区町村で絞り込み</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                disabled={!selectedPrefecture}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-slate-900 disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="">{selectedPrefecture ? 'すべての市区町村' : '都道府県を選択してください'}</option>
                {citiesForPrefecture.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">ジャンルで絞り込み</label>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-slate-900"
              >
                <option value="">すべてのジャンル</option>
                {GENRES.map((genre) => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 現在地検索 */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            {userLocation ? (
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
                  <Navigation className="w-4 h-4" />
                  <span>現在地から検索中</span>
                </div>
                <select
                  value={nearbyRadius}
                  onChange={(e) => setNearbyRadius(Number(e.target.value))}
                  className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:ring-2 focus:ring-purple-500"
                >
                  <option value={1}>半径1km</option>
                  <option value={3}>半径3km</option>
                  <option value={5}>半径5km</option>
                  <option value={10}>半径10km</option>
                </select>
                <button
                  onClick={() => { setUserLocation(null); setGeoStatus('idle') }}
                  className="text-sm text-slate-500 hover:text-slate-700 underline"
                >
                  現在地をクリア
                </button>
              </div>
            ) : (
              <button
                onClick={handleLocate}
                disabled={geoStatus === 'loading'}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-purple-300 text-purple-700 text-sm font-medium hover:bg-purple-50 disabled:opacity-50 transition-colors"
              >
                <Navigation className="w-4 h-4" />
                {geoStatus === 'loading' ? '位置情報を取得中...' : '現在地から探す'}
              </button>
            )}
            {geoStatus === 'error' && (
              <p className="text-xs text-red-500 mt-1">位置情報の取得に失敗しました。ブラウザの設定を確認してください。</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
            <div className="flex items-center gap-3">
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-300 text-purple-700 text-sm font-medium hover:bg-purple-50 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                条件をリセット
              </button>
              <span className="text-sm text-slate-600">
                {hasFilter ? `${groupedRestaurants.length}件のお店が見つかりました` : '条件を入力して検索してください'}
              </span>
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
        {!hasFilter ? null : viewMode === 'list' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {groupedRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-lg transition-all p-5 flex flex-col"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-slate-800">{restaurant.name}</h3>
                  <div className="flex items-center gap-1 shrink-0">
                    {restaurant.appearances.length > 1 && (
                      <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-medium">
                        {restaurant.appearances.length}回登場
                      </span>
                    )}
                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                      {restaurant.genre}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-sm text-slate-600 mb-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{restaurant.region} / {restaurant.prefecture}{restaurant.city}</span>
                  {restaurant.distanceKm !== undefined && (
                    <span className="ml-auto shrink-0 text-xs text-green-700 font-medium">
                      {restaurant.distanceKm < 1
                        ? `${Math.round(restaurant.distanceKm * 1000)}m`
                        : `${restaurant.distanceKm.toFixed(1)}km`}
                    </span>
                  )}
                </div>

                <p className="text-sm text-slate-500 mb-3">{restaurant.address}</p>

                <p className="text-sm text-slate-700 mb-4 flex-1">{restaurant.description}</p>

                <div className="space-y-2 border-t border-slate-100 pt-3">
                  {restaurant.appearances.map((ap, i) => (
                    <div key={i} className="space-y-0.5">
                      <div className="flex items-center gap-1 text-sm text-amber-700 font-semibold">
                        <Award className="w-4 h-4 shrink-0" />
                        <a
                          href={`https://mahou-contents.mbs.jp/shops/${ap.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-amber-900 hover:underline"
                        >
                          {ap.award}
                        </a>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500 pl-5">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>{ap.broadcastDate}｜</span>
                        <a
                          href={`https://mahou-contents.mbs.jp/shops/onair/${ap.broadcastDate}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-purple-600 hover:underline"
                        >
                          {ap.episodeTitle ?? '放送回を見る'}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-[600px]">
              <RestaurantMap restaurants={groupedRestaurants} />
            </div>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {groupedRestaurants.map((restaurant) => (
                <div key={restaurant.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-slate-800 text-sm">{restaurant.name}</h3>
                    <div className="flex items-center gap-1 shrink-0">
                      {restaurant.appearances.length > 1 && (
                        <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-medium">
                          {restaurant.appearances.length}回登場
                        </span>
                      )}
                      <span className="shrink-0 bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-medium">
                        {restaurant.genre}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mb-1">{restaurant.prefecture}{restaurant.city}</p>
                  <a
                    href={`https://mahou-contents.mbs.jp/shops/${restaurant.appearances[0].id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-amber-700 font-semibold hover:text-amber-900 hover:underline"
                  >
                    {restaurant.appearances[0].award}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasFilter && groupedRestaurants.length === 0 && (
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
        <div className="max-w-7xl mx-auto px-4 text-center space-y-3">
          <div className="flex items-center justify-center gap-4 text-sm text-slate-300">
            <a href="/about" className="hover:text-white hover:underline">このサイトについて</a>
            <span className="text-slate-600">|</span>
            <a href="/privacy" className="hover:text-white hover:underline">プライバシーポリシー</a>
          </div>
          <p className="text-slate-400">© 2026 水野真紀の魔法のレストラン 紹介店検索</p>
        </div>
      </footer>
    </div>
  )
}
