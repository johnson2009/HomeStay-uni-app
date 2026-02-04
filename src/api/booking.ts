// 预订相关API
import { get, post } from '@/utils/request'
import { API } from '@/utils/config'
import type { Booking } from '@/types'

/** 分页响应 */
interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pages: number
  page_size: number
}

/**
 * 创建预订
 */
export function createBooking(data: {
  store_id: number
  room_type_id: number
  check_in_date: string
  check_out_date: string
  guest_name: string
  guest_phone: string
  guest_count?: number
  remark?: string
}): Promise<Booking> {
  return post<Booking>(API.BOOKING.CREATE, data)
}

/**
 * 获取我的预订列表
 */
export function getMyBookings(params?: {
  status?: number
  page?: number
  page_size?: number
}): Promise<PaginatedResponse<Booking>> {
  return get<PaginatedResponse<Booking>>(API.BOOKING.MY_LIST, params)
}

/**
 * 获取预订详情
 * @param bookingId 预订ID
 */
export function getBookingDetail(bookingId: number | string): Promise<Booking> {
  return get<Booking>(API.BOOKING.MY_DETAIL(bookingId))
}

/**
 * 取消预订
 * @param bookingId 预订ID
 * @param reason 取消原因
 */
export function cancelBooking(bookingId: number | string, reason?: string): Promise<{ success: boolean }> {
  return post(API.BOOKING.CANCEL(bookingId), { reason })
}
