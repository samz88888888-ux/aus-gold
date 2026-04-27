# Vue 支付链路迁移审计与 React 迁移方案

## 1. 结论

先产出文档再迁移，准确率会更高。

原因有 3 个：

1. 这次不是单点改弹窗，而是 3 条链路共用一套“预下单/待支付/链支付”体系。
2. 当前 React 代码里的类型、接口、弹窗状态都还没有对齐 Vue，直接改很容易漏掉 `pay_type`、链判断、系统余额支付、无需发货支付方式这几类细节。
3. 服务端既然是按 Vue 方案完整复制过来的，最佳策略不是“重新设计”，而是先把 Vue 的页面职责、共享弹窗、接口协议、状态机完整摊平，再按 React 组件拆出来。

建议做法：

- 页面保留各自业务编排。
- 支付相关弹窗和支付处理逻辑拆成共享子组件/Hook。
- 先补类型和 API，再迁移 UI 和状态，再接链支付。

## 2. 本次审计范围

### Vue 页面

- 算力页：`old-project/src/views/ming/index.vue`
- 商城首页：`old-project/src/views/shop/goldShop.vue`
- 商品详情：`old-project/src/views/shop/detail.vue`
- 下单页：`old-project/src/views/shop/orderConfirm.vue`
- 我的订单：`old-project/src/views/shop/orderList.vue`
- 待释放记录：`old-project/src/views/shop/orderRelease.vue`
- 待支付订单：`old-project/src/views/order/index.vue`

### Vue 共享支付组件

- 销毁数量输入弹窗：`old-project/src/components/common/DestoryAmountPopup.vue`
- 简版支付方式弹窗：`old-project/src/components/paymentChain/GenerateOrderPopup.vue`
- 商城简版支付方式弹窗：`old-project/src/components/paymentChain/GoldGenerateOrderPopup.vue`
- 待支付订单支付弹窗：`old-project/src/components/paymentChain/WaitOrderPopup.vue`
- NADI 支付执行器：`old-project/src/components/paymentChain/NadiPaymentHandler.vue`
- BSC 支付执行器：`old-project/src/components/paymentChain/BscPaymentHandler.vue`
- 未支付订单提醒弹窗：`old-project/src/components/common/UnpaidOrderPopup.vue`

### 当前 React 页面

- `src/features/old-pages/pages/ming/MingPage.tsx`
- `src/features/old-pages/pages/shop/ShopPage.tsx`
- `src/features/old-pages/pages/shop/ShopDetailPage.tsx`
- `src/features/old-pages/pages/shop/ShopOrderConfirmPage.tsx`
- `src/features/old-pages/pages/shop/ShopOrderListPage.tsx`
- `src/features/old-pages/pages/shop/ShopOrderReleasePage.tsx`
- `src/features/old-pages/pages/order/OrdersPage.tsx`

## 3. 路由对照

### Vue 路由

- 算力页：`/#/ming`
- 商城页：`/#/shop`
- 商品详情：`/#/shop/detail/:id`
- 下单页：`/#/shop/orderConfirm`
- 我的订单：`/#/shop/orderList?group_id=1`
- 待释放记录：`/#/shop/orderRelease?group_id=1`
- 待支付订单：`/#/orders`

### React 对应页面

- 算力页：`MingPage`
- 商城页：`ShopPage`
- 商品详情：`ShopDetailPage`
- 下单页：`ShopOrderConfirmPage`
- 我的订单：`ShopOrderListPage`
- 待释放记录：`ShopOrderReleasePage`
- 待支付订单：`OrdersPage`

## 4. 当前 React 与 Vue 的差距总览

### 4.1 销毁挖矿

当前 React `MingPage.tsx` 只有一个静态 `DestroySheet`：

- 只有最小销毁量和价格展示。
- 没有 USDT 输入框。
- 没有 MCG/NADI/NAAU 换算。
- 没有二次支付方式选择弹窗。
- 没有调用 `POST /api/v1/preOrder/preOrder`。
- 没有跳转待支付订单。

### 4.2 商城详情与下单

当前 React 商城链路仍是简化版：

- `ShopDetailPage.tsx` 只用了 `is_purchased` 做协议判断。
- Vue 实际用的是 `userInfo.gold_order_status` 判定是否已同意协议。
- React 商品详情类型里没有完整 SKU、`payment`、`no_payment`、`handicraft_fee`。
- `ShopOrderConfirmPage.tsx` 当前只是本地假提交，未接支付弹窗，也未调用预下单。

### 4.3 待支付订单

当前 React `OrdersPage.tsx` 只是列表展示：

