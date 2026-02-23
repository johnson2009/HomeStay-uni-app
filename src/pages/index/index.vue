<template>
  <view class="page">
    <!-- 搜索栏 -->
    <view class="search-bar" @tap="goToStoreList">
      <view class="search-input">
        <text class="icon-search">🔍</text>
        <text class="placeholder">搜索民宿、城市</text>
      </view>
    </view>

    <!-- 轮播图 -->
    <view class="banner">
      <swiper 
        indicator-dots
        autoplay
        :interval="4000"
        :duration="500"
        circular
      >
        <swiper-item v-for="(item, index) in banners" :key="index">
          <image :src="item.image" mode="aspectFill" class="banner-image" />
        </swiper-item>
      </swiper>
    </view>

    <!-- 日期选择 -->
    <view class="date-picker-card card">
      <view class="date-row">
        <view class="date-item" @tap="selectDate('checkIn')">
          <text class="date-label">入住</text>
          <text class="date-value">{{ bookingStore.checkInDate }}</text>
          <text class="date-week">{{ bookingStore.checkInWeek }}</text>
        </view>
        <view class="date-divider">
          <text class="nights">{{ bookingStore.nights }}晚</text>
        </view>
        <view class="date-item" @tap="selectDate('checkOut')">
          <text class="date-label">离店</text>
          <text class="date-value">{{ bookingStore.checkOutDate }}</text>
          <text class="date-week">{{ bookingStore.checkOutWeek }}</text>
        </view>
      </view>
    </view>

    <!-- 热门民宿 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">热门民宿</text>
        <text class="section-more" @tap="goToStoreList">查看全部 ></text>
      </view>
      
      <view class="store-list" v-if="storeStore.stores.length > 0">
        <view 
          class="store-card card" 
          v-for="item in storeStore.stores" 
          :key="item.id"
          @tap="goToStoreDetail(item.id)"
        >
          <image 
            class="store-cover" 
            :src="item.cover_image || '/static/images/default-store.png'" 
            mode="aspectFill"
          />
          <view class="store-info">
            <text class="store-name">{{ item.name }}</text>
            <view class="store-location">
              <text class="icon">📍</text>
              <text>{{ item.city }} · {{ item.address || '暂无地址' }}</text>
            </view>
            <view class="store-tags">
              <text class="tag tag-primary" v-if="item.is_active">营业中</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view class="empty-state" v-else-if="!storeStore.loading">
        <text>暂无民宿信息</text>
      </view>
      
      <!-- 加载中 -->
      <view class="loading" v-if="storeStore.loading">
        <text>加载中...</text>
      </view>
    </view>

    <!-- 日期选择弹窗 -->
    <view class="date-popup" :class="{ show: showDatePicker }" @touchmove.stop.prevent>
      <view class="popup-mask" @tap="closeDatePicker"></view>
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">选择{{ dateType === 'checkIn' ? '入住' : '离店' }}日期</text>
          <text class="popup-close" @tap="closeDatePicker">×</text>
        </view>
        <picker-view 
          :value="datePickerValue" 
          indicator-style="height: 40px;" 
          class="picker-view"
          @change="onDateChange"
        >
          <picker-view-column>
            <view v-for="year in years" :key="year" class="picker-item">
              {{ year }}年
            </view>
          </picker-view-column>
          <picker-view-column>
            <view v-for="month in months" :key="month" class="picker-item">
              {{ month }}月
            </view>
          </picker-view-column>
          <picker-view-column>
            <view v-for="day in days" :key="day" class="picker-item">
              {{ day }}日
            </view>
          </picker-view-column>
        </picker-view>
        <view class="popup-footer">
          <button class="btn btn-primary" @tap="confirmDate">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onPullDownRefresh } from '@dcloudio/uni-app'
import { useBookingStore, useStoreStore } from '@/stores'
import { generateYears, generateMonths, generateDays, getToday, parseDateString } from '@/utils/date'
import type { Banner, DateType } from '@/types'

// Store
const bookingStore = useBookingStore()
const storeStore = useStoreStore()

// 轮播图数据
const banners = ref<Banner[]>([
  { image: '/static/images/banner1.png' },
  { image: '/static/images/banner2.png' }
])

// 日期选择器状态
const showDatePicker = ref(false)
const dateType = ref<DateType>('checkIn')
const datePickerValue = ref([0, 0, 0])

// 日期选择器数据
const years = ref<number[]>(generateYears())
const months = ref<number[]>(generateMonths())
const days = ref<number[]>([])

// 初始化日期选择器天数
const updateDays = (year: number, month: number) => {
  days.value = generateDays(year, month)
}

// 选择日期
const selectDate = (type: DateType) => {
  dateType.value = type
  const dateStr = type === 'checkIn' ? bookingStore.checkInDate : bookingStore.checkOutDate
  const { year, month, day } = parseDateString(dateStr)
  
  const yearIndex = years.value.indexOf(year)
  const monthIndex = month - 1
  const dayIndex = day - 1
  
  updateDays(year, month)
  
  datePickerValue.value = [
    yearIndex >= 0 ? yearIndex : 0,
    monthIndex,
    dayIndex
  ]
  
  showDatePicker.value = true
}

