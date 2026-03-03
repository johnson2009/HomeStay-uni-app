<template>
  <view class="page">
    <image class="bg-image" :src="bgImage" mode="aspectFill"/>
    <view class="content">
      <view class="motto">
        <text class="motto-line1">不期而遇</text>
        <text class="motto-line2">的温暖</text>
      </view>
      <view class="form-section">
        <view class="input-row">
          <text class="label">手机号</text>
          <input
            class="input"
            v-model="phone"
            type="number"
            maxlength="11"
            placeholder="输入手机号"
            placeholder-class="placeholder"
          />
        </view>
        <view class="input-row">
          <text class="label">验证码</text>
          <input
            class="input input-code"
            v-model="code"
            type="number"
            maxlength="6"
            placeholder="6位验证码"
            placeholder-class="placeholder"
          />
          <text
            :class="['get-code', countdown > 0 ? 'disabled' : '']"
            @tap="getCode"
          >
            {{ countdown > 0 ? `${countdown}s后重试` : '获取验证码' }}
          </text>
        </view>
      </view>
      <view class="agreement-section">
        <view class="checkbox-wrap" @tap="toggleAgree">
          <view :class="['checkbox', agreed ? 'checked' : '']">
            <text v-if="agreed" class="checkbox-icon">✓</text>
          </view>
        </view>
        <text class="agreement-text">
          请阅读并同意
          <text class="link" @tap.stop="showUserAgreement">用户协议</text>
          <text class="and">和</text>
          <text class="link" @tap.stop="showPrivacyPolicy">隐私条款</text>
        </text>
      </view>
      <button class="login-btn" @tap="submitLogin" :loading="loginLoading">
        登录
      </button>
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
const phone = ref('')
const code = ref('')
const agreed = ref(false)
const loginLoading = ref(false)
const countdown = ref(0)
const redirect = ref('')

const bgImage = computed(() => getImageUrl('images/login-bg.png'))

const toggleAgree = () => {
  agreed.value = !agreed.value
}

const getCode = () => {
  if (countdown.value > 0) return
  const p = phone.value.trim()
  if (!p) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return
  }
  if (!/^1\d{10}$/.test(p)) {
    uni.showToast({ title: '请输入正确手机号', icon: 'none' })
    return
  }
  // TODO: 调用后端发送验证码接口
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) clearInterval(timer)
  }, 1000)
  uni.showToast({ title: '验证码已发送', icon: 'success' })
}

const submitLogin = async () => {
  if (!agreed.value) {
    uni.showToast({ title: '请先阅读并同意用户协议和隐私条款', icon: 'none' })
    return
  }
  const p = phone.value.trim()
  if (!p) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return
  }
  if (!/^1\d{10}$/.test(p)) {
    uni.showToast({ title: '请输入正确手机号', icon: 'none' })
    return
  }
  if (!code.value.trim()) {
    uni.showToast({ title: '请输入验证码', icon: 'none' })
    return
  }
  if (loginLoading.value) return
  loginLoading.value = true
  try {
    // H5 开发环境可用 devLogin；正式环境需对接手机号+验证码登录接口
    const result = await authApi.devLogin(p, `用户${p.slice(-4)}`)
    userStore.setToken(result.access_token)
    if (result.user) {
      userStore.setUserInfo(result.user)
    } else {
      userStore.setUserInfo({ id: result.user_id, nickname: `用户${p.slice(-4)}`, phone: p })
    }
    uni.showToast({ title: '登录成功', icon: 'success' })
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
  } catch (err: any) {
    console.error('登录失败', err)
    uni.showToast({ title: err.message || '登录失败，请重试', icon: 'none' })
  } finally {
    loginLoading.value = false
  }
}

const showUserAgreement = () => {
  uni.showModal({ title: '用户协议', content: '欢迎使用民宿预订。使用本服务前，请您仔细阅读并充分理解本协议各条款。', showCancel: false })
}

const showPrivacyPolicy = () => {
  uni.showModal({ title: '隐私条款', content: '我们非常重视您的隐私保护。本隐私条款将向您说明我们如何收集、使用和保护您的个人信息。', showCancel: false })
}

onLoad((options: any) => {
  redirect.value = options?.redirect || ''
})
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
.motto {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 80rpx;
  margin-bottom: 120rpx;
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
.form-section {
  width: 100%;
  margin-bottom: 48rpx;
}
.input-row {
  display: flex;
  align-items: center;
  height: 100rpx;
  padding: 0 28rpx;
  margin-bottom: 24rpx;
  background: rgba(0,0,0,0.25);
  border-radius: 16rpx;
  box-sizing: border-box;
}
.input-row .label {
  width: 120rpx;
  font-size: 28rpx;
  color: #fff;
  flex-shrink: 0;
}
.input {
  flex: 1;
  font-size: 28rpx;
  color: #fff;
  height: 100%;
}
.input-code {
  flex: 1;
  min-width: 0;
}
.placeholder {
  color: rgba(255,255,255,0.5);
}
.get-code {
  font-size: 26rpx;
  color: #fff;
  margin-left: 20rpx;
  flex-shrink: 0;
}
.get-code.disabled {
  color: rgba(255,255,255,0.5);
}
.agreement-section {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 60rpx;
  flex-wrap: wrap;
}
.checkbox-wrap {
  margin-right: 12rpx;
}
.checkbox {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  border: 2rpx solid rgba(255,255,255,0.5);
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
.agreement-text .and {
  color: rgba(255,255,255,0.9);
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
.login-btn::after {
  border: none;
}
</style>
