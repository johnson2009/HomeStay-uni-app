// 配置文件

// API基础地址 - 请根据实际情况修改
export const BASE_URL = 'http://localhost:8000'  // 开发环境
// export const BASE_URL = 'https://your-api-domain.com'  // 生产环境

// 是否为开发环境
export const IS_DEV = process.env.NODE_ENV === 'development' || BASE_URL.includes('localhost')

// API路径
export const API = {
  // 认证相关
  AUTH: {
    WX_LOGIN: '/api/auth/wx/login',
    WX_PHONE_LOGIN: '/api/auth/wx/phone-login',
    DEV_LOGIN: '/api/auth/dev/login',  // 开发环境登录
    ME: '/api/auth/me',
    REFRESH: '/api/auth/refresh'
  },
  
  // 门店相关
  STORE: {
    LIST: '/api/stores/list',
    DETAIL: (id: number | string) => `/api/stores/${id}/detail`
  },
  
  // 房间相关
  ROOM: {
    TYPE_LIST: (storeId: number | string) => `/api/rooms/types/list/${storeId}`,
    PRICES: (roomTypeId: number | string) => `/api/rooms/prices/${roomTypeId}`,
    AVAILABILITY: '/api/rooms/availability'
  },
  
  // 预订相关
  BOOKING: {
    CREATE: '/api/bookings',
    MY_LIST: '/api/bookings/my',
    MY_DETAIL: (id: number | string) => `/api/bookings/my/${id}`,
    CANCEL: (id: number | string) => `/api/bookings/my/${id}/cancel`
  }
}
