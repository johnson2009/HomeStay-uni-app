<template>
  <view class="page">
    <view class="logo-section">
      <image class="logo" src="/static/images/logo.png" mode="aspectFit"/>
      <text class="app-name">民宿预订</text>
      <text class="app-slogan">发现美好住处</text>
    </view>
    <view class="login-section">
      <button class="login-btn wechat-btn" @tap="wxLogin" :loading="wxLoginLoading">
        <text class="btn-icon">💬</text>
        <text>微信一键登录</text>
      </button>
      <!-- #ifdef MP-WEIXIN -->
      <button class="login-btn phone-btn" open-type="getPhoneNumber" @getphonenumber="onGetPhoneNumber" :loading="phoneLoginLoading">
        <text class="btn-icon">📱</text>
        <text>手机号快捷登录</text>
      </button>
      <!-- #endif -->
      <!-- #ifdef H5 -->
      <button class="login-btn phone-btn" @tap="h5MockLogin" :loading="phoneLoginLoading">
        <text class="btn-icon">📱</text>
        <text>快捷登录</text>
      </button>
      <!-- #endif -->
    </view>
    <view class="tips-section">
      <text class="tips-text">登录即表示您同意</text>
      <text class="tips-link" @tap="showUserAgreement">《用户协议》</text>
      <text class="tips-text">和</text>
      <text class="tips-link" @tap="showPrivacyPolicy">《隐私政策》</text>
    </view>
    <view class="skip-section" @tap="skipLogin">
      <text>暂不登录，先看看</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores'
import { authApi } from '@/api'

const userStore = useUserStore()
const wxLoginLoading = ref(false)
const phoneLoginLoading = ref(false)
const redirect = ref('')

const wxLogin = async () => {
  if (wxLoginLoading.value) return
  wxLoginLoading.value = true
  try {
    // #ifdef MP-WEIXIN
    const loginRes = await new Promise<UniApp.LoginRes>((resolve, reject) => {
      uni.login({ provider: 'weixin', success: resolve, fail: reject })
    })
    const result = await authApi.wxLogin(loginRes.code)
    userStore.setToken(result.access_token)
    userStore.setUserInfo(result.user)
    // #endif
    // #ifdef H5
    await h5MockLogin()
    return
    // #endif
    uni.showToast({ title: '登录成功', icon: 'success' })
    handleLoginSuccess()
  } catch (err: any) {
    console.error('微信登录失败', err)
    uni.showToast({ title: err.message || '登录失败，请重试', icon: 'none' })
  } finally {
    wxLoginLoading.value = false
  }
}

const onGetPhoneNumber = async (e: any) => {
  if (e.detail.errMsg !== 'getPhoneNumber:ok') {
    uni.showToast({ title: '取消手机号授权', icon: 'none' })
    return
  }
  if (phoneLoginLoading.value) return
  phoneLoginLoading.value = true
  try {
    const result = await authApi.wxPhoneLogin(e.detail.code)
    userStore.setToken(result.access_token)
    userStore.setUserInfo(result.user)
    uni.showToast({ title: '登录成功', icon: 'success' })
    handleLoginSuccess()
  } catch (err: any) {
    console.error('手机号登录失败', err)
    uni.showToast({ title: err.message || '登录失败，请重试', icon: 'none' })
  } finally {
    phoneLoginLoading.value = false
  }
}

const h5MockLogin = async () => {
  phoneLoginLoading.value = true
  try {
    const result = await authApi.devLogin('13800138000', '测试用户')
    userStore.setToken(result.access_token)
    if (result.user) {
      userStore.setUserInfo(result.user)
    } else {
      userStore.setUserInfo({ id: result.user_id, nickname: '测试用户', phone: '13800138000' })
    }
    uni.showToast({ title: '登录成功', icon: 'success' })
    handleLoginSuccess()
  } catch (err: any) {
    console.error('登录失败', err)
    uni.showToast({ title: err.message || '登录失败，请重试', icon: 'none' })
  } finally {
    phoneLoginLoading.value = false
  }
}

const handleLoginSuccess = () => {
  setTimeout(() => {
    if (redirect.value === 'booking') {
      uni.navigateBack()
    } else if (redirect.value === 'orders') {
      uni.switchTab({ url: '/pages/booking/list' })
    } else {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        uni.navigateBack()
      } else {
        uni.switchTab({ url: '/pages/index/index' })
      }
    }
  }, 1500)
}

const showUserAgreement = () => {
  uni.showModal({ title: '用户协议', content: '欢迎使用民宿预订小程序。使用本服务前，请您仔细阅读并充分理解本协议各条款。', showCancel: false })
}

const showPrivacyPolicy = () => {
  uni.showModal({ title: '隐私政策', content: '我们非常重视您的隐私保护。本隐私政策将向您说明我们如何收集、使用和保护您的个人信息。', showCancel: false })
}

const skipLogin = () => {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
  } else {
    uni.switchTab({ url: '/pages/index/index' })
  }
}

onLoad((options: any) => {
  redirect.value = options?.redirect || ''
})
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: 0 60rpx; background: linear-gradient(180deg, #f0fdfa 0%, #fff 30%); }
.logo-section { display: flex; flex-direction: column; align-items: center; margin-top: 160rpx; margin-bottom: 80rpx; }
.logo { width: 180rpx; height: 180rpx; margin-bottom: 30rpx; }
.app-name { font-size: 48rpx; font-weight: 600; color: #333; margin-bottom: 16rpx; }
.app-slogan { font-size: 28rpx; color: #999; }
.login-section { width: 100%; display: flex; flex-direction: column; gap: 30rpx; margin-bottom: 60rpx; }
.login-btn { display: flex; align-items: center; justify-content: center; height: 96rpx; border-radius: 48rpx; font-size: 32rpx; border: none; }
.login-btn .btn-icon { font-size: 40rpx; margin-right: 16rpx; }
.login-btn.wechat-btn { background-color: #0d9488; color: #fff; }
.login-btn.phone-btn { background-color: #f0fdfa; color: #333; border: 1rpx solid #ccfbf1; }
.tips-section { display: flex; flex-wrap: wrap; justify-content: center; margin-bottom: 40rpx; }
.tips-text { font-size: 24rpx; color: #999; }
.tips-link { font-size: 24rpx; color: #0d9488; }
.skip-section { padding: 20rpx 40rpx; }
.skip-section text { font-size: 28rpx; color: #999; }
</style>
