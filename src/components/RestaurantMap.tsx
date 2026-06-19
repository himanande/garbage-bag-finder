'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'

interface MapRestaurant {
  id: string
  name: string
  genre: string
  prefecture: string
  city: string
  address: string
  lat: number
  lng: number
  appearances: { award: string; broadcastDate: string }[]
}

interface RestaurantMapProps {
  restaurants: MapRestaurant[]
}

export default function RestaurantMap({ restaurants }: RestaurantMapProps) {
  const [mounted, setMounted] = useState(false)
  const [markerIcon, setMarkerIcon] = useState<L.Icon | null>(null)

  useEffect(() => {
    // Leafletはブラウザ専用のためuseEffect内で初期化
    import('leaflet').then((L) => {
      setMarkerIcon(
        new L.Icon({
          iconUrl: '/leaflet/marker-icon.png',
          iconRetinaUrl: '/leaflet/marker-icon-2x.png',
          shadowUrl: '/leaflet/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        })
      )
    })
    setMounted(true)
  }, [])

  if (!mounted || !markerIcon) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        地図を読み込み中...
      </div>
    )
  }

  const mappable = restaurants.filter((r) => r.lat !== 0 || r.lng !== 0)
  const center: [number, number] =
    mappable.length > 0 ? [mappable[0].lat, mappable[0].lng] : [34.6937, 135.5023]

  return (
    <MapContainer
      center={center}
      zoom={mappable.length > 0 ? 12 : 10}
      scrollWheelZoom
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {mappable.map((restaurant) => (
        <Marker key={restaurant.id} position={[restaurant.lat, restaurant.lng]} icon={markerIcon}>
          <Popup>
            <div className="space-y-1">
              <p className="font-bold">{restaurant.name}</p>
              <p className="text-xs text-slate-600">
                {restaurant.genre} | {restaurant.prefecture}{restaurant.city}
              </p>
              <p className="text-xs text-amber-700 font-semibold">{restaurant.appearances[0].award}</p>
              <p className="text-xs text-slate-600">{restaurant.address}</p>
            </div>
          </Popup>
        </Marker>
      ))}
      {mappable.length === 0 && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 1000, background: 'white', padding: '16px', borderRadius: '8px', fontSize: '14px', color: '#64748b' }}>
          地図表示用の座標データがありません
        </div>
      )}
    </MapContainer>
  )
}