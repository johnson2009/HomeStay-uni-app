<template>
  <view class="page">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="user-info" v-if="userStore.isLoggedIn">
        <image class="avatar" :src="userStore.userInfo?.avatar || '/static/images/default-avatar.png'" mode="aspectFill"/>
        <view class="user-detail">
          <text class="nickname">{{ userStore.userInfo?.nickname || '民宿用户' }}</text>
          <text class="phone" v-if="userStore.userInfo?.phone">{{ userStore.userInfo.phone }}</text>
        </view>
      </view>
      <view class="login-prompt" v-else @tap="goToLogin">
        <image class="avatar" src="/static/images/default-avatar.png" mode="aspectFill"/>
        <view class="login-text">
          <text class="login-title">点击登录</text>
          <text class="login-hint">登录后享受更多服务</text>
        </view>
      </view>
    </view>

    <!-- 订单菜单 -->
    <view class="section card">
      <view class="section-header" @tap="goToOrders()">
        <text class="section-title">我的订单</text>
        <text class="section-more">全部订单 ></text>
      </view>
      <view class="order-menu">
        <view class="menu-item" @tap="goToOrders('1')">
          <view class="menu-icon">⏳</view>
          <text class="menu-text">待确认</text>
        </view>
        <view class="menu-item" @tap="goToOrders('2')">
          <view class="menu-icon">✓</view>
          <text class="menu-text">已确认</text>
        </view>
        <view class="menu-item" @tap="goToOrders('3')">
          <view class="menu-icon">🏠</view>
          <text class="menu-text">已入住</text>
        </view>
        <view class="menu-item" @tap="goToOrders('4')">
          <view class="menu-icon">✓</view>
          <text class="menu-text">已完成</text>
        </view>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-list card">
      <view class="menu-row" @tap="goToAbout">
        <text class="menu-icon">📖</text>
        <text class="menu-label">关于我们</text>
        <text class="menu-arrow">></text>
      </view>
      <view class="menu-row" @tap="contactService">
        <text class="menu-icon">📞</text>
        <text class="menu-label">联系客服</text>
        <text class="menu-arrow">></text>
      </view>
      <view class="menu-row" @tap="checkUpdate">
        <text class="menu-icon">🔄</text>
        <text class="menu-label">检查更新</text>
        <text class="menu-value">v1.0.0</text>
        <text class="menu-arrow">></text>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout-section" v-if="userStore.isLoggedIn">
      <button class="logout-btn" @tap="logout">退出登录</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores'

// Store
const userStore = useUserStore()

// 跳转到登录页
const goToLogin = () => {
  uni.navigateTo({
    url: '/pkgUser/login'
  })
}

// 跳转到订单列表
const goToOrders = (status?: string) => {
  if (!userStore.isLoggedIn) {
    goToLogin()
    return
  }
  
  uni.switchTab({
    url: '/pages/booking/list'
  })
}

// 关于我们
const goToAbout = () => {
  uni.showModal({
    title: '关于我们',
    content: '民宿预订小程序 v1.0.0\n\n为您提供优质的民宿预订服务',
    showCancel: false
  })
}

// 联系客服
const contactService = () => {
  uni.showModal({
    title: '联系客服',
    content: '客服电话：400-xxx-xxxx\n\n服务时间：9:00-21:00',
    confirmText: '拨打电话',
    success(res) {
      if (res.confirm) {
        uni.makePhoneCall({
          phoneNumber: '400xxxxxxx'
        })
      }
    }
  })
}

// 检查更新
const checkUpdate = () => {
  // #ifdef MP-WEIXIN
  const updateManager = uni.getUpdateManager()
  
  updateManager.onCheckForUpdate((res: any) => {
    if (res.hasUpdate) {
      uni.showToast({
        title: '发现新版本，正在下载...',
        icon: 'none'
      })
    } else {
      uni.showToast({
        title: '已是最新版本',
        icon: 'success'
      })
    }
  })
  
  updateManager.onUpdateReady(() => {
    uni.showModal({
      title: '更新提示',
      content: '新版本已准备好，是否重启应用？',
      success(res) {
        if (res.confirm) {
          updateManager.applyUpdate()
        }
      }
    })
  })
  // #endif
  
  // #ifdef H5
  uni.showToast({
    title: '已是最新版本',
    icon: 'success'
  })
  // #endif
}

// 退出登录
const logout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        uni.showToast({
          title: '已退出登录',
          icon: 'success'
        })
      }
    }
  })
}

// 页面显示时检查登录状态
onShow(() => {
  // 可以在这里刷新用户信息
})

// 页面加载
onMounted(() => {
  // 初始化
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f0fdfa;
}

/* 用户卡片 */
.user-card {
  padding: 60rpx 30rpx;
  background: linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #14b8a6 100%);
}

.user-info,
.login-prompt {
  display: flex;
  align-items: center;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  margin-right: 24rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
}

.user-detail,
.login-text {
  flex: 1;
}

.nickname {
  font-size: 36rpx;
  font-weight: 600;
  color: #fff;
  display: block;
  margin-bottom: 8rpx;
}

.phone {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

.login-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #fff;
  display: block;
  margin-bottom: 8rpx;
}

.login-hint {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

/* 卡片样式 */
.card {
  margin: 20rpx 30rpx;
  padding: 30rpx;
  background-color: #fff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

/* 区块头部 */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.section-more {
  font-size: 26rpx;
  color: #999;
}

/* 订单菜单 */
.order-menu {
  display: flex;
  justify-content: space-around;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx;
  
  .menu-icon {
    font-size: 48rpx;
    margin-bottom: 12rpx;
  }
  
  .menu-text {
    font-size: 24rpx;
    color: #666;
  }
}

/* 功能菜单列表 */
.menu-list {
  padding: 0;
}

.menu-row {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
  
  &:last-child {
    border-bottom: none;
  }
  
  .menu-icon {
    font-size: 40rpx;
    margin-right: 20rpx;
  }
  
  .menu-label {
    flex: 1;
    font-size: 28rpx;
    color: #333;
  }
  
  .menu-value {
    font-size: 26rpx;
    color: #999;
    margin-right: 16rpx;
  }
  
  .menu-arrow {
    font-size: 28rpx;
    color: #ccc;
  }
}

/* 退出登录 */
.logout-section {
  padding: 40rpx 30rpx;
}

.logout-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  font-size: 30rpx;
  color: #ff4d4f;
  background-color: #fff;
  border: 1rpx solid #ff4d4f;
  border-radius: 44rpx;
}
</style>
