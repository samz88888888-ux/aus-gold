---
name: Vue页面迁移到React
overview: 将旧 Vue 项目中的 10 个指定页面迁移到当前 React 项目，保持页面样式和数据渲染一致，使用 mock 数据层替代真实 API 请求，后续可无缝切换为真实接口。
todos:
  - id: setup-router
    content: 安装 react-router-dom，改造 App.tsx 为路由模式，保持现有页面在 / 路径正常工作
    status: completed
  - id: setup-mock-layer
    content: 创建 src/features/old-pages/services/ 目录，实现 API 函数 + Mock 数据层，支持 VITE_USE_MOCK 环境变量切换
    status: completed
  - id: setup-shared-components
    content: 创建通用组件：PageNavBar, BottomPopup, AgreementPopup, ConfirmPopup, PullRefreshList（替代 Vant 组件）
    status: completed
  - id: copy-assets
    content: 从旧项目复制 ming/shop/orders/team 图片资源到 public/old-pages/
    status: completed
  - id: migrate-ming-pages
    content: 迁移算力模块 3 个页面：MingPage, MingLogPage, DestoryListPage + 对应 mock 数据
    status: completed
  - id: migrate-shop-pages
    content: 迁移商城模块 5 个页面：ShopPage, ShopOrderListPage, ShopOrderReleasePage, ShopDetailPage, ShopOrderConfirmPage + 对应 mock 数据
    status: completed
  - id: migrate-orders-page
    content: 迁移待支付订单页面 OrdersPage + 对应 mock 数据
    status: completed
  - id: migrate-user-page
    content: 迁移邀请页面 UserPage + 对应 mock 数据
    status: completed
  - id: integrate-menu
    content: 在 SideDrawer 菜单中新增算力、商城、待支付订单、邀请菜单项，连接路由导航
    status: completed
  - id: verify-pages
    content: 检查所有页面渲染、样式还原度、mock 数据展示是否正常
    status: completed
isProject: false
---

# 旧 Vue 项目页面迁移到 React 项目计划

## 项目现状分析

### 当前 React 项目
- Vite + React 19 + TypeScript + Tailwind CSS 4
- 无路由库（当前通过 state 切换页面：home/subscription/community）
- API 层已有：[`src/features/figma/services/api.ts`](src/features/figma/services/api.ts) — 支持直连和网关加密两种模式
- 认证层已有：[`src/features/figma/services/auth.ts`](src/features/figma/services/auth.ts)
- 入口：[`src/App.tsx`](src/App.tsx) -> `NavigationShowcase` 组件
- 侧边菜单在 [`src/features/figma/NavigationShowcase.tsx`](src/features/figma/NavigationShowcase.tsx) 中通过 `SideDrawer` 实现
- 菜单项定义在 [`src/features/figma/data.tsx`](src/features/figma/data.tsx) 的 `menuItems`

### 旧 Vue 项目
- Vue 3 + Vant UI + Vuex + axios
- API 基础地址：`https://api.nanapower.vip`（开发）/ `https://api.{domain}`（生产）
- 所有 API 路径前缀：`/api/v1/`
- 请求层：[`old-project/src/api/require.js`](old-project/src/api/require.js) — axios + AES 加密（生产环境）
- 使用 Vant 组件库（Popup, List, PullRefresh, Search, NavBar, Tabs 等）

### 两个项目 API 对比
- 接口路径完全一致（都是 `/api/v1/xxx`）
- 返回数据结构一致（`{ code: 200, data: ..., message: ... }`）
- 认证方式一致（Bearer token in Authorization header）
- 唯一区别是域名不同

## 需要迁移的 10 个页面

| 页面 | 旧路由 | 源文件 | API 依赖 |
|------|--------|--------|----------|

### 算力模块 (3 页)
- `/ming` -> [`old-project/src/views/ming/index.vue`](old-project/src/views/ming/index.vue) — 调用 `fetchMachineList`, `destoryMining`, `activateMachine`, `fetchUnionMiningConfig` 等
- `/mingLog` -> [`old-project/src/views/ming/mingLog.vue`](old-project/src/views/ming/mingLog.vue) — 调用 `fetchMiningLog`（带搜索）
- `/destoryList` -> [`old-project/src/views/ming/destoryList.vue`](old-project/src/views/ming/destoryList.vue) — 调用 `fetchMachineList`（status=destory）

