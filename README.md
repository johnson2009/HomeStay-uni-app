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

### 微信小程序上传与包体优化

上传前需满足：主包小于 1.5M、启用按需注入、图片/音频小于 200KB。本项目已做：

1. **分包**：非 TabBar 页面（民宿列表/详情、确认订单、订单详情、登录）已配置为分包，主包仅保留首页、订单、我的。
2. **按需注入**：在 `manifest.json` 的 `mp-weixin` 中已配置 `lazyCodeLoading: "requiredComponents"`。
3. **图片走网络**：大图（logo、banner、默认图等）不再打入包内，改为通过 `getImageUrl()` 从后端静态资源加载（主包瘦身且满足单图小于 200KB）：
   - HomeStay 后端已挂载 `/static`（见 `HomeStay/app/main.py`），将 `HomeStay-uni-app/src/static/images/` 下的图片复制到 **`HomeStay/static/images/`**，即可通过 `BASE_URL/static/images/xxx.png` 访问。
   - 小程序端 `config.ts` 中 `IMAGE_BASE_URL = BASE_URL + '/static'`，无需单独接口，**推荐直接访问图片 URL**（方案 2）。
   - 在微信公众平台将你的 API 域名配置为 **request 合法域名** 和 **downloadFile 合法域名**（与 `BASE_URL` 同域即可）。
4. **构建后自动删大图**：`npm run build:mp-weixin` 结束后会执行 `strip-mp-weixin-images.js`，删除 `dist/build/mp-weixin/static/images` 下超过 200KB 的文件，避免主包超标。
5. **主包 JS 瘦身**：`request.ts` 不再引用 `stores/user`，通过 eventBus 通知 App 处理 401，避免主包内打入未使用的 store 代码。

建议流程：确保 HomeStay 已提供 `/static` 且 `static/images` 下有所需图片 → `npm run build:mp-weixin` → 用微信开发者工具打开 `dist/build/mp-weixin` 并上传。

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

修改 `src/utils/config.ts` 中的 `BASE_URL` 为你的后端 API 地址：

```typescript
export const BASE_URL = 'http://localhost:8000'  // 开发环境
// export const BASE_URL = 'https://api.yourdomain.com'  // 生产环境：上传前务必改为此并重新构建
```

**上传小程序前**：必须把 `BASE_URL` 改成生产环境 HTTPS 地址并执行 `npm run build:mp-weixin` 再上传，否则真机请求会连到 localhost 导致网络错误。

---

## 小程序上传后报「网络连接错误」？

上传后真机或体验版报网络错误，通常是**未在微信后台配置服务器域名**或 **BASE_URL 仍是开发地址**。按下面检查。

### 1. 微信公众平台配置服务器域名

1. 登录 [微信公众平台](https://mp.weixin.qq.com/) → 进入你的小程序
2. 左侧 **开发** → **开发管理** → **开发设置**
3. 找到 **服务器域名**，点击「修改」
4. 在 **request 合法域名** 中新增一条：填你的 API 域名（**不要**带 `https://` 和路径、端口）
   - 例如 API 地址是 `https://api.yourdomain.com`，就填：`api.yourdomain.com`
5. 若小程序会通过接口下载图片（本项目图片走 `BASE_URL/static`，与 API 同域），同一域名已用于 request 即可；若单独配了下载地址，再在 **downloadFile 合法域名** 里加上同一域名
6. 保存后生效（有时需等几分钟），**一个月内最多修改 5 次**，请确认再提交

要求：

- 必须是 **HTTPS**，不支持 HTTP、IP、localhost
- 域名需已 **ICP 备案**
- 不能写端口（如 `api.xxx.com:443` 不要写）

### 2. 确认上传的包用的是生产 API 地址

若 `config.ts` 里仍是 `http://localhost:8000`，上传后请求会发到用户手机本机，必然失败。请：

1. 在 `src/utils/config.ts` 中把 `BASE_URL` 改为生产环境地址（如 `https://api.yourdomain.com`）
2. 重新执行 `npm run build:mp-weixin`
3. 用微信开发者工具打开 `dist/build/mp-weixin` 再上传

### 3. 其他可能原因

- **证书问题**：微信要求 TLS 1.2+，且证书链完整、非自签名
- **备案**：域名未备案会无法通过微信校验
- **刚改域名**：保存后稍等再试，或重新打开小程序

---

## 注意事项

1. 微信小程序需要在 `src/manifest.json` 中配置正确的 AppID
2. 确保后端 API 服务已启动且可访问；生产环境需 HTTPS + 已备案域名
3. 开发时在微信开发者工具可勾选「不校验合法域名」调试；上传/真机必须配置合法域名
