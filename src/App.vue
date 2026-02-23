<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { on } from '@/utils/eventBus'

onLaunch(() => {
  console.log('App Launch')
  const userStore = useUserStore()
  on('auth:unauthorized', () => userStore.clearLoginInfo())
  userStore.silentLogin()
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style lang="scss">
/* 全局样式引入 */
@import '@/styles/global.scss';
</style>