### 商城模块 (5 页)
- `/shop` -> [`old-project/src/views/shop/goldShop.vue`](old-project/src/views/shop/goldShop.vue) — 调用 `fetchMallBanner`, `fetchMallBlock`, `fetchCategoryList`, `fetchProductList`, `fetchTodayGoldPrice`
- `/shop/orderList` -> [`old-project/src/views/shop/orderList.vue`](old-project/src/views/shop/orderList.vue) — 调用 `fetchGoldProductList`
- `/shop/orderRelease` -> [`old-project/src/views/shop/orderRelease.vue`](old-project/src/views/shop/orderRelease.vue) — 调用 `fetchOrderReleaseList`
- `/shop/detail/:id` -> [`old-project/src/views/shop/detail.vue`](old-project/src/views/shop/detail.vue) — 调用 `fetchProductDetail`，含协议弹窗
- `/shop/orderConfirm` -> [`old-project/src/views/shop/orderConfirm.vue`](old-project/src/views/shop/orderConfirm.vue) — 调用 `fetchGoldProductConfirm`

### 订单模块 (1 页)
- `/orders` -> [`old-project/src/views/order/index.vue`](old-project/src/views/order/index.vue) — 调用 `getOrders`, `getPaylist`, `cancelOrder`

### 邀请模块 (1 页)
- `/user` -> [`old-project/src/views/user/index.vue`](old-project/src/views/user/index.vue) — 调用 `fetchUserInfo`, `fetchTeamList`

## 架构设计

### 1. 引入 React Router
当前项目没有路由库，需要安装 `react-router-dom` 来支持多页面导航。

### 2. Mock 数据策略
创建一个 mock 层，与真实 API 层接口签名完全一致：

```
src/features/old-pages/
  services/
    api.ts          # API 函数定义（调用 request）
    mock.ts         # Mock 数据（从旧项目 API 响应结构复制）
    useMockApi.ts   # 统一开关：mock=true 时返回 mock 数据，false 时走真实请求
```

关键设计：每个 API 函数签名与旧项目一致，内部通过环境变量 `VITE_USE_MOCK=true` 控制是否使用 mock。切换时只需改环境变量，无需改业务代码。

### 3. 页面文件结构

```
src/features/old-pages/
  pages/
    ming/
      MingPage.tsx           # /ming 算力页面
      MingLogPage.tsx        # /mingLog 算力日志
      DestoryListPage.tsx    # /destoryList 我的矿机
    shop/
      ShopPage.tsx           # /shop 商城首页
      ShopOrderListPage.tsx  # /shop/orderList 我的订单
      ShopOrderReleasePage.tsx # /shop/orderRelease 待释放
      ShopDetailPage.tsx     # /shop/detail/:id 商品详情
      ShopOrderConfirmPage.tsx # /shop/orderConfirm 下单确认
    order/
      OrdersPage.tsx         # /orders 待支付订单
    user/
      UserPage.tsx           # /user 邀请页面
  components/
    PageNavBar.tsx           # 通用顶部导航栏（替代 Vant NavBar）
    BottomPopup.tsx          # 通用底部弹窗（替代 Vant Popup position=bottom）
    AgreementPopup.tsx       # 协议弹窗
    ConfirmPopup.tsx         # 确认弹窗
    PullRefreshList.tsx      # 下拉刷新列表（替代 Vant PullRefresh + List）
  services/
    api.ts
    mock.ts
  assets/                    # 从旧项目复制的图片资源
```

### 4. 样式迁移策略
- 旧项目使用 scoped CSS/SCSS + Vant 组件
- 新项目使用 Tailwind CSS
- 迁移时将 Vue scoped CSS 转换为 Tailwind 类名，保持视觉一致
- Vant 组件用 Tailwind 手写替代（NavBar, Popup, List, Search, Tabs 等都比较简单）

### 5. 路由和菜单集成
- 在 `App.tsx` 引入 `BrowserRouter`
- 现有页面保持在 `/` 路径
- 新迁移页面使用对应路径
- 在 `SideDrawer` 菜单中新增：算力、商城、待支付订单、邀请 四个菜单组

### 6. 图片资源
- 从 `old-project/src/assets/img/ming/`, `shop/`, `orders/`, `team/` 复制到 `public/old-pages/` 或 `src/features/old-pages/assets/`
- 远程图片（如 banner URL `https://file.naaidepin.com/...`）保持原 URL

## 实施步骤

按模块分批实施，每批包含：页面组件 + API/Mock + 路由注册 + 菜单项。