- 数据结构不对，只识别 `payment_methods` 简单数组。
- “去支付”还是 `alert('支付功能开发中')`。
- 没有 `getPreOrderPayment`。
- 没有系统余额 / 链支付分流。
- 没有链切换提示。
- 没有 NADI/BSC 支付执行器。

## 5. Vue 真实支付主链路

## 5.1 销毁挖矿链路

### 页面入口

文件：`old-project/src/views/ming/index.vue`

入口按钮：

- “销毁挖矿”按钮点击 `openDestoryPopup`
- 展示 `DestoryAmountPopup`

### 第一步：输入金额弹窗

组件：`old-project/src/components/common/DestoryAmountPopup.vue`

核心行为：

- 双 Tab：`nadi` / `naau`
- 第一个输入框：输入 USDT 数量
- 第二个输入框：展示并允许反向输入对应币种数量
- 当前币种文案不是后端直接给，而是前端根据 Tab 显示：
  - `nadi` => `NADI`
  - `naau` => `NAAU`
- 当前价格：
  - `nadi` Tab 用 `price`
  - `naau` Tab 用 `naauPrice`
- 换算公式：
  - `币种数量 = USDT * 当前价格`
  - `USDT = 币种数量 / 当前价格`
- 最低限制：
  - `Number(inputValue) >= availableAmount`
- 提交事件 payload：
  - `amount`: USDT 数量
  - `nadiAmount`: 对应币种数量
  - `inputType`: 最后一次编辑的是哪个输入框
  - `paymentType`: `nadi` 或 `naau`

### 第二步：选择预下单支付方式

组件：`old-project/src/components/paymentChain/GenerateOrderPopup.vue`

来源数据：

- `fetchDestoryInfo()` 返回：
  - `payment`
  - `naau_payment`
- 页面根据第一步 `paymentType` 选择：
  - `nadi` => `payment`
  - `naau` => `naau_payment`

弹窗能力：

- 展示订单金额（USDT）
- 展示支付方式列表
- 每个支付方式包含：
  - `id`
  - `name`
  - `pay_type`
  - `extend`
- `pay_type`：
  - `1` = 单币支付
  - `2` = 混合支付
- 点击某一项只是选中，不立刻提交
- 点击确认才抛出 `pay-success`

### 第三步：预下单

页面方法：`handlePaySuccess`

接口：

- `POST /api/v1/preOrder/preOrder`

请求体：

```json
{
  "order_type": "destroy_machine",
  "payment_id": 123,
  "source_extend": {
    "amount": 100
  }
}
```

成功后行为：

- 关闭支付弹窗
- Toast 成功
- 2 秒后跳转 `/#/orders`

### 对 React 的额外要求

你提到“当前接口返回 `destoryInfo?.currency?.name`，要按这个币种名换算”。

这里和当前仓库里的 React 类型、旧 Vue 代码都不一致：

- React `DestoryInfo` 只有 `min_amount / price / naau_price / payment / naau_payment`
- Vue 输入弹窗用的是本地 Tab 逻辑决定 `NADI/NAAU`

因此迁移时必须先做一层类型校验：

1. 扩展 React `DestoryInfo` 类型，兼容 `currency?.name`
2. 如果后端现在真的已经统一成单币种返回，则输入弹窗不要写死 `NADI/NAAU`
3. 如果仍保留双 Tab 结构，则 `currency?.name` 只作为展示补充，不替代 Tab 逻辑

建议 React 实现保守兼容：

- 优先使用服务端返回的 `selectedCurrencyName`
- 没有时再 fallback 到 `NADI/NAAU`

### 关于防抖

旧 Vue 这里没有防抖，是同步本地计算。

但你现在明确要求“这里需要有防抖”，React 建议这样做：

- `USDT` 输入值用 `rawUsdtAmount`
- 300ms 防抖后更新 `debouncedUsdtAmount`
- 用防抖后的值做换算和展示
- 如果未来改成调用换算接口，也可以直接复用这层防抖

如果当前换算仍然只是 `amount * price` 的前端公式，防抖主要是为了输入体验统一，不是接口必须。

## 5.2 商城详情 -> 下单 -> 支付链路

### 商品详情页

文件：`old-project/src/views/shop/detail.vue`

核心逻辑：

- 拉详情：`GET /api/v1/gold/goodsDetail`
- 支持 SKU：
  - `is_sku === 2`
  - 使用 `sku_attr_value`
- 购买前生成 `orderData`
- `orderData.product` 里会保留：
  - `id`
  - `name`
  - `img`
  - `payment`
  - `no_payment`
  - `handicraft_fee`