// 日期变化
const onDateChange = (e: any) => {
  const val = e.detail.value as number[]
  const year = years.value[val[0]]
  const month = val[1] + 1
  
  updateDays(year, month)
  datePickerValue.value = val
}

// 确认日期
const confirmDate = () => {
  const val = datePickerValue.value
  const year = years.value[val[0]]
  const month = String(val[1] + 1).padStart(2, '0')
  const day = String(days.value[val[2]]).padStart(2, '0')
  const dateStr = `${year}-${month}-${day}`
  
  const today = getToday()
  if (dateStr < today) {
    uni.showToast({ title: '不能选择过去的日期', icon: 'none' })
    return
  }
  
  if (dateType.value === 'checkIn') {
    bookingStore.setCheckInDate(dateStr)
  } else {
    const success = bookingStore.setCheckOutDate(dateStr)
    if (!success) return
  }
  
  closeDatePicker()
}

// 关闭日期选择器
const closeDatePicker = () => {
  showDatePicker.value = false
}

// 跳转到门店列表
const goToStoreList = () => {
  uni.navigateTo({
    url: `/pages/store/list?checkIn=${bookingStore.checkInDate}&checkOut=${bookingStore.checkOutDate}`
  })
}

// 跳转到门店详情
const goToStoreDetail = (id: number) => {
  uni.navigateTo({
    url: `/pages/store/detail?id=${id}&checkIn=${bookingStore.checkInDate}&checkOut=${bookingStore.checkOutDate}`
  })
}

// 加载数据
const loadData = async () => {
  await storeStore.loadStores()
}

// 下拉刷新
onPullDownRefresh(async () => {
  await loadData()
  uni.stopPullDownRefresh()
})

// 初始化
onMounted(() => {
  // 初始化日期选择器天数
  const currentDate = new Date()
  updateDays(currentDate.getFullYear(), currentDate.getMonth() + 1)
  
  // 加载门店列表
  loadData()
})
</script>

<style lang="scss" scoped>
.page {
  padding-bottom: 120rpx;
}

/* 搜索栏 - 浅青绿渐变顶栏 */
.search-bar {
  padding: 20rpx 30rpx;
  background: linear-gradient(135deg, #ccfbf1 0%, #99f6e4 40%, #f0fdfa 100%);
}

.search-input {
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 40rpx;
  padding: 20rpx 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(13, 148, 136, 0.06);
}

.icon-search {
  margin-right: 16rpx;
  font-size: 32rpx;
}

.placeholder {
  color: #999;
  font-size: 28rpx;
}

/* 轮播图 */
.banner {
  height: 320rpx;
  
  swiper {
    height: 100%;
  }
}

.banner-image {
  width: 100%;
  height: 100%;
}

/* 日期选择卡片 - 白底圆角阴影 */
.date-picker-card {
  margin: -40rpx 30rpx 30rpx;
  position: relative;
  z-index: 10;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
  border-radius: 24rpx;
}

.date-row {
  display: flex;
  align-items: center;
}

.date-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10rpx 0;
}

.date-label {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.date-value {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.date-week {
  font-size: 22rpx;
  color: #666;
  margin-top: 4rpx;
}

.date-divider {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 30rpx;
}

.nights {
  font-size: 26rpx;
  color: #0d9488;
  background-color: rgba(13, 148, 136, 0.12);
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
}

/* 区块 */
.section {
  padding: 0 30rpx;
  margin-bottom: 30rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
}

.section-more {
  font-size: 26rpx;
  color: #999;
}

/* 门店卡片 */
.store-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.store-card {
  display: flex;
  padding: 0;
  overflow: hidden;
}

.store-cover {
  width: 240rpx;
  height: 180rpx;
  flex-shrink: 0;
  border-radius: 16rpx 0 0 16rpx;
}

.store-info {
  flex: 1;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
}

.store-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 12rpx;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.store-location {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #999;
  margin-bottom: 12rpx;
  
  .icon {
    margin-right: 8rpx;
  }
}

.store-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: auto;
}

/* 日期选择弹窗 */
.date-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  visibility: hidden;
  opacity: 0;
  transition: all 0.3s;
  
  &.show {
    visibility: visible;
    opacity: 1;
    
    .popup-content {
      transform: translateY(0);
    }
  }
}

.popup-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
}

.popup-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  border-radius: 30rpx 30rpx 0 0;
  transform: translateY(100%);
  transition: transform 0.3s;
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
}

.popup-title {
  font-size: 32rpx;
  font-weight: 600;
}

.popup-close {
  font-size: 50rpx;
  color: #999;
  line-height: 1;
}

.picker-view {
  width: 100%;
  height: 400rpx;
}

.picker-item {
  line-height: 40px;
  text-align: center;
}

.popup-footer {
  padding: 30rpx;
  padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
  
  .btn {
    width: 100%;
  }
}

/* 加载状态 */
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  
  text {
    color: #999;
    font-size: 26rpx;
  }
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  
  text {
    color: #999;
    font-size: 28rpx;
  }
}
</style>
