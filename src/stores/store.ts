// 门店状态管理
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Store } from '@/types'
import { getStoreList as getStoreListApi, getStoreDetail as getStoreDetailApi } from '@/api/store'

export const useStoreStore = defineStore('store', () => {
  // 状态
  const stores = ref<Store[]>([])
  const currentStore = ref<Store | null>(null)
  const loading = ref<boolean>(false)
  
  // 方法
  /**
   * 加载门店列表
   */
  async function loadStores(city: string = ''): Promise<Store[]> {
    loading.value = true
    try {
      const data = await getStoreListApi(city)
      stores.value = data || []
      return stores.value
    } catch (err) {
      console.error('加载门店失败', err)
      stores.value = []
      return []
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 加载门店详情
   */
  async function loadStoreDetail(storeId: number | string): Promise<Store | null> {
    loading.value = true
    try {
      const data = await getStoreDetailApi(storeId)
      currentStore.value = data
      return data
    } catch (err) {
      console.error('加载门店详情失败', err)
      return null
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 清除当前门店
   */
  function clearCurrentStore() {
    currentStore.value = null
  }
  
  return {
    stores,
    currentStore,
    loading,
    loadStores,
    loadStoreDetail,
    clearCurrentStore
  }
})
