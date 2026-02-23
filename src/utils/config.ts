// 配置文件

// API基础地址 - 请根据实际情况修改
export const BASE_URL = 'http://localhost:8000'  // 开发环境
// export const BASE_URL = 'https://your-api-domain.com'  // 生产环境

// 图片资源基地址（用于小程序主包瘦身：大图走网络，避免超 200KB）
// 与 BASE_URL 同域时无需单独配置；HomeStay 已挂载 /static，即 BASE_URL/static/images/xxx
export const IMAGE_BASE_URL = BASE_URL + '/static'

/** 获取图片 URL：小程序用网络图（不占包体），H5 可走本地 /static */
export function getImageUrl(path: string): string {
  if (!path) return ''
  const base = IMAGE_BASE_URL || ''
  if (base) return base + (path.startsWith('/') ? path : '/' + path)
  return (path.startsWith('/') ? path : '/static/' + path)
}

// 是否为开发环境
export const IS_DEV = process.env.NODE_ENV === 'development' || BASE_URL.includes('localhost')

// API 路径（与 HomeStay 后端 app/main.py 的 API_PREFIX + app/api 路由一致，默认 /api/v1）
const API_PREFIX = '/api/v1'

export const API = {
  // 认证相关 -> HomeStay app/api/auth.py
  AUTH: {
    WX_LOGIN: `${API_PREFIX}/auth/wx/login`,
    WX_PHONE_LOGIN: `${API_PREFIX}/auth/wx/phone-login`,
    DEV_LOGIN: `${API_PREFIX}/auth/dev/login`,  // 开发环境登录
    ME: `${API_PREFIX}/auth/me`,
    REFRESH: `${API_PREFIX}/auth/refresh`
  },
  // 门店相关 -> app/api/store.py
  STORE: {
    LIST: `${API_PREFIX}/stores/list`,
    DETAIL: (id: number | string) => `${API_PREFIX}/stores/${id}/detail`
  },
  // 房间相关 -> app/api/room.py
  ROOM: {
    TYPE_LIST: (storeId: number | string) => `${API_PREFIX}/rooms/types/list/${storeId}`,
    PRICES: (roomTypeId: number | string) => `${API_PREFIX}/rooms/prices/${roomTypeId}`,
    AVAILABILITY: `${API_PREFIX}/rooms/availability`
  },
  // 预订相关 -> app/api/booking.py
  BOOKING: {
    CREATE: `${API_PREFIX}/bookings`,
    MY_LIST: `${API_PREFIX}/bookings/my`,
    MY_DETAIL: (id: number | string) => `${API_PREFIX}/bookings/my/${id}`,
    CANCEL: (id: number | string) => `${API_PREFIX}/bookings/my/${id}/cancel`
  }
}
