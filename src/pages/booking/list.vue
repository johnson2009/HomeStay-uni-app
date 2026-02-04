<template>
  <view class="page">
    <!-- 状态标签栏 -->
    <view class="tab-bar">
      <view 
        class="tab-item" 
        :class="{ active: currentTab === '' }"
        @tap="switchTab('')"
      >全部</view>
      <view 
        class="tab-item" 
        :class="{ active: currentTab === '1' }"
        @tap="switchTab('1')"
      >待确认</view>
      <view 
        class="tab-item" 
        :class="{ active: currentTab === '2' }"
        @tap="switchTab('2')"
      >已确认</view>
      <view 
        class="tab-item" 
        :class="{ active: currentTab === '3' }"
        @tap="switchTab('3')"
      >已入住</view>
      <view 
        class="tab-item" 
        :class="{ active: currentTab === '4' }"
        @tap="switchTab('4')"
      >已完成</view>
    </view>

    <!-- 订单列表 -->
    <scroll-view 
      class="order-scroll" 
      scroll-y
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="onLoadMore"
    >
      <view class="order-list" v-if="orders.length > 0">
        <view 
          class="order-card card" 
          v-for="item in orders" 
          :key="item.id"
          @tap="goToDetail(item.id)"
        >
          <view class="order-header">
            <text class="order-no">订单号：{{ item.order_no }}</text>
            <text class="order-status" :class="'tag-' + getStatusClass(item.status)">{{ getStatusText(item.status) }}</text>
          </view>
          
          <view class="order-content">
            <view class="order-info">
              <text class="store-name">{{ item.store_name || '民宿' }}</text>
              <text class="room-name">{{ item.room_type_name || '房型' }}</text>
            </view>
            <view class="order-dates">
              <text>{{ item.check_in_date }} - {{ item.check_out_date }}</text>
              <text class="nights">{{ getNights(item) }}晚</text>
            </view>
          </view>
          
          <view class="order-footer">
            <view class="order-price">
              <text class="label">实付</text>
              <text class="currency">¥</text>
              <text class="amount">{{ item.total_amount }}</text>
            </view>
            <view class="order-actions">
              <button 
                class="action-btn cancel-btn" 
                v-if="item.status === 1 || item.status === 2"
                @tap.stop="cancelOrder(item.id)"
              >取消订单</button>
              <button 
                class="action-btn detail-btn"
                @tap.stop="goToDetail(item.id)"
              >查看详情</button>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-else-if="!loading">
        <image src="/static/images/empty-order.png" mode="aspectFit"/>
        <text>暂无订单记录</text>
        <button class="go-book-btn" @tap="goToIndex">去预订</button>
      </view>

      <!-- 加载更多 -->
      <view class="load-more" v-if="orders.length > 0">
        <text v-if="loading">加载中...</text>
        <text v-else-if="!hasMore">没有更多了</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores'
import { bookingApi } from '@/api'
import { daysBetween } from '@/utils/date'
import { getBookingStatusText, getBookingStatusClass } from '@/utils'
import type { Booking } from '@/types'

// Store
const userStore = useUserStore()

// 订单列表
const orders = ref<Booking[]>([])
const currentTab = ref('')
const page = ref(1)
const pageSize = 10
const hasMore = ref(true)
const loading = ref(false)
const refreshing = ref(false)

// 获取状态文本
const getStatusText = (status: number) => getBookingStatusText(status)
const getStatusClass = (status: number) => getBookingStatusClass(status)

// 计算入住晚数
const getNights = (order: Booking) => {
  return daysBetween(order.check_in_date, order.check_out_date)
}

// 检查登录并加载
const checkLoginAndLoad = () => {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({
      url: '/pages/user/login?redirect=orders'
    })
    return
  }
  loadOrders()
}

// 加载订单
const loadOrders = async (append = false) => {
  if (loading.value) return
  
  loading.value = true
  
  try {
    const params: any = {
      page: page.value,
      page_size: pageSize
    }
    
    if (currentTab.value) {
      params.status = parseInt(currentTab.value)
    }
    
    const result = await bookingApi.getMyBookings(params)
    
    const newOrders = result.items || []
    
    if (append) {
      orders.value = [...orders.value, ...newOrders]
    } else {
      orders.value = newOrders
    }
    
    hasMore.value = result.page < result.pages
  } catch (err) {
    console.error('加载订单失败', err)
  } finally {
    loading.value = false
  }
}

// 刷新订单
const refreshOrders = async () => {
  page.value = 1
  hasMore.value = true
  await loadOrders(false)
}

// 下拉刷新
const onRefresh = async () => {
  refreshing.value = true
  await refreshOrders()
  refreshing.value = false
}

