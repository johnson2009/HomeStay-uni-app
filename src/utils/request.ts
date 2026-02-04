// HTTP请求封装
import { BASE_URL } from './config'
import { useUserStore } from '@/stores/user'

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

/**
 * 发起HTTP请求
 */
export function request<T = any>(options: RequestOptions): Promise<T> {
  return new Promise((resolve, reject) => {
    const userStore = useUserStore()
    const token = userStore.token

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
          // 未授权，需要重新登录
          userStore.clearLoginInfo()
          uni.showToast({
            title: '请重新登录',
            icon: 'none'
          })
          uni.navigateTo({
            url: '/pages/user/login'
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
