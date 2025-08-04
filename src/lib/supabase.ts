import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface GarbageBag {
  id: string
  name: string
  width: number
  height: number
  depth: number
  capacity?: string
  color: string
  has_handle: boolean
  price: number
  quantity: number
  seller: string
  purchase_url?: string
  image_url?: string
  description?: string
  created_at: string
  updated_at: string
  bag_type: string
}