// 加载更多
const onLoadMore = async () => {
  if (!hasMore.value || loading.value) return
  
  page.value++
  await loadOrders(true)
}

// 切换标签
const switchTab = (tab: string) => {
  if (tab === currentTab.value) return
  
  currentTab.value = tab
  page.value = 1
  orders.value = []
  hasMore.value = true
  loadOrders()
}

// 取消订单
const cancelOrder = (id: number) => {
  uni.showModal({
    title: '提示',
    content: '确定要取消此订单吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await bookingApi.cancelBooking(id, '用户主动取消')
          uni.showToast({
            title: '取消成功',
            icon: 'success'
          })
          refreshOrders()
        } catch (err) {
          console.error('取消订单失败', err)
        }
      }
    }
  })
}

// 跳转到详情
const goToDetail = (id: number) => {
  uni.navigateTo({
    url: `/pages/booking/detail?id=${id}`
  })
}

// 跳转到首页
const goToIndex = () => {
  uni.switchTab({
    url: '/pages/index/index'
  })
}

// 页面显示时刷新
onShow(() => {
  if (userStore.isLoggedIn && orders.value.length > 0) {
    refreshOrders()
  }
})

// 页面加载
onMounted(() => {
  checkLoginAndLoad()
})

// 下拉刷新
onPullDownRefresh(async () => {
  await refreshOrders()
  uni.stopPullDownRefresh()
})
</script>

<style lang="scss" scoped>
.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

/* 标签栏 */
.tab-bar {
  display: flex;
  background-color: #fff;
  padding: 0 20rpx;
  border-bottom: 1rpx solid #eee;
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30rpx 0;
  font-size: 26rpx;
  color: #666;
  position: relative;
  
  &.active {
    color: #4A90D9;
    font-weight: 600;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 40rpx;
      height: 4rpx;
      background-color: #4A90D9;
      border-radius: 2rpx;
    }
  }
}

/* 订单列表 */
.order-scroll {
  flex: 1;
  padding: 20rpx 30rpx;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.card {
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.order-card {
  padding: 0;
}

.order-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.order-no {
  font-size: 24rpx;
  color: #999;
}

.order-status {
  font-size: 24rpx;
  padding: 4rpx 16rpx;
  border-radius: 4rpx;
  
  &.tag-warning {
    background-color: rgba(250, 173, 20, 0.1);
    color: #faad14;
  }
  
  &.tag-success {
    background-color: rgba(82, 196, 26, 0.1);
    color: #52c41a;
  }
  
  &.tag-primary {
    background-color: rgba(74, 144, 217, 0.1);
    color: #4A90D9;
  }
  
  &.tag-default {
    background-color: #f5f5f5;
    color: #999;
  }
  
  &.tag-danger {
    background-color: rgba(255, 77, 79, 0.1);
    color: #ff4d4f;
  }
}

.order-content {
  padding: 24rpx 30rpx;
}

.order-info {
  margin-bottom: 16rpx;
}

.store-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.room-name {
  font-size: 26rpx;
  color: #666;
}

.order-dates {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #999;
  
  .nights {
    margin-left: 16rpx;
    color: #4A90D9;
  }
}

.order-footer {
  display: flex;
  align-items: center;
  padding: 24rpx 30rpx;
  border-top: 1rpx solid #f5f5f5;
}

.order-price {
  flex: 1;
  
  .label {
    font-size: 24rpx;
    color: #999;
    margin-right: 8rpx;
  }
  
  .currency {
    font-size: 24rpx;
    color: #ff4d4f;
  }
  
  .amount {
    font-size: 36rpx;
    font-weight: 600;
    color: #ff4d4f;
  }
}

.order-actions {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  padding: 12rpx 24rpx;
  font-size: 24rpx;
  border-radius: 30rpx;
  border: none;
  line-height: 1.5;
  
  &.cancel-btn {
    background-color: #fff;
    color: #666;
    border: 1rpx solid #ddd;
  }
  
  &.detail-btn {
    background-color: #4A90D9;
    color: #fff;
  }
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  
  image {
    width: 240rpx;
    height: 240rpx;
    margin-bottom: 30rpx;
  }
  
  text {
    color: #999;
    font-size: 28rpx;
    margin-bottom: 40rpx;
  }
}

.go-book-btn {
  padding: 20rpx 60rpx;
  font-size: 28rpx;
  color: #fff;
  background-color: #4A90D9;
  border-radius: 40rpx;
  border: none;
}

/* 加载更多 */
.load-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30rpx;
  
  text {
    font-size: 24rpx;
    color: #999;
  }
}
</style>
