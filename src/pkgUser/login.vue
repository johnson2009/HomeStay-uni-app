<template>
  <view class="page">
    <image class="bg-image" :src="bgImage" mode="aspectFill"/>
    <view class="content">
      <view class="nav-bar" @tap="goBack" v-if="canGoBack">
        <text class="nav-back">‹</text>
      </view>
      <view class="motto">
        <text class="motto-line1">如同在家</text>
        <text class="motto-line2">一样的温馨</text>
      </view>
      <view class="login-section">
        <!-- #ifdef MP-WEIXIN -->
        <button class="login-btn phone-btn" open-type="getPhoneNumber" @getphonenumber="onGetPhoneNumber" :loading="phoneLoginLoading">
          手机号快捷登录
        </button>
        <!-- #endif -->
        <!-- #ifdef H5 -->
        <button class="login-btn phone-btn" @tap="onQuickLogin" :loading="phoneLoginLoading">
          手机号快捷登录
        </button>
        <!-- #endif -->
        <view class="other-phone" @tap="goOtherPhoneLogin">
          <text>使用其他手机号登录</text>
        </view>
      </view>
      <view class="agreement-section">
        <view class="checkbox-wrap" @tap="toggleAgree">
          <view :class="['checkbox', agreed ? 'checked' : '']">
            <text v-if="agreed" class="checkbox-icon">✓</text>
          </view>
        </view>
        <text class="agreement-text">
          我已阅读并同意
          <text class="link" @tap.stop="showUserAgreement">用户协议</text>
          <text class="comma">、</text>
          <text class="link" @tap.stop="showPrivacyPolicy">隐私条款</text>
        </text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores'
import { authApi } from '@/api'
import { getImageUrl } from '@/utils/config'

const userStore = useUserStore()
const phoneLoginLoading = ref(false)
const redirect = ref('')
const agreed = ref(false)

const bgImage = computed(() => getImageUrl('images/login-bg.png'))

const toggleAgree = () => {
  agreed.value = !agreed.value
}

const onQuickLogin = async () => {
  if (!agreed.value) {
    uni.showToast({ title: '请先阅读并同意用户协议和隐私条款', icon: 'none' })
    return
  }
  if (phoneLoginLoading.value) return
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

const onGetPhoneNumber = async (e: any) => {
  if (e.detail.errMsg !== 'getPhoneNumber:ok') {
    uni.showToast({ title: '取消手机号授权', icon: 'none' })
    return
  }
  if (!agreed.value) {
    uni.showToast({ title: '请先阅读并同意用户协议和隐私条款', icon: 'none' })
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

const goOtherPhoneLogin = () => {
  const q = redirect.value ? `?redirect=${encodeURIComponent(redirect.value)}` : ''
  uni.navigateTo({ url: `/pkgUser/phone-login${q}` })
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
  uni.showModal({ title: '用户协议', content: '欢迎使用民宿预订。使用本服务前，请您仔细阅读并充分理解本协议各条款。', showCancel: false })
}

const showPrivacyPolicy = () => {
  uni.showModal({ title: '隐私条款', content: '我们非常重视您的隐私保护。本隐私条款将向您说明我们如何收集、使用和保护您的个人信息。', showCancel: false })
}

const canGoBack = ref(false)
onLoad((options: any) => {
  redirect.value = options?.redirect || ''
  const pages = getCurrentPages()
  canGoBack.value = pages.length > 1
})

const goBack = () => {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(180deg, #2a3a2e 0%, #1a2520 50%, #0f1412 100%);
}
.bg-image {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}
.content {
  position: relative;
  z-index: 1;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 60rpx 80rpx;
  box-sizing: border-box;
}
.nav-bar {
  position: absolute;
  left: 24rpx;
  top: 80rpx;
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}
.nav-back {
  font-size: 48rpx;
  color: #fff;
  font-weight: 300;
}
.motto {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 120rpx;
  margin-bottom: 200rpx;
}
.motto-line1 {
  font-size: 56rpx;
  font-weight: 500;
  color: #fff;
  letter-spacing: 8rpx;
}
.motto-line2 {
  font-size: 56rpx;
  font-weight: 500;
  color: #fff;
  margin-top: 8rpx;
  letter-spacing: 8rpx;
}
.login-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}
.login-btn {
  width: 100%;
  height: 96rpx;
  border-radius: 48rpx;
  font-size: 32rpx;
  color: #fff;
  background-color: #346034;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}
.login-btn.phone-btn::after { border: none; }
.other-phone {
  margin-top: 48rpx;
}
.other-phone text {
  font-size: 28rpx;
  color: #fff;
}
.agreement-section {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: auto;
  padding-top: 60rpx;
  flex-wrap: wrap;
}
.checkbox-wrap {
  margin-right: 12rpx;
}
.checkbox {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  border: 2rpx solid rgba(255,255,255,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}
.checkbox.checked {
  background-color: #346034;
  border-color: #346034;
}
.checkbox-icon {
  color: #fff;
  font-size: 22rpx;
  font-weight: bold;
}
.agreement-text {
  font-size: 24rpx;
  color: rgba(255,255,255,0.9);
}
.agreement-text .link {
  color: rgba(255,255,255,0.95);
  text-decoration: underline;
}
.agreement-text .comma {
  color: rgba(255,255,255,0.9);
}
</style>
