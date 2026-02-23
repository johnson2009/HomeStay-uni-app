// HTTP请求封装（不直接引用 stores，避免主包打入未使用 JS）
import { BASE_URL } from './config'
import { emit } from './eventBus'

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: Record<string, any>
  header?: Record<string, string>
}

interface ApiResponse<T = any> {
  code?: number
  message?: string
  data?: T
  detail?: string | Array<{ msg: string }>
}

/** 从 storage 读 token，避免依赖 store */
function getToken(): string {
  return uni.getStorageSync('token') || ''
}

/**
 * 发起HTTP请求
 */
export function request<T = any>(options: RequestOptions): Promise<T> {
  return new Promise((resolve, reject) => {
    const token = getToken()

    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.header
      },
      success(res) {
        const statusCode = res.statusCode
        const data = res.data as ApiResponse<T>
        
        // 处理业务响应
        if (statusCode === 200) {
          if (data.code === 0 || data.code === undefined) {
            resolve(data.data !== undefined ? data.data : data as unknown as T)
          } else {
            // 业务错误
            uni.showToast({
              title: data.message || '请求失败',
              icon: 'none'
            })
            reject(data)
          }
        } else if (statusCode === 401) {
          // 未授权：发事件由 App 清理 store 并跳转，避免 request 引用 stores（主包瘦身）
          uni.removeStorageSync('token')
          uni.removeStorageSync('userInfo')
          emit('auth:unauthorized')
          uni.showToast({
            title: '请重新登录',
            icon: 'none'
          })
          uni.navigateTo({
            url: '/pkgUser/login'
          })
          reject({ code: 401, message: '未授权' })
        } else if (statusCode === 422) {
          // 参数验证错误
          const detail = data.detail
          let message = '参数错误'
          if (Array.isArray(detail) && detail.length > 0) {
            message = detail[0].msg || message
          } else if (typeof detail === 'string') {
            message = detail
          }
          uni.showToast({
            title: message,
            icon: 'none'
          })
          reject({ code: 422, message })
        } else {
          // 其他HTTP错误
          uni.showToast({
            title: (data as any).detail || '服务器错误',
            icon: 'none'
          })
          reject({ code: statusCode, message: (data as any).detail || '请求失败' })
        }
      },
      fail(err) {
        uni.showToast({
          title: '网络错误，请检查网络连接',
          icon: 'none'
        })
        reject({ code: -1, message: '网络错误' })
      }
    })
  })
}

/**
 * GET请求
 */
export function get<T = any>(url: string, data: Record<string, any> = {}): Promise<T> {
  return request<T>({ url, method: 'GET', data })
}

/**
 * POST请求
 */
export function post<T = any>(url: string, data: Record<string, any> = {}): Promise<T> {
  return request<T>({ url, method: 'POST', data })
}

/**
 * PUT请求
 */
export function put<T = any>(url: string, data: Record<string, any> = {}): Promise<T> {
  return request<T>({ url, method: 'PUT', data })
}

/**
 * DELETE请求
 */
export function del<T = any>(url: string, data: Record<string, any> = {}): Promise<T> {
  return request<T>({ url, method: 'DELETE', data })
}
