// API统一导出
import * as authApi from './auth'
import * as storeApi from './store'
import * as roomApi from './room'
import * as bookingApi from './booking'

export { authApi, storeApi, roomApi, bookingApi }

// 同时保留原有的导出方式
export * from './auth'
export * from './store'
export * from './room'
export * from './booking'
