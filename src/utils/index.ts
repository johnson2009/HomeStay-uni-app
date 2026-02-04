// 工具函数导出
export * from './date'
export * from './config'

/**
 * 格式化价格
 * @param price 价格（分或元）
 * @param isFen 是否是分
 */
export function formatPrice(price: number | null | undefined, isFen: boolean = false): string {
  if (price === null || price === undefined) return '0.00'
  const yuan = isFen ? price / 100 : price
  return yuan.toFixed(2)
}

/**
 * 获取预订状态文本
 */
export function getBookingStatusText(status: number): string {
  const statusMap: Record<number, string> = {
    0: '待支付',
    1: '待确认',
    2: '已确认',
    3: '已入住',
    4: '已完成',
    5: '已取消',
    6: '已退款'
  }
  return statusMap[status] || '未知'
}

/**
 * 获取预订状态样式类名
 */
export function getBookingStatusClass(status: number): string {
  const classMap: Record<number, string> = {
    0: 'warning',
    1: 'warning',
    2: 'primary',
    3: 'success',
    4: 'success',
    5: 'danger',
    6: 'danger'
  }
  return classMap[status] || ''
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let lastTime = 0
  return function(this: any, ...args: Parameters<T>) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      fn.apply(this, args)
      lastTime = now
    }
  }
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  return function(this: any, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}
