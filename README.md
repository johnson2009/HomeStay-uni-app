# HomeStay 民宿预订系统 - uni-app 版本

基于 uni-app + Vue3 + Vite + TypeScript 开发的跨平台民宿预订应用。

## 技术栈

- **框架**: uni-app + Vue 3
- **构建工具**: Vite
- **语言**: TypeScript
- **状态管理**: Pinia
- **UI组件库**: uni-ui
- **CSS预处理器**: SCSS

## 项目结构

```
HomeStay-uni-app/
├── src/
│   ├── api/                # API接口
│   │   ├── auth.ts         # 认证相关
│   │   ├── booking.ts      # 预订相关
│   │   ├── room.ts         # 房间相关
│   │   └── store.ts        # 门店相关
│   ├── components/         # 公共组件
│   ├── pages/              # 页面
│   │   └── index/          # 首页
│   ├── static/             # 静态资源
│   │   ├── icons/          # 图标
│   │   └── images/         # 图片
│   ├── stores/             # Pinia状态管理
│   │   ├── booking.ts      # 预订状态
│   │   ├── store.ts        # 门店状态
│   │   └── user.ts         # 用户状态
│   ├── styles/             # 全局样式
│   │   ├── global.scss     # 全局样式
│   │   └── variables.scss  # 变量定义
│   ├── types/              # 类型定义
│   ├── utils/              # 工具函数
│   │   ├── config.ts       # 配置
│   │   ├── date.ts         # 日期工具
│   │   └── request.ts      # 请求封装
│   ├── App.vue             # 根组件
│   ├── main.ts             # 入口文件
│   ├── manifest.json       # uni-app配置
│   └── pages.json          # 页面配置
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 开发环境配置

### 安装依赖

```bash
npm install
```

### 启动H5开发服务

```bash
npm run dev:h5
```

### 启动微信小程序开发

```bash
npm run dev:mp-weixin
```

然后用微信开发者工具打开 `dist/dev/mp-weixin` 目录。

### 构建生产版本

```bash
# H5
npm run build:h5

# 微信小程序
npm run build:mp-weixin
```

## 功能特性

### 首页 (Index)

- 轮播图展示
- 入住/离店日期选择
- 热门民宿列表展示
- 下拉刷新

### 计划功能

- 门店列表页
- 门店详情页
- 房型列表
- 预订创建
- 订单管理
- 用户中心

## API配置

修改 `src/utils/config.ts` 中的 `BASE_URL` 为你的后端API地址：

```typescript
export const BASE_URL = 'http://localhost:8000'  // 开发环境
// export const BASE_URL = 'https://your-api-domain.com'  // 生产环境
```

## 注意事项

1. 微信小程序需要在 `src/manifest.json` 中配置正确的 AppID
2. 确保后端API服务已启动且可访问
3. 开发时注意跨域问题的处理
