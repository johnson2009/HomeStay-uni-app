// 日期工具函数

/**
 * 格式化日期
 * @param date 日期对象或字符串
 * @param format 格式化模板
 */
export function formatDate(date: Date | string, format: string = 'YYYY-MM-DD'): string {
  if (!date) return ''
  
  const d = typeof date === 'string' ? new Date(date) : date
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const minute = String(d.getMinutes()).padStart(2, '0')
  const second = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second)
}

/**
 * 获取今天的日期字符串
 */
export function getToday(): string {
  return formatDate(new Date())
}

/**
 * 获取明天的日期字符串
 */
export function getTomorrow(): string {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return formatDate(tomorrow)
}

/**
 * 获取指定天数后的日期
 */
export function getDateAfterDays(days: number, baseDate?: Date): string {
  const date = baseDate ? new Date(baseDate) : new Date()
  date.setDate(date.getDate() + days)
  return formatDate(date)
}

/**
 * 计算两个日期之间的天数
 */
export function daysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diff = end.getTime() - start.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/**
 * 获取星期几
 */
export function getWeekDay(dateStr: string): string {
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const date = new Date(dateStr)
  return weekDays[date.getDay()]
}

/**
 * 解析日期字符串为年月日
 */
export function parseDateString(dateStr: string): { year: number; month: number; day: number } {
  const date = new Date(dateStr)
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate()
  }
}

/**
 * 获取某月的天数
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

/**
 * 生成年份数组
 */
export function generateYears(startYear?: number, count: number = 2): number[] {
  const currentYear = startYear || new Date().getFullYear()
  return Array.from({ length: count }, (_, i) => currentYear + i)
}

/**
 * 生成月份数组 1-12
 */
export function generateMonths(): number[] {
  return Array.from({ length: 12 }, (_, i) => i + 1)
}

/**
 * 生成日期数组
 */
export function generateDays(year: number, month: number): number[] {
  const daysInMonth = getDaysInMonth(year, month)
  return Array.from({ length: daysInMonth }, (_, i) => i + 1)
}
