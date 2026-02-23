<template>
  <view class="page" v-if="store">
    <!-- 轮播图 -->
    <view class="banner">
      <swiper 
        indicator-dots
        autoplay
        :interval="4000"
        circular
      >
        <swiper-item v-if="store.cover_image">
          <image :src="store.cover_image" mode="aspectFill" class="banner-image"/>
        </swiper-item>
        <swiper-item v-for="(img, index) in storeImages" :key="index">
          <image :src="img" mode="aspectFill" class="banner-image"/>
        </swiper-item>
        <swiper-item v-if="!store.cover_image && storeImages.length === 0">
          <image :src="getImageUrl('images/default-store.png')" mode="aspectFill" class="banner-image"/>
        </swiper-item>
      </swiper>
    </view>

    <!-- 门店信息 -->
    <view class="store-info card">
      <view class="store-name">{{ store.name }}</view>
      <view class="store-meta">
        <text class="tag tag-success" v-if="store.is_active">营业中</text>
        <text class="tag tag-danger" v-else>暂停营业</text>
      </view>
      <view class="store-desc" v-if="store.description">{{ store.description }}</view>
    </view>

    <!-- 入住信息 -->
    <view class="check-info card">
      <view class="info-item">
        <text class="label">入住时间</text>
        <text class="value">{{ store.check_in_time || '14:00' }}后</text>
      </view>
      <view class="info-item">
        <text class="label">退房时间</text>
        <text class="value">{{ store.check_out_time || '12:00' }}前</text>
      </view>
    </view>

    <!-- 位置信息 -->
    <view class="location-card card" @tap="openLocation">
      <view class="location-icon">📍</view>
      <view class="location-text">
        <view class="location-address">{{ store.province }}{{ store.city }}{{ store.district }}{{ store.address }}</view>
        <view class="location-hint">点击查看地图</view>
      </view>
      <view class="location-arrow">></view>
    </view>

    <!-- 联系方式 -->
    <view class="contact-card card" v-if="store.contact_phone" @tap="callPhone">
      <view class="contact-icon">📞</view>
      <view class="contact-text">
        <view class="contact-phone">{{ store.contact_phone }}</view>
        <view class="contact-name" v-if="store.contact_name">联系人：{{ store.contact_name }}</view>
      </view>
      <view class="contact-btn">拨打电话</view>
    </view>

    <!-- 设施服务 -->
    <view class="facilities-card card" v-if="facilities.length > 0">
      <view class="card-title">设施服务</view>
      <view class="facilities-list">
        <view class="facility-item" v-for="(item, index) in facilities" :key="index">
          <text class="facility-icon">✓</text>
          <text>{{ item }}</text>
        </view>
      </view>
    </view>

    <!-- 房型列表 -->
    <view class="room-section">
      <view class="section-header">
        <view class="section-title">房型</view>
        <view class="date-info">
          <text>{{ checkInDate }} - {{ checkOutDate }}</text>
        </view>
      </view>

      <view class="room-list" v-if="roomTypes.length > 0">
        <view class="room-card card" v-for="item in roomTypes" :key="item.id">
          <image 
            class="room-cover" 
            :src="item.cover_image || getImageUrl('images/default-room.png')" 
            mode="aspectFill"
          />
          <view class="room-info">
            <view class="room-name">{{ item.name }}</view>
            <view class="room-desc" v-if="item.description">{{ item.description }}</view>
            <view class="room-features">
              <text v-if="item.bed_type">{{ item.bed_type }}</text>
              <text v-if="item.area">{{ item.area }}㎡</text>
              <text v-if="item.max_guests">可住{{ item.max_guests }}人</text>
            </view>
            <view class="room-bottom">
              <view class="room-price">
                <text class="price-unit">¥</text>
                <text class="price-value">{{ item.base_price || '--' }}</text>
                <text class="price-suffix">/晚</text>
              </view>
              <view class="room-availability">
                <text class="available" v-if="(item.available_rooms ?? 0) > 0">剩{{ item.available_rooms ?? 0 }}间</text>
                <text class="sold-out" v-else>已满房</text>
              </view>
              <button 
                class="book-btn"
                :class="{ disabled: (item.available_rooms ?? 0) <= 0 }"
                @tap="bookRoom(item)"
                :disabled="(item.available_rooms ?? 0) <= 0"
              >
                预订
              </button>
            </view>
          </view>
        </view>
      </view>

      <view class="empty-state" v-else-if="!loading">
        <text>暂无可预订房型</text>
      </view>
    </view>
  </view>

  <!-- 加载中 -->
  <view class="loading-state" v-else>
    <text>加载中...</text>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore, useBookingStore } from '@/stores'
