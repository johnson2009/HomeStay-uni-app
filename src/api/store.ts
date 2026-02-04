// 门店相关API
import { get } from '@/utils/request'
import { API } from '@/utils/config'
import type { Store } from '@/types'

/**
 * 获取门店列表
 * @param city 城市筛选
 */
export function getStoreList(city: string = ''): Promise<Store[]> {
  const params: Record<string, string> = {}
  if (city) params.city = city
  return get<Store[]>(API.STORE.LIST, params)
}

/**
 * 获取门店详情
 * @param storeId 门店ID
 */
export function getStoreDetail(storeId: number | string): Promise<Store> {
  return get<Store>(API.STORE.DETAIL(storeId))
}
