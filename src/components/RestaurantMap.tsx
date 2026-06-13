'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Restaurant } from '@/data/restaurants'

const markerIcon = new L.Icon({
  iconUrl: '/leaflet/marker-icon.png',
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  shadowUrl: '/leaflet/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

interface RestaurantMapProps {
  restaurants: Restaurant[]
}

export default function RestaurantMap({ restaurants }: RestaurantMapProps) {
  const center: [number, number] =
    restaurants.length > 0
      ? [restaurants[0].lat, restaurants[0].lng]
      : [36.2048, 138.2529]

  return (
    <MapContainer
      center={center}
      zoom={restaurants.length > 0 ? 6 : 5}
      scrollWheelZoom
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {restaurants.map((restaurant) => (
        <Marker key={restaurant.id} position={[restaurant.lat, restaurant.lng]} icon={markerIcon}>
          <Popup>
            <div className="space-y-1">
              <p className="font-bold">{restaurant.name}</p>
              <p className="text-xs text-slate-600">
                {restaurant.genre} | {restaurant.prefecture}{restaurant.city}
              </p>
              <p className="text-xs text-amber-700 font-semibold">{restaurant.award}</p>
              <p className="text-xs text-slate-600">{restaurant.address}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
