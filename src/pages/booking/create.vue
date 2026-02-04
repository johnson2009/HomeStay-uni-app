<template>
  <view class="page">
    <!-- 入住信息 -->
    <view class="section card">
      <view class="section-title">入住信息</view>
      <view class="date-row">
        <view class="date-item">
          <text class="label">入住</text>
          <text class="value">{{ checkInDate }}</text>
          <text class="week">{{ checkInWeek }}</text>
        </view>
        <view class="date-divider">
          <view class="nights-badge">{{ nights }}晚</view>
        </view>
        <view class="date-item">
          <text class="label">离店</text>
          <text class="value">{{ checkOutDate }}</text>
          <text class="week">{{ checkOutWeek }}</text>
        </view>
      </view>
    </view>

    <!-- 房型信息 -->
    <view class="section card" v-if="roomType">
      <view class="room-info">
        <image 
          class="room-cover" 
          :src="roomType.cover_image || '/static/images/default-room.png'" 
          mode="aspectFill"
        />
        <view class="room-detail">
          <text class="room-name">{{ roomType.name }}</text>
          <view class="room-features">
            <text v-if="roomType.bed_type">{{ roomType.bed_type }}</text>
            <text v-if="roomType.area">{{ roomType.area }}㎡</text>
            <text v-if="roomType.max_guests">可住{{ roomType.max_guests }}人</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 入住人信息 -->
    <view class="section card">
      <view class="section-title">入住人信息</view>
      
      <view class="form-item">
        <text class="form-label">姓名</text>
        <input 
          class="form-input" 
          placeholder="请输入入住人姓名"
          v-model="guestName"
        />
      </view>
      
      <view class="form-item">
        <text class="form-label">手机号</text>
        <input 
          class="form-input" 
          type="number"
          maxlength="11"
          placeholder="请输入手机号"
          v-model="guestPhone"
        />
      </view>
      
      <view class="form-item">
        <text class="form-label">入住人数</text>
        <view class="stepper">
          <view class="stepper-btn" :class="{ disabled: guestCount <= 1 }" @tap="decreaseGuest">-</view>
          <text class="stepper-value">{{ guestCount }}</text>
          <view class="stepper-btn" :class="{ disabled: guestCount >= maxGuests }" @tap="increaseGuest">+</view>
        </view>
      </view>
    </view>

    <!-- 备注 -->
    <view class="section card">
      <view class="section-title">备注信息</view>
      <textarea 
        class="form-textarea"
        placeholder="有什么特殊需求可以在这里告诉我们"
        v-model="remark"
        maxlength="200"
      />
    </view>

    <!-- 价格明细 -->
    <view class="section card">
      <view class="section-title">费用明细</view>
      <view class="price-row">
        <text class="price-label">房费 ({{ nights }}晚)</text>
        <text class="price-value">¥{{ totalPrice }}</text>
      </view>
      <view class="price-total">
        <text class="total-label">合计</text>
        <view class="total-value">
          <text class="currency">¥</text>
          <text class="amount">{{ totalPrice }}</text>
        </view>
      </view>
    </view>

    <!-- 底部栏 -->
    <view class="bottom-bar">
      <view class="bottom-price">
        <text class="bottom-label">总价</text>
        <view class="bottom-amount">
          <text class="currency">¥</text>
          <text class="amount">{{ totalPrice }}</text>
        </view>
      </view>
      <button class="submit-btn" @tap="submitBooking" :loading="submitting">
        提交订单
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { roomApi, bookingApi } from '@/api'
import { daysBetween, getWeekDay } from '@/utils/date'
import type { RoomType } from '@/types'

// 页面参数
const storeId = ref<number>(0)
const roomTypeId = ref<number>(0)
const checkInDate = ref('')
const checkOutDate = ref('')

// 房型信息
const roomType = ref<RoomType | null>(null)

// 计算属性
const checkInWeek = computed(() => getWeekDay(checkInDate.value))
const checkOutWeek = computed(() => getWeekDay(checkOutDate.value))
const nights = computed(() => daysBetween(checkInDate.value, checkOutDate.value))

// 表单数据
const guestName = ref('')
const guestPhone = ref('')
const guestCount = ref(1)
const maxGuests = ref(2)
const remark = ref('')

// 价格
const totalPrice = computed(() => {
  if (!roomType.value) return 0
  return (roomType.value.base_price * nights.value).toFixed(2)
})

// 提交状态
const submitting = ref(false)

// 加载房型信息
const loadRoomType = async () => {
  try {
    const roomTypes = await roomApi.getRoomTypeList(storeId.value)
    const room = roomTypes.find((r: RoomType) => r.id === roomTypeId.value)
    
    if (room) {
      roomType.value = room
      maxGuests.value = room.max_guests || 2
    }
  } catch (err) {
    console.error('加载房型失败', err)
  }
}

// 减少人数
const decreaseGuest = () => {
  if (guestCount.value > 1) {
    guestCount.value--
  }
}

// 增加人数
const increaseGuest = () => {
  if (guestCount.value < maxGuests.value) {
    guestCount.value++
  }
}

