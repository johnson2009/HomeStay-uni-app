// 认证相关API
import { get, post } from '@/utils/request'
import { API } from '@/utils/config'
import type { User, LoginResponse } from '@/types'

/**
 * 微信登录
 * @param code 微信登录code
 */
export function wxLogin(code: string): Promise<LoginResponse> {
  return post<LoginResponse>(API.AUTH.WX_LOGIN, { code })
}

/**
 * 手机号登录
 * @param code 微信获取手机号的code
 */
export function wxPhoneLogin(code: string): Promise<LoginResponse> {
  return post<LoginResponse>(API.AUTH.WX_PHONE_LOGIN, { code })
}

/**
 * 获取当前用户信息
 */
export function getCurrentUser(): Promise<User> {
  return get<User>(API.AUTH.ME)
}

/**
 * 刷新token
 */
export function refreshToken(): Promise<{ token: string }> {
  return post(API.AUTH.REFRESH)
}
