// 用户状态管理
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import { wxLogin as wxLoginApi, getCurrentUser } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<string>(uni.getStorageSync('token') || '')
  const userInfo = ref<User | null>(null)
  
  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  
  // 方法
  /**
   * 设置登录信息
   */
  function setLoginInfo(newToken: string, user: User) {
    token.value = newToken
    userInfo.value = user
    uni.setStorageSync('token', newToken)
    uni.setStorageSync('userInfo', JSON.stringify(user))
  }
  
  /**
   * 清除登录信息
   */
  function clearLoginInfo() {
    token.value = ''
    userInfo.value = null
    uni.removeStorageSync('token')
    uni.removeStorageSync('userInfo')
  }
  
  /**
   * 静默登录
   */
  async function silentLogin(): Promise<boolean> {
    // 如果已经登录，直接返回
    if (isLoggedIn.value) {
      // 尝试获取用户信息
      try {
        const user = await getCurrentUser()
        userInfo.value = user
        return true
      } catch (err) {
        clearLoginInfo()
      }
    }
    
    // #ifdef MP-WEIXIN
    // 微信小程序环境下进行微信登录
    try {
      const loginRes = await new Promise<UniApp.LoginRes>((resolve, reject) => {
        uni.login({
          provider: 'weixin',
          success: resolve,
          fail: reject
        })
      })
      
      if (loginRes.code) {
        const res = await wxLoginApi(loginRes.code)
        setLoginInfo(res.token, res.user)
        console.log('静默登录成功')
        return true
      }
    } catch (err) {
      console.log('静默登录失败', err)
    }
    // #endif
    
    return false
  }
  
  /**
   * 初始化用户信息
   */
  function initUserInfo() {
    const storedUser = uni.getStorageSync('userInfo')
    if (storedUser) {
      try {
        userInfo.value = JSON.parse(storedUser)
      } catch (e) {
        console.error('解析用户信息失败', e)
      }
    }
  }
  
  // 初始化
  initUserInfo()
  
  /**
   * 设置Token
   */
  function setToken(newToken: string) {
    token.value = newToken
    uni.setStorageSync('token', newToken)
  }
  
  /**
   * 设置用户信息
   */
  function setUserInfo(user: User | any) {
    userInfo.value = user
    uni.setStorageSync('userInfo', JSON.stringify(user))
  }
  
  /**
   * 退出登录
   */
  function logout() {
    clearLoginInfo()
  }
  
  return {
    token,
    userInfo,
    isLoggedIn,
    setLoginInfo,
    setToken,
    setUserInfo,
    clearLoginInfo,
    logout,
    silentLogin,
    initUserInfo
  }
})