import { storeApi, roomApi } from '@/api'
import { getImageUrl } from '@/utils/config'
import { getToday, getTomorrow } from '@/utils/date'
import type { Store, RoomType } from '@/types'

// Store
const userStore = useUserStore()
const bookingStore = useBookingStore()

// 页面数据
const storeId = ref<number>(0)
const store = ref<Store | null>(null)
const storeImages = ref<string[]>([])
const facilities = ref<string[]>([])
const roomTypes = ref<RoomType[]>([])
const checkInDate = ref('')
const checkOutDate = ref('')
const loading = ref(false)

// 加载门店详情
const loadStoreDetail = async () => {
  loading.value = true
  try {
    const data = await storeApi.getStoreDetail(storeId.value)
    store.value = data
    
    // 解析图片JSON
    if (data.images) {
      try {
        storeImages.value = JSON.parse(data.images)
      } catch (e) {
        console.error('解析图片失败', e)
      }
    }
    
    // 解析设施JSON
    if (data.facilities) {
      try {
        facilities.value = JSON.parse(data.facilities)
      } catch (e) {
        console.error('解析设施失败', e)
      }
    }
    
    // 设置页面标题
    uni.setNavigationBarTitle({
      title: data.name
    })
  } catch (err) {
    console.error('加载门店详情失败', err)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 加载房型列表
const loadRoomTypes = async () => {
  try {
    const data = await roomApi.getRoomTypeList(storeId.value, checkInDate.value, checkOutDate.value)
    roomTypes.value = data
  } catch (err) {
    console.error('加载房型失败', err)
  }
}

// 打开地图
const openLocation = () => {
  if (!store.value) return
  
  if (store.value.latitude && store.value.longitude) {
    uni.openLocation({
      latitude: parseFloat(String(store.value.latitude)),
      longitude: parseFloat(String(store.value.longitude)),
      name: store.value.name,
      address: `${store.value.province || ''}${store.value.city || ''}${store.value.district || ''}${store.value.address || ''}`
    })
  } else {
    uni.showToast({
      title: '暂无位置信息',
      icon: 'none'
    })
  }
}

// 拨打电话
const callPhone = () => {
  if (store.value?.contact_phone) {
    uni.makePhoneCall({
      phoneNumber: store.value.contact_phone
    })
  }
}

// 预订房间
const bookRoom = (room: RoomType) => {
  // 检查登录状态
  if (!userStore.isLoggedIn) {
    uni.navigateTo({
      url: '/pkgUser/login?redirect=booking'
    })
    return
  }
  
  // 跳转到预订页面
  uni.navigateTo({
    url: `/pkgOrder/create?storeId=${storeId.value}&roomTypeId=${room.id}&checkIn=${checkInDate.value}&checkOut=${checkOutDate.value}`
  })
}

// 页面加载
onLoad((options: any) => {
  storeId.value = parseInt(options?.id || '0')
  checkInDate.value = options?.checkIn || bookingStore.checkInDate || getToday()
  checkOutDate.value = options?.checkOut || bookingStore.checkOutDate || getTomorrow()
  
  loadStoreDetail()
  loadRoomTypes()
})
</script>

<style lang="scss" scoped>
.page {
  padding-bottom: 40rpx;
  background-color: #f0fdfa;
}

/* 轮播图 */
.banner {
  height: 400rpx;

  swiper {
    height: 100%;
  }
}

.banner-image {
  width: 100%;
  height: 100%;
}

/* 卡片通用样式 */
.card {
  margin: 20rpx 30rpx;
  padding: 30rpx;
  background-color: #fff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

/* 门店信息 */
.store-info {
  margin-top: -40rpx;
  position: relative;
  z-index: 10;
}

.store-name {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
}

.store-meta {
  margin-bottom: 16rpx;
}

.tag {
  font-size: 22rpx;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  
  &.tag-success {
    background-color: rgba(13, 148, 136, 0.12);
    color: #0d9488;
  }
  
  &.tag-danger {
    background-color: rgba(255, 77, 79, 0.1);
    color: #ff4d4f;
  }
}

.store-desc {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
}

/* 入住信息 */
.check-info {
  display: flex;
  justify-content: space-around;
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .label {
    font-size: 24rpx;
    color: #999;
    margin-bottom: 8rpx;
  }
  
  .value {
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
  }
}

/* 位置卡片 */
.location-card {
  display: flex;
  align-items: center;
}

.location-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.location-text {
  flex: 1;
}

.location-address {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 8rpx;
}

.location-hint {
  font-size: 24rpx;
  color: #999;
}

.location-arrow {
  font-size: 28rpx;
  color: #999;
}

/* 联系卡片 */
.contact-card {
  display: flex;
  align-items: center;
}

.contact-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.contact-text {
  flex: 1;
}

.contact-phone {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 8rpx;
}

.contact-name {
  font-size: 24rpx;
  color: #999;
}

.contact-btn {
  font-size: 26rpx;
  color: #0d9488;
  padding: 12rpx 24rpx;
  background-color: rgba(13, 148, 136, 0.12);
  border-radius: 30rpx;
}

/* 设施服务 */
.card-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
}

.facilities-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.facility-item {
  display: flex;
  align-items: center;
  font-size: 26rpx;
  color: #666;
  width: calc(50% - 10rpx);
  
  .facility-icon {
    color: #0d9488;
    margin-right: 8rpx;
  }
}

/* 房型区块 */
.room-section {
  padding: 0 30rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx 0;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.date-info {
  font-size: 24rpx;
  color: #0d9488;
}

.room-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.room-card {
  margin: 0;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
}

.room-cover {
  width: 100%;
  height: 300rpx;
}

.room-info {
  padding: 20rpx;
}

.room-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 12rpx;
}

.room-desc {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 12rpx;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.room-features {
  display: flex;
  gap: 16rpx;
  margin-bottom: 20rpx;
  
  text {
    font-size: 22rpx;
    color: #666;
    padding: 4rpx 12rpx;
    background-color: #f5f5f5;
    border-radius: 4rpx;
  }
}

.room-bottom {
  display: flex;
  align-items: center;
}

.room-price {
  flex: 1;
  
  .price-unit {
    font-size: 24rpx;
    color: #0d9488;
  }

  .price-value {
    font-size: 40rpx;
    font-weight: 600;
    color: #0d9488;
  }
  
  .price-suffix {
    font-size: 22rpx;
    color: #999;
  }
}

.room-availability {
  margin-right: 20rpx;
  
  .available {
    font-size: 24rpx;
    color: #0d9488;
  }
  
  .sold-out {
    font-size: 24rpx;
    color: #ff4d4f;
  }
}

.book-btn {
  padding: 16rpx 40rpx;
  font-size: 28rpx;
  color: #fff;
  background-color: #0d9488;
  border-radius: 40rpx;
  border: none;

  &.disabled {
    background-color: #ccc;
  }
}

/* 空状态和加载 */
.empty-state,
.loading-state {
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

.loading-state {
  height: 100vh;
}
</style>