协议逻辑：

- Vue 用 `userInfo.gold_order_status === true` 判断是否已同意协议
- 未同意：
  - 暂存 `pendingOrderData`
  - 弹出 `GoldAgreementPopup`
- 同意后：
  - `setShopOrderInfo`
  - 跳转 `/shop/orderConfirm`

你要求 React “先静态默认点击展示协议”是可行的。

建议第一版：

- 无论是否购买过，先弹协议
- 点击同意后继续下单

### 下单页

文件：`old-project/src/views/shop/orderConfirm.vue`

核心状态：

- `needDelivery`
- `selectedAddress`
- `remark`
- `orderData`
- `paymentMethodsList`
- `showPaymentPopup`

支付方式来源：

- 需要发货：`orderData.product.payment`
- 无需发货：`orderData.product.no_payment`

这正是你提到的“商城固定金额，不需要先输入数量弹窗，但要保留是否发货和不同支付方式”的关键点。

### 商城支付弹窗

组件：`old-project/src/components/paymentChain/GoldGenerateOrderPopup.vue`

这和 `GenerateOrderPopup.vue` 基本同构：

- 展示订单 USDT 金额
- 选择支付方式
- 点击确认才触发提交

### 商城预下单

接口：

- `POST /api/v1/preOrder/preOrder`

请求体：

```json
{
  "order_type": "gold_goods",
  "payment_id": 123,
  "source_extend": {
    "goods_id": 16,
    "count": 1,
    "address_id": 88,
    "sku_unique_id": "xxx",
    "remark": "xxx",
    "order_type": 1
  }
}
```

注意 `source_extend.order_type`：

- `1` = 需要发货
- `2` = 无需发货

成功后行为：

- 关闭弹窗
- 成功提示
- 2 秒后跳转 `/#/orders`

## 5.3 待支付订单续付链路

### 列表页

文件：`old-project/src/views/order/index.vue`

接口：

- 列表：`GET /api/v1/preOrder/preOrderList`
- 取消：`POST /api/v1/preOrder/cancel`
- 获取某个支付项支付信息：`GET /api/v1/preOrder/getPreOrderPayment`
- 发起支付：`POST /api/v1/preOrder/pay`

列表结构不是当前 React `PreOrderItem.payment_methods[]` 那种简化形式。

Vue 实际上用的是：

- 订单维度：
  - `id`
  - `order_no`
  - `order_type`
  - `status`
  - `total_amount`
  - `payment`
  - 可能还带 `gold_source / node_source / equipment_source`
- 支付项维度：
  - `id`
  - `system_currency_id`
  - `radio_rate`
  - `total_amount`
  - `status`

### 点击某个支付项后的行为

步骤如下：

1. 用户点击某个支付项上的“去支付”
2. 调 `getPreOrderPayment`
3. 页面根据返回值动态构造支付方式列表
4. 弹出 `WaitOrderPopup`
5. 用户选择“系统余额支付”或“链上支付”
6. 确认后调用 `/preOrder/pay`
7. 若是系统余额，后端直接完成
8. 若是链上支付，再进入 NADI/BSC 执行器

### `getPreOrderPayment` 返回值在 Vue 中的使用字段

从 `old-project/src/views/order/index.vue` 可确认至少包含：

- `ac_amount`
- `price`
- `total_amount`
- `payment_methods`
- `system_currency_id`
- `systemAmount`
- `chainCurrency`

链上支付返回值在 `/preOrder/pay` 响应里至少包含：

- `currency`
- `amount`
- `order_no`

### 待支付订单支付弹窗

组件：`old-project/src/components/paymentChain/WaitOrderPopup.vue`

它不是简版弹窗，能力明显更强：

- 展示：
  - 订单总额 `orderValue`
  - 单价 `price`
  - 实际应付代币数量 `orderAmount`
- 支持多支付渠道：
  - 系统余额支付
  - 链上支付
- 每个支付方式都有状态：
  - `available`
  - `isChainMatch`
  - `needSwitchChain`
  - `balance`
  - `targetChainName`
- 链不匹配时：
  - 允许选中
  - 但确认按钮禁用
  - 同时显示切链提示
- 系统余额不足时：
  - 如果 `type === 1`，不允许确认
- 链上支付余额不足时：
  - Vue 允许继续选择，最终由链支付流程处理

### `buildPaymentMethods` 的真实规则

文件：`old-project/src/views/order/index.vue`

#### 系统余额支付

当 `payment_methods === 1 || payment_methods === 3` 时构造：

- `type: 1`
- `payment: 'system_balance'`
- `available = systemAmount >= totalAmount`

