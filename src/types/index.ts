// 类型定义

/** 门店信息 */
export interface Store {
  id: number
  name: string
  city: string
  address?: string
  cover_image?: string
  description?: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

/** 房型信息 */
export interface RoomType {
  id: number
  store_id: number
  name: string
  description?: string
  base_price: number
  max_guests: number
  bed_type?: string
  area?: number
  images?: string[]
  amenities?: string[]
  is_active: boolean
}

/** 房间价格 */
export interface RoomPrice {
  date: string
  price: number
  available: boolean
}

/** 预订信息 */
export interface Booking {
  id: number
  user_id: number
  room_type_id: number
  store_id: number
  check_in_date: string
  check_out_date: string
  guest_name: string
  guest_phone: string
  total_price: number
  status: number
  remark?: string
  created_at: string
}

/** 用户信息 */
export interface User {
  id: number
  openid?: string
  nickname?: string
  avatar?: string
  phone?: string
  created_at: string
}

/** 轮播图 */
export interface Banner {
  id?: number
  image: string
  link?: string
}

/** 日期选择类型 */
export type DateType = 'checkIn' | 'checkOut'
