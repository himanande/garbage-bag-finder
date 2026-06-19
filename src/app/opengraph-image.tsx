import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #6d28d9 0%, #4338ca 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 90, marginBottom: 16 }}>✨</div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: 'white',
            textAlign: 'center',
            padding: '0 60px',
            lineHeight: 1.3,
          }}
        >
          水野真紀の魔法のレストラン
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: '#fcd34d',
            marginTop: 8,
          }}
        >
          紹介店検索
        </div>
        <div
          style={{
            fontSize: 28,
            color: '#e9d5ff',
            marginTop: 28,
          }}
        >
          2700件超のお店を都道府県・ジャンル・現在地から検索
        </div>
      </div>
    ),
    { ...size }
  )
}
