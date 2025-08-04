'use client'

import React, { useState } from 'react'
import { Search, Package, AlertCircle, ExternalLink, Heart, Star } from 'lucide-react'
import { supabase, type GarbageBag } from '@/lib/supabase'

// 最適なゴミ袋のサイズを格納する型
interface IdealBagSize {
  width: number
  height: number
  depth: number | null
}

export default function GarbageBagFinder() {
  const [searchForm, setSearchForm] = useState({
    trashcanShape: '角型',
    trashcanWidth: '',
    trashcanDepth: '',
    trashcanHeight: '',
    trashcanDiameter: '',
    bagType: '立体袋',
    color: '',
  })
  
  const [searchResults, setSearchResults] = useState<GarbageBag[]>([])
  const [filteredResults, setFilteredResults] = useState<GarbageBag[]>([])
  const [idealBagSize, setIdealBagSize] = useState<IdealBagSize | null>(null)
  const [selectedStores, setSelectedStores] = useState<string[]>([])
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(false)

  // ゴミ箱の形状と袋の種類に応じた最適サイズを計算
  const calculateIdealBagSize = (): IdealBagSize | null => {
    const { trashcanShape, bagType, trashcanWidth, trashcanDepth, trashcanHeight, trashcanDiameter } = searchForm
    const width = parseInt(trashcanWidth)
    const depth = parseInt(trashcanDepth)
    const height = parseInt(trashcanHeight)
    const diameter = parseInt(trashcanDiameter)

    if (trashcanShape === '角型') {
      if (!width || !depth || !height) return null
      if (bagType === '平袋') {
        return {
          width: width + depth + 10,
          height: height + 15 + 5,
          depth: null
        }
      }
      if (bagType === '立体袋') {
        return {
          width: width + 5,
          depth: depth + 5,
          height: height + 10
        }
      }
    }
  
    if (trashcanShape === '円形') {
      if (!diameter || !height) return null
      if (bagType === '平袋') {
        return {
          width: Math.round(diameter * 3.14 / 2 + 10),
          height: height + 15 + 5,
          depth: null
        }
      }
      if (bagType === '立体袋') {
        return {
          width: diameter + 5,
          depth: diameter + 5,
          height: height + 10
        }
      }
    }
    return null
  }

  // 単価計算
  const calculateUnitPrice = (price: number, quantity: number) => {
    if (!price || !quantity || quantity === 0) return 0
    return Math.round((price / quantity) * 10) / 10
  }

  // 検索結果から販売店リストを取得
  const getAvailableStores = () => {
    const stores = [...new Set(searchResults.map(bag => bag.seller))]
    return stores.sort()
  }

  // 販売店フィルタを適用
  const applyStoreFilter = (results: GarbageBag[], selectedStores: string[]) => {
    if (selectedStores.length === 0) {
      return results
    }
    return results.filter(bag => selectedStores.includes(bag.seller))
  }

  // 販売店選択の変更処理
  const handleStoreSelection = (store: string, isChecked: boolean) => {
    setSelectedStores(prev => {
      const newSelection = isChecked 
        ? [...prev, store]
        : prev.filter(s => s !== store)
      
      const filtered = applyStoreFilter(searchResults, newSelection)
      setFilteredResults(filtered)
      
      return newSelection
    })
  }

  // 全ての販売店を選択/解除
  const handleSelectAllStores = (selectAll: boolean) => {
    const newSelection = selectAll ? getAvailableStores() : []
    setSelectedStores(newSelection)
    
    const filtered = applyStoreFilter(searchResults, newSelection)
    setFilteredResults(filtered)
  }

  // フォーム入力処理
  const handleInputChange = (field: string, value: string) => {
    setSearchForm(prev => {
      const newForm = { ...prev, [field]: value };

      if (field === 'trashcanShape') {
        if (value === '角型') {
          newForm.trashcanDiameter = '';
        } else { // 円形
          newForm.trashcanWidth = '';
          newForm.trashcanDepth = '';
        }
      }
      return newForm;
    });
  }

  // 検索実行
  const handleSearch = async () => {
    const idealSize = calculateIdealBagSize()
    if (!idealSize) {
      alert('ゴミ箱のサイズをすべて入力してください。')
      return
    }
    setIdealBagSize(idealSize)
    setLoading(true)
    
    try {
      let query = supabase.from('garbage_bags').select('*')

      // 必須条件で絞り込み
      query = query.eq('bag_type', searchForm.bagType)
      query = query.gte('width', idealSize.width)
      query = query.gte('height', idealSize.height)
      if (idealSize.depth !== null) {
        query = query.gte('depth', idealSize.depth)
      }

      // 色フィルタ (任意)
      if (searchForm.color) {
        query = query.eq('color', searchForm.color)
      }

      const { data, error } = await query

      if (error) throw error

      // 最適サイズに近い順に並び替え
      const sortedResults = (data || []).sort((a, b) => {
        const volumeA = a.width * a.height * (a.depth || 1)
        const volumeB = b.width * b.height * (b.depth || 1)
        return volumeA - volumeB
      })

      setSearchResults(sortedResults)
      setFilteredResults(sortedResults)
      setSelectedStores([])
      setShowResults(true)
    } catch (error: any) {
      console.error('Search error:', error.message || error)
    } finally {
      setLoading(false)
    }
  }

  // 検索リセット
  const resetSearch = () => {
    setSearchForm({
      trashcanShape: '角型',
      trashcanWidth: '',
      trashcanDepth: '',
      trashcanHeight: '',
      trashcanDiameter: '',
      bagType: '立体袋',
      color: '',
    })
    setShowResults(false)
    setSearchResults([])
    setFilteredResults([])
    setSelectedStores([])
    setIdealBagSize(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-3">
            <Package className="w-8 h-8 text-emerald-600" />
            <h1 className="text-2xl font-bold text-slate-800">ゴミ袋サイズファインダー</h1>
          </div>
          <p className="text-slate-600 mt-2">ゴミ箱のサイズから最適なゴミ袋を見つけましょう</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {!showResults ? (
          // 検索画面
          <div className="max-w-2xl mx-auto">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-amber-800 mb-2">サイズ選びのポイント</h3>
                  <p className="text-amber-700 text-sm leading-relaxed">
                    ゴミ袋は実際のゴミ箱より少し大きめのサイズを選ぶことをおすすめします。
                    袋の種類によって最適なサイズは異なります。必要な情報を入力して、ぴったりの袋を見つけましょう。
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                <Search className="w-5 h-5 mr-2 text-emerald-600" />
                ゴミ箱の情報を入力してください
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">1. ゴミ箱の形状</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => handleInputChange('trashcanShape', '角型')} className={`p-4 border-2 rounded-lg text-center transition-all ${searchForm.trashcanShape === '角型' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-300 hover:border-slate-400'}`}>
                      <div className="font-medium">角型</div>
                      <div className="text-xs text-slate-500 mt-1">立方体・直方体</div>
                    </button>
                    <button onClick={() => handleInputChange('trashcanShape', '円形')} className={`p-4 border-2 rounded-lg text-center transition-all ${searchForm.trashcanShape === '円形' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-300 hover:border-slate-400'}`}>
                      <div className="font-medium">円形</div>
                      <div className="text-xs text-slate-500 mt-1">円柱</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">2. ゴミ箱のサイズ (cm)</label>
                  {searchForm.trashcanShape === '角型' ? (
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">幅</label>
                        <input type="number" placeholder="30" value={searchForm.trashcanWidth} onChange={(e) => handleInputChange('trashcanWidth', e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">奥行</label>
                        <input type="number" placeholder="25" value={searchForm.trashcanDepth} onChange={(e) => handleInputChange('trashcanDepth', e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">高さ</label>
                        <input type="number" placeholder="40" value={searchForm.trashcanHeight} onChange={(e) => handleInputChange('trashcanHeight', e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">直径</label>
                        <input type="number" placeholder="30" value={searchForm.trashcanDiameter} onChange={(e) => handleInputChange('trashcanDiameter', e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">高さ</label>
                        <input type="number" placeholder="40" value={searchForm.trashcanHeight} onChange={(e) => handleInputChange('trashcanHeight', e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">3. 希望するゴミ袋のタイプ</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => handleInputChange('bagType', '平袋')} className={`p-4 border-2 rounded-lg text-center transition-all ${searchForm.bagType === '平袋' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-300 hover:border-slate-400'}`}>
                      <div className="font-medium">平袋</div>
                      <div className="text-xs text-slate-500 mt-1">マチなし</div>
                    </button>
                    <button onClick={() => handleInputChange('bagType', '立体袋')} className={`p-4 border-2 rounded-lg text-center transition-all ${searchForm.bagType === '立体袋' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-300 hover:border-slate-400'}`}>
                      <div className="font-medium">立体袋</div>
                      <div className="text-xs text-slate-500 mt-1">取っ手付き・マチあり</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">4. 希望する色 (任意)</label>
                  <select value={searchForm.color} onChange={(e) => handleInputChange('color', e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors">
                    <option value="">指定なし</option>
                    <option value="透明">透明</option>
                    <option value="半透明">半透明</option>
                    <option value="黒">黒</option>
                    <option value="白">白</option>
                    <option value="その他">その他</option>
                  </select>
                </div>

                <button onClick={handleSearch} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-semibold py-4 px-6 rounded-xl transition-colors shadow-lg hover:shadow-xl">
                  <Search className="w-5 h-5 inline mr-2" />
                  {loading ? '検索中...' : '最適なゴミ袋を検索する'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          // 検索結果画面
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">検索結果</h2>
                <p className="text-slate-600 mt-1">
                  {searchResults.length}件中 {filteredResults.length}件のゴミ袋を表示中
                </p>
              </div>
              <button onClick={resetSearch} className="w-full sm:w-auto bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg transition-colors">
                新しく検索する
              </button>
            </div>

            {/* 最適サイズの説明 */}
            {idealBagSize && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-8">
                <div className="flex items-start space-x-3">
                  <Star className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-emerald-800 mb-2">あなたのゴミ箱に最適なサイズ</h3>
                    <p className="text-emerald-700 text-sm leading-relaxed">
                      入力された情報から計算した、推奨されるゴミ袋の最小サイズは以下の通りです。このサイズ以上の商品がフィットします。
                    </p>
                    <div className="mt-3 font-mono text-sm bg-emerald-100 text-emerald-900 rounded p-3 inline-block">
                      幅: {idealBagSize.width}cm | 高さ: {idealBagSize.height}cm {idealBagSize.depth && `| 奥行: ${idealBagSize.depth}cm`}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 販売店フィルタ */}
            {searchResults.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <h3 className="font-semibold text-slate-800">販売店で絞り込み</h3>
                  <div className="flex space-x-2">
                    <button onClick={() => handleSelectAllStores(true)} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">すべて選択</button>
                    <span className="text-slate-300">|</span>
                    <button onClick={() => handleSelectAllStores(false)} className="text-sm text-slate-600 hover:text-slate-700 font-medium">すべて解除</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {getAvailableStores().map(store => {
                    const storeCount = searchResults.filter(bag => bag.seller === store).length;
                    return (
                      <label key={store} className="flex items-center space-x-2 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors">
                        <input type="checkbox" checked={selectedStores.includes(store)} onChange={(e) => handleStoreSelection(store, e.target.checked)} className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 focus:ring-2" />
                        <span className="text-sm font-medium text-slate-700">{store}</span>
                        <span className="text-xs text-slate-500">({storeCount}件)</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 検索結果一覧 */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredResults.map((bag, index) => (
                <div key={bag.id} className={`bg-white rounded-xl shadow-sm border transition-all hover:shadow-lg relative h-fit ${
                  index === 0 ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-slate-200'
                }`}>
                  {index === 0 && (
                    <div className="absolute -top-2 -right-2 z-10">
                      <div className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center space-x-1">
                        <Star className="w-3 h-3 text-emerald-100" />
                        <span>ベストフィット</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="p-4">
                    <div className={`w-full h-48 rounded-lg flex items-center justify-center mb-4 overflow-hidden ${!bag.image_url ? 'bg-slate-100' : ''}`}>
                      {bag.image_url ? (
                        <img src={bag.image_url} alt={bag.name} className="w-full h-full object-contain" />
                      ) : (
                        <Package className="w-12 h-12 text-slate-400" />
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm line-clamp-2">{bag.name}</h3>
                        <p className="text-slate-600 text-xs">{bag.capacity} | {bag.seller}</p>
                      </div>

                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="text-center">
                          <div className="text-lg font-bold text-emerald-600">¥{bag.price}</div>
                          <div className="text-xs text-slate-600">
                            {bag.quantity}枚入り | 1枚¥{calculateUnitPrice(bag.price, bag.quantity)}
                          </div>
                        </div>
                      </div>

                      {/* サイズ比較 */}
                      {idealBagSize && (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">幅</span>
                            <span className="font-semibold">{bag.width}cm <span className="font-normal text-slate-400">(最適: {idealBagSize.width}cm)</span></span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">高さ</span>
                            <span className="font-semibold">{bag.height}cm <span className="font-normal text-slate-400">(最適: {idealBagSize.height}cm)</span></span>
                          </div>
                          {idealBagSize.depth !== null && bag.depth !== null && (
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500">奥行</span>
                              <span className="font-semibold">{bag.depth}cm <span className="font-normal text-slate-400">(最適: {idealBagSize.depth}cm)</span></span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1">
                        <span className="bg-sky-100 text-sky-800 px-2 py-1 rounded-full text-xs font-medium">
                          {bag.bag_type}
                        </span>
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs">
                          {bag.color}
                        </span>
                        <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-full text-xs">
                          {bag.has_handle ? '取っ手あり' : '取っ手なし'}
                        </span>
                      </div>

                      <div className="flex space-x-2 pt-2">
                        {bag.purchase_url ? (
                          <a href={bag.purchase_url} target="_blank" rel="noopener noreferrer" className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2 px-3 rounded-lg transition-colors text-sm flex items-center justify-center">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            購入
                          </a>
                        ) : (
                          <button disabled className="flex-1 bg-slate-400 text-white py-2 px-3 rounded-lg text-sm flex items-center justify-center cursor-not-allowed">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            購入
                          </button>
                        )}
                        <button className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                          <Heart className="w-4 h-4 text-slate-400 hover:text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredResults.length === 0 && searchResults.length > 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">選択した販売店に該当する商品がありません</h3>
                <p className="text-slate-500 mb-6">販売店の選択を変更するか、フィルタを解除してください</p>
                <button onClick={() => handleSelectAllStores(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg transition-colors">
                  すべての販売店を表示
                </button>
              </div>
            )}

            {searchResults.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">該当するゴミ袋が見つかりませんでした</h3>
                <p className="text-slate-500 mb-6">検索条件を変更してもう一度お試しください</p>
                <button onClick={resetSearch} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg transition-colors">
                  検索条件を変更する
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="bg-slate-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400">© 2025 ゴミ袋サイズファインダー. すべての権利を保有します。</p>
        </div>
      </footer>
    </div>
  )
}