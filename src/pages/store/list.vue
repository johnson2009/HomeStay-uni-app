<template>
  <view class="page">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input-wrap">
        <text class="icon-search">🔍</text>
        <input 
          class="search-input" 
          placeholder="搜索民宿名称" 
          v-model="keyword"
          @input="onSearchInput"
          @confirm="onSearch"
        />
        <text class="icon-clear" v-if="keyword" @tap="clearSearch">×</text>
      </view>
    </view>

    <!-- 筛选栏 -->
    <view class="filter-bar">
      <view class="filter-item" @tap="showCityPicker">
        <text>{{ selectedCity || '全部城市' }}</text>
        <text class="arrow">▼</text>
      </view>
      <view class="filter-item active">
        <text>{{ checkInDate }} - {{ checkOutDate }}</text>
      </view>
    </view>

    <!-- 门店列表 -->
    <scroll-view 
      class="store-scroll" 
      scroll-y 
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view class="store-list" v-if="filteredStores.length > 0">
        <view 
          class="store-card" 
          v-for="item in filteredStores" 
          :key="item.id"
          @tap="goToDetail(item.id)"
        >
          <image 
            class="store-cover" 
            :src="item.cover_image || '/static/images/default-store.png'" 
            mode="aspectFill"
          />
          <view class="store-content">
            <view class="store-name">{{ item.name }}</view>
            <view class="store-location">
              <text class="icon">📍</text>
              <text>{{ item.city || '未知城市' }} · {{ item.address || '暂无详细地址' }}</text>
            </view>
            <view class="store-bottom">
              <view class="store-tags">
                <text class="tag tag-success" v-if="item.is_active">营业中</text>
                <text class="tag tag-danger" v-else>暂停营业</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-else-if="!loading">
        <text>暂无符合条件的民宿</text>
      </view>

      <!-- 加载中 -->
      <view class="loading" v-if="loading">
        <text>加载中...</text>
      </view>
    </scroll-view>

    <!-- 城市选择弹窗 -->
    <view class="city-popup" :class="{ show: showCityPopup }" @touchmove.stop.prevent>
      <view class="popup-mask" @tap="closeCityPicker"></view>
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">选择城市</text>
          <text class="popup-close" @tap="closeCityPicker">×</text>
        </view>
        <view class="city-list">
          <view 
            class="city-item" 
            :class="{ active: selectedCity === '' }" 
            @tap="selectCity('')"
          >
            全部城市
          </view>
          <view 
            class="city-item" 
            :class="{ active: selectedCity === city }" 
            v-for="city in cities" 
            :key="city"
            @tap="selectCity(city)"
          >
            {{ city }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app'
import { useStoreStore, useBookingStore } from '@/stores'
import { getToday, getTomorrow } from '@/utils/date'
import type { Store } from '@/types'

// Store
const storeStore = useStoreStore()
const bookingStore = useBookingStore()

// 页面参数
const checkInDate = ref('')
const checkOutDate = ref('')

// 搜索和筛选
const keyword = ref('')
const selectedCity = ref('')
const showCityPopup = ref(false)
const refreshing = ref(false)
const loading = ref(false)

// 城市列表
const cities = computed(() => {
  const citySet = new Set<string>()
  storeStore.stores.forEach(store => {
    if (store.city) citySet.add(store.city)
  })
  return Array.from(citySet)
})

// 过滤后的门店列表
const filteredStores = computed(() => {
  let stores = storeStore.stores
  
  // 按城市筛选
  if (selectedCity.value) {
    stores = stores.filter(s => s.city === selectedCity.value)
  }
  
  // 按关键词筛选
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    stores = stores.filter(s => 
      s.name.toLowerCase().includes(kw) ||
      (s.city && s.city.toLowerCase().includes(kw)) ||
      (s.address && s.address.toLowerCase().includes(kw))
    )
  }
  
  return stores
})

// 加载门店
const loadStores = async () => {
  loading.value = true
  try {
    await storeStore.loadStores(selectedCity.value)
  } finally {
    loading.value = false
  }
}

