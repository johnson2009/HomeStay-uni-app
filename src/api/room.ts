// 房间相关API
import { get } from '@/utils/request'
import { API } from '@/utils/config'
import type { RoomType, RoomPrice } from '@/types'

/**
 * 获取房型列表
 * @param storeId 门店ID
 */
export function getRoomTypeList(storeId: number | string): Promise<RoomType[]> {
  return get<RoomType[]>(API.ROOM.TYPE_LIST(storeId))
}

/**
 * 获取房间价格
 * @param roomTypeId 房型ID
 * @param checkIn 入住日期
 * @param checkOut 离店日期
 */
export function getRoomPrices(
  roomTypeId: number | string,
  checkIn?: string,
  checkOut?: string
): Promise<RoomPrice[]> {
  const params: Record<string, string> = {}
  if (checkIn) params.check_in = checkIn
  if (checkOut) params.check_out = checkOut
  return get<RoomPrice[]>(API.ROOM.PRICES(roomTypeId), params)
}

/**
 * 检查房间可用性
 */
export function checkAvailability(params: {
  room_type_id: number
  check_in_date: string
  check_out_date: string
}): Promise<{ available: boolean; message?: string }> {
  return get(API.ROOM.AVAILABILITY, params)
}