#### 链上支付

当 `payment_methods === 2 || payment_methods === 3` 时构造：

- `type: 2`
- `payment` 按链判断：
  - `chain_id === 399` => `chain_nadi`
  - `chain_id === 56` => `chain_usdt`
- 先检查当前钱包链是否匹配
- 匹配才去拿真实余额
- 不匹配时 `needSwitchChain = true`

### 链支付执行器

#### NADI

组件：`old-project/src/components/paymentChain/NadiPaymentHandler.vue`

规则：

- 要求当前链为 `399`
- 调 `naaiInitializePayment(paymentInfo, amount, orderNo)`

#### BSC

组件：`old-project/src/components/paymentChain/BscPaymentHandler.vue`

规则：

- 要求当前链为 `56`
- 调 `initializePayment(paymentInfo, amount, orderNo, paymentType)`

### 链配置来源

文件：`old-project/src/mixins/multiChainBalance.js`

当前明确支持：

- BSC: `56`
- NADI: `399`

并且承担这些职责：

- 获取当前钱包链 ID
- 检查链匹配
- 获取钱包地址
- 获取主币余额
- 获取 ERC20 余额
- 切换链 / 添加链

这部分如果 React 侧还没有统一钱包层，建议迁移成 Hook，而不是散落在页面里。

## 6. 类型审计：React 现在必须补的类型

## 6.1 `DestoryInfo`

当前 React：

```ts
type DestoryInfo = {
  min_amount: number
  price: number
  naau_price: number
  payment: PaymentMethod[]
  naau_payment: PaymentMethod[]
}
```

问题：

- 不足以支持服务端真实支付方式结构
- 也没有兼容你提到的 `currency?.name`

建议至少扩展为：

- `payment[].pay_type`
- `payment[].extend`
- `naau_payment[].pay_type`
- `naau_payment[].extend`
- `currency?`

## 6.2 `PaymentMethod`

当前 React：

```ts
type PaymentMethod = {
  id: number
  name: string
  icon: string
  type: string
}
```

这个类型不够。

Vue 里至少需要兼容：

- `id`
- `name`
- `pay_type`
- `extend.system_currency_id`
- `extend.primary_system_currency_id`
- `extend.secondary_system_currency_id`

## 6.3 `GoldProductDetail`

当前 React 缺少这些字段：

- `payment`
- `no_payment`
- `handicraft_fee`
- `img`
- `slider_img`
- `is_sku`
- `sku_attr_value`

如果不补，商城确认页无法完整复制 Vue 逻辑。

## 6.4 `PreOrderItem`

当前 React：

- 只定义了 `payment_methods: PaymentMethod[]`

Vue 实际需要：

- `payment[]`
- `total_amount`
- `expire_at`
- `status`
- `order_type`
- 来源对象：
  - `gold_source`
  - `node_source`
  - `equipment_source`

## 6.5 新增类型建议

React 需要新增至少这些类型：

- `PreOrderPaymentOption`
- `PreOrderPayInfoResponse`
- `PreOrderPayResponse`
- `DestroyAmountSubmitPayload`
- `ShopOrderDraft`
- `ResolvedPaymentMethod`
- `ChainCurrencyInfo`

## 7. 组件拆分建议

结论：建议拆，而且应该拆。

但拆法不是按页面拆，而是按“支付职责”拆。

### 建议的共享组件

#### 1. `DestroyAmountModal`

只给销毁挖矿用。

职责：

- USDT 输入
- 币种数量换算
- 双向输入
- Tab / 币种切换
- 最低金额校验

#### 2. `PreOrderPaymentMethodModal`

给以下场景共用：

- 销毁挖矿二次确认支付方式
- 商城确认订单支付方式

职责：

- 展示订单金额
- 展示支付方式列表
- 选择并确认

它可以把 Vue 里的 `GenerateOrderPopup` 和 `GoldGenerateOrderPopup` 合并成一个 React 组件，通过 `theme` 或 `variant` 控制细节。

#### 3. `PendingOrderPaymentModal`

只给待支付订单页用。

职责：

- 展示订单汇总
- 展示系统余额 / 链支付
- 展示链不匹配/余额不足状态
- 选择支付方式并确认

不要和简版支付弹窗合并，否则条件分支会太多。

#### 4. `UnpaidOrderReminderModal`

用于首页“存在未支付订单”的提醒。

这个模块和 `/#/orders` 是一套业务。

#### 5. `usePreOrderPaymentFlow`

推荐抽 Hook。

职责：

