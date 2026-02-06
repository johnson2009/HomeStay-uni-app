// 类型定义

/** 门店信息 */
export interface Store {
  id: number
  name: string
  city?: string
  province?: string
  district?: string
  address?: string
  cover_image?: string
  images?: string
  description?: string
  facilities?: string
  check_in_time?: string
  check_out_time?: string
  contact_name?: string
  contact_phone?: string
  latitude?: number
  longitude?: number
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
  cover_image?: string
  images?: string[]
  amenities?: string[]
  is_active: boolean
  available_rooms?: number
}

/** 房间价格 */
export interface RoomPrice {
  date: string
  price: number
  available: boolean
}

/** 预订明细项 */
export interface BookingItem {
  id: number
  date: string
  price: number
}

/** 预订信息 */
export interface Booking {
  id: number
  order_no: string
  user_id: number
  room_type_id: number
  store_id: number
  store_name?: string
  room_type_name?: string
  store_phone?: string
  room_number?: string
  check_in_date: string
  check_out_date: string
  guest_name: string
  guest_phone: string
  guest_count?: number
  total_amount: number
  total_price?: number
  status: number
  remark?: string
  items?: BookingItem[]
  created_at: string
  updated_at?: string
}

/** 用户信息 */
export interface User {
  id: number
  openid?: string
  nickname?: string
  avatar?: string
  phone?: string
  created_at?: string
}

/** 轮播图 */
export interface Banner {
  id?: number
  image: string
  link?: string
}

/** 日期选择类型 */
export type DateType = 'checkIn' | 'checkOut'

/** 登录响应 */
export interface LoginResponse {
  access_token: string
  token_type?: string
  expires_in?: number
  user_id?: number
  is_new_user?: boolean
  user?: User
}
