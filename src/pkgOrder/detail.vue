<template>
  <view class="page" v-if="booking">
    <!-- 状态卡片 -->
    <view class="status-card" :class="'status-' + getStatusClass(booking.status)">
      <view class="status-icon">
        <text v-if="booking.status === 1">⏳</text>
        <text v-else-if="booking.status === 2">✓</text>
        <text v-else-if="booking.status === 3">🏠</text>
        <text v-else-if="booking.status === 4">✓</text>
        <text v-else-if="booking.status === 5">✗</text>
        <text v-else>📋</text>
      </view>
      <view class="status-text">{{ getStatusText(booking.status) }}</view>
      <view class="status-hint" v-if="booking.status === 1">等待商家确认中</view>
      <view class="status-hint" v-else-if="booking.status === 2">请按时入住</view>
      <view class="status-hint" v-else-if="booking.status === 3">祝您入住愉快</view>
    </view>

    <!-- 门店信息 -->
    <view class="section card">
      <view class="store-row">
        <view class="store-info">
          <text class="store-name">{{ booking.store_name }}</text>
          <text class="room-name">{{ booking.room_type_name }}</text>
        </view>
      </view>
    </view>

    <!-- 入住信息 -->
    <view class="section card">
      <view class="section-title">入住信息</view>
      <view class="info-grid">
        <view class="info-item">
          <text class="info-label">入住日期</text>
          <text class="info-value">{{ booking.check_in_date }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">离店日期</text>
          <text class="info-value">{{ booking.check_out_date }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">入住人</text>
          <text class="info-value">{{ booking.guest_name }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">联系电话</text>
          <text class="info-value">{{ booking.guest_phone }}</text>
        </view>
        <view class="info-item" v-if="booking.guest_count">
          <text class="info-label">入住人数</text>
          <text class="info-value">{{ booking.guest_count }}人</text>
        </view>
        <view class="info-item" v-if="booking.room_number">
          <text class="info-label">房间号</text>
          <text class="info-value highlight">{{ booking.room_number }}</text>
        </view>
      </view>
    </view>

    <!-- 费用明细 -->
    <view class="section card">
      <view class="section-title">费用明细</view>
      <view class="price-item" v-for="item in booking.items" :key="item.id">
        <text class="price-label">{{ item.date }} 房费</text>
        <text class="price-value">¥{{ item.price }}</text>
      </view>
      <view class="price-item" v-if="!booking.items || booking.items.length === 0">
        <text class="price-label">房费 ({{ nights }}晚)</text>
        <text class="price-value">¥{{ booking.total_amount }}</text>
      </view>
      <view class="price-total">
        <text class="total-label">合计</text>
        <view class="total-value">
          <text class="currency">¥</text>
          <text class="amount">{{ booking.total_amount }}</text>
        </view>
      </view>
    </view>

    <!-- 订单信息 -->
    <view class="section card">
      <view class="section-title">订单信息</view>
      <view class="order-info-list">
        <view class="order-info-item">
          <text class="info-label">订单编号</text>
          <text class="info-value" @tap="copyOrderNo">{{ booking.order_no }} <text class="copy-btn">复制</text></text>
        </view>
        <view class="order-info-item">
          <text class="info-label">创建时间</text>
          <text class="info-value">{{ formatDateTime(booking.created_at) }}</text>
        </view>
        <view class="order-info-item" v-if="booking.remark">
          <text class="info-label">备注</text>
          <text class="info-value">{{ booking.remark }}</text>
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar" v-if="booking.status === 1 || booking.status === 2">
      <button class="action-btn cancel-btn" @tap="cancelOrder">取消订单</button>
      <button class="action-btn contact-btn" @tap="contactStore" v-if="booking.store_phone">联系商家</button>
    </view>
  </view>

  <!-- 加载中 -->
  <view class="loading-state" v-else>
    <text>加载中...</text>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { bookingApi } from '@/api'
import { daysBetween, formatDate } from '@/utils/date'
import { getBookingStatusText, getBookingStatusClass } from '@/utils'
import type { Booking } from '@/types'

const bookingId = ref<number>(0)
const booking = ref<Booking | null>(null)
const nights = computed(() => {
  if (!booking.value) return 0
  return daysBetween(booking.value.check_in_date, booking.value.check_out_date)
})
const getStatusText = (status: number) => getBookingStatusText(status)
const getStatusClass = (status: number) => getBookingStatusClass(status)
const formatDateTime = (dateStr: string) => formatDate(dateStr, 'YYYY-MM-DD HH:mm')

const loadBookingDetail = async () => {
  uni.showLoading({ title: '加载中...' })
  try {
    const data = await bookingApi.getBookingDetail(bookingId.value)
    booking.value = data
  } catch (err) {
    console.error('加载订单详情失败', err)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

const copyOrderNo = () => {
  if (!booking.value) return
  uni.setClipboardData({ data: booking.value.order_no, success() { uni.showToast({ title: '已复制', icon: 'success' }) } })
}

const cancelOrder = () => {
  uni.showModal({
    title: '提示',
    content: '确定要取消此订单吗？',
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '取消中...' })
        try {
          await bookingApi.cancelBooking(bookingId.value, '用户主动取消')
          uni.showToast({ title: '取消成功', icon: 'success' })
          loadBookingDetail()
        } catch (err) { console.error('取消订单失败', err) }
        finally { uni.hideLoading() }
      }
    }
  })
}

const contactStore = () => {
  if (!booking.value?.store_phone) { uni.showToast({ title: '暂无联系方式', icon: 'none' }); return }
  uni.makePhoneCall({ phoneNumber: booking.value.store_phone })
}

onLoad((options: any) => {
  bookingId.value = parseInt(options?.id || '0')
  loadBookingDetail()
})
</script>

<style lang="scss" scoped>
.page { padding-bottom: 180rpx; background-color: #f0fdfa; }
.status-card { display: flex; flex-direction: column; align-items: center; padding: 60rpx 30rpx; background: linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #14b8a6 100%); color: #fff; }
.status-card.status-warning { background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%); }
.status-card.status-success { background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); }
.status-card.status-danger { background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); }
.status-icon { font-size: 80rpx; margin-bottom: 20rpx; }
.status-text { font-size: 36rpx; font-weight: 600; margin-bottom: 12rpx; }
.status-hint { font-size: 26rpx; opacity: 0.8; }
.card { margin: 20rpx 30rpx; padding: 30rpx; background-color: #fff; border-radius: 24rpx; box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06); }
.section-title { font-size: 30rpx; font-weight: 600; color: #333; margin-bottom: 24rpx; }
.store-row { display: flex; align-items: center; }
.store-info { flex: 1; }
.store-name { font-size: 32rpx; font-weight: 600; color: #333; display: block; margin-bottom: 8rpx; }
.room-name { font-size: 26rpx; color: #666; }
.info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24rpx; }
.info-item .info-label { font-size: 24rpx; color: #999; margin-bottom: 8rpx; }
.info-item .info-value { font-size: 28rpx; color: #333; }
.info-item .info-value.highlight { color: #0d9488; font-weight: 600; }
.price-item { display: flex; justify-content: space-between; padding: 16rpx 0; }
.price-item .price-label { font-size: 26rpx; color: #666; }
.price-item .price-value { font-size: 26rpx; color: #333; }
.price-total { display: flex; justify-content: space-between; align-items: center; padding-top: 20rpx; margin-top: 16rpx; border-top: 1rpx solid #f5f5f5; }
.price-total .total-label { font-size: 28rpx; color: #333; font-weight: 600; }
.price-total .total-value { display: flex; align-items: baseline; }
.price-total .currency { font-size: 28rpx; color: #0d9488; }
.price-total .amount { font-size: 40rpx; font-weight: 600; color: #0d9488; }
.order-info-list { display: flex; flex-direction: column; gap: 20rpx; }
.order-info-item .info-label { width: 160rpx; font-size: 26rpx; color: #999; flex-shrink: 0; }
.order-info-item .info-value { flex: 1; font-size: 26rpx; color: #333; }
.order-info-item .copy-btn { font-size: 24rpx; color: #0d9488; margin-left: 16rpx; }
.bottom-bar { position: fixed; bottom: 0; left: 0; right: 0; display: flex; gap: 20rpx; padding: 20rpx 30rpx; padding-bottom: calc(20rpx + env(safe-area-inset-bottom)); background-color: #fff; box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05); }
.action-btn { flex: 1; height: 88rpx; line-height: 88rpx; font-size: 30rpx; border-radius: 44rpx; border: none; }
.action-btn.cancel-btn { background-color: #fff; color: #666; border: 1rpx solid #ddd; }
.action-btn.contact-btn { background-color: #0d9488; color: #fff; }
.loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; }
.loading-state text { color: #999; font-size: 28rpx; }
</style>