// 搜索输入
const onSearchInput = () => {
  // 实时过滤由 computed 处理
}

// 搜索
const onSearch = () => {
  // 搜索由 computed 处理
}

// 清除搜索
const clearSearch = () => {
  keyword.value = ''
}

// 下拉刷新
const onRefresh = async () => {
  refreshing.value = true
  await loadStores()
  refreshing.value = false
}

// 显示城市选择
const showCityPicker = () => {
  showCityPopup.value = true
}

// 关闭城市选择
const closeCityPicker = () => {
  showCityPopup.value = false
}

// 选择城市
const selectCity = (city: string) => {
  selectedCity.value = city
  showCityPopup.value = false
  loadStores()
}

// 跳转到详情
const goToDetail = (id: number) => {
  uni.navigateTo({
    url: `/pages/store/detail?id=${id}&checkIn=${checkInDate.value}&checkOut=${checkOutDate.value}`
  })
}

// 页面加载
onLoad((options: any) => {
  checkInDate.value = options?.checkIn || bookingStore.checkInDate || getToday()
  checkOutDate.value = options?.checkOut || bookingStore.checkOutDate || getTomorrow()
  loadStores()
})

// 下拉刷新
onPullDownRefresh(async () => {
  await loadStores()
  uni.stopPullDownRefresh()
})
</script>

<style lang="scss" scoped>
.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f0fdfa;
}

/* 搜索栏 */
.search-bar {
  padding: 20rpx 30rpx;
  background: linear-gradient(135deg, #ccfbf1 0%, #f0fdfa 100%);
}

.search-input-wrap {
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 40rpx;
  padding: 16rpx 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(13, 148, 136, 0.06);
}

.icon-search {
  font-size: 32rpx;
  margin-right: 16rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
}

.icon-clear {
  font-size: 36rpx;
  color: #999;
  padding: 0 10rpx;
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  padding: 20rpx 30rpx;
  background-color: #fff;
  border-top: 1rpx solid #eee;
  gap: 20rpx;
}

.filter-item {
  display: flex;
  align-items: center;
  padding: 12rpx 24rpx;
  background-color: #f5f5f5;
  border-radius: 30rpx;
  font-size: 24rpx;
  color: #666;
  
  &.active {
    background-color: rgba(13, 148, 136, 0.12);
    color: #0d9488;
  }
  
  .arrow {
    margin-left: 8rpx;
    font-size: 20rpx;
  }
}

/* 门店列表 */
.store-scroll {
  flex: 1;
  padding: 20rpx 30rpx;
}

.store-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.store-card {
  display: flex;
  background-color: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.store-cover {
  width: 240rpx;
  height: 180rpx;
  flex-shrink: 0;
}

.store-content {
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
}

.store-location {
  display: flex;
  align-items: flex-start;
  font-size: 24rpx;
  color: #999;
  margin-bottom: 12rpx;
  
  .icon {
    margin-right: 8rpx;
    flex-shrink: 0;
  }
}

.store-bottom {
  margin-top: auto;
}

.store-tags {
  display: flex;
  gap: 12rpx;
}

.tag {
  font-size: 22rpx;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
  
  &.tag-success {
    background-color: rgba(82, 196, 26, 0.1);
    color: #52c41a;
  }
  
  &.tag-danger {
    background-color: rgba(255, 77, 79, 0.1);
    color: #ff4d4f;
  }
}

/* 城市选择弹窗 */
.city-popup {
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
  max-height: 60vh;
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

.city-list {
  padding: 20rpx;
  max-height: 50vh;
  overflow-y: auto;
}

.city-item {
  padding: 24rpx 30rpx;
  font-size: 28rpx;
  color: #333;
  border-bottom: 1rpx solid #f5f5f5;
  
  &.active {
    color: #0d9488;
    font-weight: 600;
  }
  
  &:last-child {
    border-bottom: none;
  }
}

/* 空状态和加载 */
.empty-state,
.loading {
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
