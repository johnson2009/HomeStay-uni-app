// 预订状态管理
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getToday, getTomorrow, getWeekDay, daysBetween, getDateAfterDays } from '@/utils/date'

export const useBookingStore = defineStore('booking', () => {
  // 状态
  const checkInDate = ref<string>(getToday())
  const checkOutDate = ref<string>(getTomorrow())
  
  // 计算属性
  const checkInWeek = computed(() => getWeekDay(checkInDate.value))
  const checkOutWeek = computed(() => getWeekDay(checkOutDate.value))
  const nights = computed(() => daysBetween(checkInDate.value, checkOutDate.value))
  
  // 方法
  /**
   * 设置入住日期
   */
  function setCheckInDate(date: string) {
    const today = getToday()
    // 不能选择过去的日期
    if (date < today) {
      uni.showToast({
        title: '不能选择过去的日期',
        icon: 'none'
      })
      return false
    }
    
    checkInDate.value = date
    
    // 如果入住日期晚于等于离店日期，自动调整离店日期
    if (date >= checkOutDate.value) {
      checkOutDate.value = getDateAfterDays(1, new Date(date))
    }
    
    return true
  }
  
  /**
   * 设置离店日期
   */
  function setCheckOutDate(date: string) {
    // 离店日期必须晚于入住日期
    if (date <= checkInDate.value) {
      uni.showToast({
        title: '离店日期必须晚于入住日期',
        icon: 'none'
      })
      return false
    }
    
    checkOutDate.value = date
    return true
  }
  
  /**
   * 重置日期为默认值
   */
  function resetDates() {
    checkInDate.value = getToday()
    checkOutDate.value = getTomorrow()
  }
  
  return {
    checkInDate,
    checkOutDate,
    checkInWeek,
    checkOutWeek,
    nights,
    setCheckInDate,
    setCheckOutDate,
    resetDates
  }
})