- 获取 `getPreOrderPayment`
- 构造待支付订单用的 `ResolvedPaymentMethod[]`
- 调用 `/preOrder/pay`
- 分流系统余额与链支付
- 统一清理 loading / toast / 刷新

#### 6. `useChainPayment`

职责：

- 获取当前链
- 检查链匹配
- 获取余额
- 切换链
- 发起 NADI/BSC 支付

## 8. 推荐的 React 文件落点

建议新增：

- `src/features/old-pages/components/payment/DestroyAmountModal.tsx`
- `src/features/old-pages/components/payment/PreOrderPaymentMethodModal.tsx`
- `src/features/old-pages/components/payment/PendingOrderPaymentModal.tsx`
- `src/features/old-pages/components/payment/UnpaidOrderReminderModal.tsx`
- `src/features/old-pages/hooks/usePreOrderPaymentFlow.ts`
- `src/features/old-pages/hooks/useChainPayment.ts`
- `src/features/old-pages/services/payment-types.ts`

建议修改：

- `src/features/old-pages/services/types.ts`
- `src/features/old-pages/services/api.ts`
- `src/features/old-pages/pages/ming/MingPage.tsx`
- `src/features/old-pages/pages/shop/ShopDetailPage.tsx`
- `src/features/old-pages/pages/shop/ShopOrderConfirmPage.tsx`
- `src/features/old-pages/pages/order/OrdersPage.tsx`

## 9. API 补齐清单

React 现在还缺这些接口：

- `POST /preOrder/preOrder`
- `GET /preOrder/getPreOrderPayment`
- `POST /preOrder/pay`
- `GET /preOrder/tips`

建议在 `src/features/old-pages/services/api.ts` 增加：

- `createPreOrder`
- `fetchPreOrderPaymentInfo`
- `payPreOrder`
- `fetchHasUnpaidPreOrder`

## 10. 实施顺序建议

### 第一阶段：类型和 API

1. 扩展 `types.ts`
2. 增加预下单支付 API
3. 校正商城详情类型

### 第二阶段：销毁挖矿

1. 用 `DestroyAmountModal` 替换当前静态 `DestroySheet`
2. 接入防抖换算
3. 接入 `PreOrderPaymentMethodModal`
4. 调 `createPreOrder`
5. 成功后跳转 `orders`

### 第三阶段：商城下单

1. 让 `ShopDetailPage` 保留完整 `orderData`
2. `ShopOrderConfirmPage` 接入“需要发货 / 无需发货”
3. 接入共享 `PreOrderPaymentMethodModal`
4. 调 `createPreOrder`

### 第四阶段：待支付订单

1. 重做 `OrdersPage` 数据结构
2. 接入 `fetchPreOrderPaymentInfo`
3. 接入 `PendingOrderPaymentModal`
4. 接入系统余额支付
5. 接入 NADI / BSC 链支付
6. 接入取消订单

### 第五阶段：首页未支付提醒

1. 接 `GET /preOrder/tips`
2. 加 3 小时关闭缓存
3. 跳转 `orders`

## 11. 这次迁移里最容易漏的点

- 销毁挖矿不是点确认就直接预下单，中间还有“选择支付方式”的第二层弹窗。
- 商城支付方式区分 `payment` 和 `no_payment`。
- 商城协议判断在 Vue 里不是看商品，而是看用户 `gold_order_status`。
- 待支付订单页不是简单重试支付，而是“先拉支付信息，再分流系统余额/链支付”。
- 待支付订单的弹窗和销毁/商城的支付方式弹窗不是同一个复杂度，建议分两个组件。
- 当前 React 类型远远不够，直接复制 UI 会卡在类型和接口结构上。

## 12. 关于“是否先按文档再复制到 React”

答案：是。

而且这次建议不是简单写个说明，而是把文档当迁移清单。

这份文档已经可以直接作为下一步实施基线。后续真正改 React 时，建议严格按下面方式执行：

1. 先补类型和 API，不改 UI。
2. 再替换 `MingPage`。
3. 再替换 `ShopOrderConfirmPage`。
4. 最后重做 `OrdersPage`。

这样风险最低，也最接近“把 Vue 行为完整复制到 React”。

## 13. 下一步建议

下一步可以直接按这份文档开始做 React 迁移，优先顺序建议是：

1. `MingPage` 的“输入数量 + 二次支付方式弹窗 + 预下单”
2. `ShopOrderConfirmPage` 的“发货切换 + 预下单支付弹窗”
3. `OrdersPage` 的“待支付续付 + 链支付”

如果按这个顺序做，共享支付组件也会自然成型，后面商城和其他复制页面可以直接复用。