// 提交订单
const submitBooking = async () => {
  // 验证
  if (!guestName.value.trim()) {
    uni.showToast({ title: '请输入入住人姓名', icon: 'none' })
    return
  }
  
  if (!guestPhone.value.trim()) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return
  }
  
  if (!/^1\d{10}$/.test(guestPhone.value)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }
  
  submitting.value = true
  
  try {
    const booking = await bookingApi.createBooking({
      store_id: storeId.value,
      room_type_id: roomTypeId.value,
      check_in_date: checkInDate.value,
      check_out_date: checkOutDate.value,
      guest_name: guestName.value,
      guest_phone: guestPhone.value,
      guest_count: guestCount.value,
      remark: remark.value
    })
    
    uni.showToast({
      title: '预订成功',
      icon: 'success'
    })
    
    // 跳转到订单详情
    setTimeout(() => {
      uni.redirectTo({
        url: `/pages/booking/detail?id=${booking.id}`
      })
    }, 1500)
    
  } catch (err: any) {
    console.error('预订失败', err)
    uni.showToast({
      title: err.message || '预订失败，请重试',
      icon: 'none'
    })
  } finally {
    submitting.value = false
  }
}

// 页面加载
onLoad((options: any) => {
  storeId.value = parseInt(options?.storeId || '0')
  roomTypeId.value = parseInt(options?.roomTypeId || '0')
  checkInDate.value = options?.checkIn || ''
  checkOutDate.value = options?.checkOut || ''
  
  loadRoomType()
})
</script>

<style lang="scss" scoped>
.page {
  padding-bottom: 180rpx;
  background-color: #f5f5f5;
}

.card {
  margin: 20rpx 30rpx;
  padding: 30rpx;
  background-color: #fff;
  border-radius: 16rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 24rpx;
}

/* 日期信息 */
.date-row {
  display: flex;
  align-items: center;
}

.date-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .label {
    font-size: 24rpx;
    color: #999;
    margin-bottom: 8rpx;
  }
  
  .value {
    font-size: 30rpx;
    font-weight: 600;
    color: #333;
  }
  
  .week {
    font-size: 22rpx;
    color: #666;
    margin-top: 4rpx;
  }
}

.date-divider {
  padding: 0 30rpx;
}

.nights-badge {
  font-size: 24rpx;
  color: #4A90D9;
  background-color: rgba(74, 144, 217, 0.1);
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
}

/* 房型信息 */
.room-info {
  display: flex;
}

.room-cover {
  width: 180rpx;
  height: 120rpx;
  border-radius: 8rpx;
  margin-right: 20rpx;
}

.room-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.room-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 12rpx;
}

.room-features {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
  
  text {
    font-size: 22rpx;
    color: #666;
    padding: 4rpx 12rpx;
    background-color: #f5f5f5;
    border-radius: 4rpx;
  }
}

/* 表单 */
.form-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
  
  &:last-child {
    border-bottom: none;
  }
}

.form-label {
  font-size: 28rpx;
  color: #333;
  width: 160rpx;
}

.form-input {
  flex: 1;
  font-size: 28rpx;
  text-align: right;
}

.form-textarea {
  width: 100%;
  height: 160rpx;
  font-size: 28rpx;
  padding: 16rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  box-sizing: border-box;
}

/* 步进器 */
.stepper {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.stepper-btn {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  font-size: 32rpx;
  color: #333;
  
  &.disabled {
    color: #ccc;
  }
}

.stepper-value {
  width: 80rpx;
  text-align: center;
  font-size: 28rpx;
  color: #333;
}

/* 价格明细 */
.price-row {
  display: flex;
  justify-content: space-between;
  padding: 16rpx 0;
  
  .price-label {
    font-size: 26rpx;
    color: #666;
  }
  
  .price-value {
    font-size: 26rpx;
    color: #333;
  }
}

.price-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20rpx;
  margin-top: 16rpx;
  border-top: 1rpx solid #f5f5f5;
  
  .total-label {
    font-size: 28rpx;
    color: #333;
    font-weight: 600;
  }
  
  .total-value {
    display: flex;
    align-items: baseline;
    
    .currency {
      font-size: 28rpx;
      color: #ff4d4f;
    }
    
    .amount {
      font-size: 40rpx;
      font-weight: 600;
      color: #ff4d4f;
    }
  }
}

/* 底部栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background-color: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.bottom-price {
  flex: 1;
  
  .bottom-label {
    font-size: 24rpx;
    color: #999;
    margin-right: 8rpx;
  }
  
  .bottom-amount {
    display: inline-flex;
    align-items: baseline;
    
    .currency {
      font-size: 28rpx;
      color: #ff4d4f;
    }
    
    .amount {
      font-size: 44rpx;
      font-weight: 600;
      color: #ff4d4f;
    }
  }
}

.submit-btn {
  padding: 0 60rpx;
  height: 88rpx;
  line-height: 88rpx;
  font-size: 30rpx;
  color: #fff;
  background-color: #4A90D9;
  border-radius: 44rpx;
  border: none;
}
</style>
