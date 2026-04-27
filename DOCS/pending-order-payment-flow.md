# 待支付订单链判定与完整支付流程说明

## 1. 文档目的

本文档说明当前 React 版本里“待支付订单”页面的完整支付实现，重点覆盖：

- 待支付订单列表如何请求和展示
- 如何根据接口字段判定系统余额支付 / 链上支付
- 如何判定目标链、目标代币、余额是否足够
- 如何完成 BSC / NADI / PYTHIA 的链上支付
- 当前实现的约束与后续扩展点

对应代码：

- 页面：[src/features/old-pages/pages/order/OrdersPage.tsx](/Users/daxing/Desktop/webList/react/aug-gold-web/src/features/old-pages/pages/order/OrdersPage.tsx)
- 支付弹窗：[src/features/old-pages/components/payment/PendingOrderPaymentModal.tsx](/Users/daxing/Desktop/webList/react/aug-gold-web/src/features/old-pages/components/payment/PendingOrderPaymentModal.tsx)
- 支付 Hook：[src/features/old-pages/hooks/useChainPayment.ts](/Users/daxing/Desktop/webList/react/aug-gold-web/src/features/old-pages/hooks/useChainPayment.ts)
- EVM 实现：[src/features/old-pages/services/evm.ts](/Users/daxing/Desktop/webList/react/aug-gold-web/src/features/old-pages/services/evm.ts)
- API 封装：[src/features/old-pages/services/api.ts](/Users/daxing/Desktop/webList/react/aug-gold-web/src/features/old-pages/services/api.ts)
- 类型定义：[src/features/old-pages/services/types.ts](/Users/daxing/Desktop/webList/react/aug-gold-web/src/features/old-pages/services/types.ts)

## 2. 页面与接口链路

### 2.1 列表请求

待支付订单页进入后，React 会调用：

- `GET /api/v1/preOrder/preOrderList`

当前已按 Vue 方式补齐参数：

```ts
fetchPreOrderList({ page: 1, page_size: 10 })
```

原因：

- 该接口服务端要求 `page`
- Vue 老代码也是用 `page/page_size`
- 不传时会报错：`The page field is required.`

### 2.2 打开支付弹窗

用户点击某一条支付记录的“去支付”后，React 会调用：

- `GET /api/v1/preOrder/getPreOrderPayment`

请求参数：

```ts
{
  pre_order_id: order.id,
  pre_order_payment_id: payment.id,
}
```

这个接口返回的 `PreOrderPaymentInfo` 是整个支付判定的核心数据来源。

### 2.3 确认支付

用户在支付弹窗里选中一种支付方式后，React 会先调用：

- `POST /api/v1/preOrder/pay`

请求参数：

```ts
{
  pre_order_id: selectedOrder.id,
  pre_order_payment_id: selectedPaymentItem.id,
  payment_methods: method.type,
}
```

其中：

- `method.type === 1` 表示系统余额支付
- `method.type === 2` 表示链上支付

如果是链上支付，服务端返回预支付结果后，前端再继续拉起钱包完成真实链交易。

## 3. 关键类型与字段含义

### 3.1 `PreOrderItem`

订单列表项，核心字段：

- `id`: 预订单 ID
- `order_no`: 订单号
- `order_type`: 订单类型
- `status`: 订单状态
- `payment`: 当前订单下可支付子项数组
- `gold_source / equipment_source / node_source`: 订单来源展示信息

### 3.2 `PreOrderPaymentItem`

列表里每一个“去支付”按钮对应的支付子项，核心字段：

- `id`
- `system_currency_id`
- `radio_rate`
- `total_amount`
- `status`

### 3.3 `PreOrderPaymentInfo`

点击“去支付”后拉回来的支付详情，核心字段：

- `ac_amount`: 当前需要支付的币种数量
- `price`: 价格
- `total_amount`: 当前订单总额
- `payment_methods`: 服务端允许的支付方式组合
- `system_currency_id`: 系统余额币种 ID
- `systemAmount`: 当前用户系统余额
- `chainCurrency`: 链上主支付币信息
- `currency`: 主币信息，支付时可能作为最终主币来源
- `sub_currency`: 双币支付场景下的副币信息
- `order_no`: 订单号

### 3.4 `CurrencyInfo`

当前 React 里统一的币种结构：

```ts
type CurrencyInfo = {
  id?: number
  name?: string
  chain_id?: number
  contract_address?: string
  decimals?: number
  amount?: number | string
}
```

最关键的判定字段：

- `chain_id`: 用于决定目标链
- `contract_address`: 用于决定是原生币还是 ERC20
- `decimals`: 用于金额精度换算
- `amount`: 双币支付时副币支付数量

## 4. 支付方式判定逻辑

支付方式的解析逻辑在 `OrdersPage.buildPaymentMethods()`。

### 4.1 `payment_methods` 的解释

当前 React 按以下方式解释服务端返回值：

- `1`: 只允许系统余额支付
- `2`: 只允许链上支付
- `3`: 两者都允许

### 4.2 系统余额支付如何生成

当 `payment_methods` 为 `1` 或 `3` 时，前端会生成一个本地支付方式对象：

```ts
{
  type: 1,
  payment: 'system_balance',
  currency: getCurrencyByChainId(info.system_currency_id),
  balance: Number(info.systemAmount || 0),
  available: Number(info.systemAmount || 0) >= Number(info.ac_amount || 0),
}
```

说明：

- `type: 1` 是后续提交给 `payPreOrder` 的关键值
- `available` 用于判定余额是否足够
- 如果余额不足，前端仍展示，但会禁用确认支付

### 4.3 链上支付如何生成

当 `payment_methods` 为 `2` 或 `3` 且 `chainCurrency.chain_id` 为支持链时，前端会生成链上支付项：

```ts
{
  type: 2,
  payment: normalizedTargetChainId === 399
    ? 'chain_nadi'
    : normalizedTargetChainId === 9777
      ? 'chain_pythia'
      : paymentType,
  currency: info.chainCurrency.name,
  balance,
  available: matched && balance >= totalAmount,
  isChainMatch: matched,
  targetChainId,
  targetChainName,
  needSwitchChain: !matched,
}
```

这里的 `paymentType`：

- 如果 `sub_currency.contract_address` 存在，则为 `chain_usdt_spa`
- 否则为 `chain_usdt`

这两个值会影响 BSC 链上到底走单币支付还是双币支付。

### 4.4 token 图片如何决定

这里要和“链判定”分开看。

当前 Vue 的待支付订单页与支付弹窗，token 图片都主要通过：

- `system_currency_id`

做前端映射。

Vue 参考位置：

- [old-project/src/views/order/index.vue](</Users/daxing/Desktop/webList/react/aug-gold-web/old-project/src/views/order/index.vue:748>)

当前 React 订单页和支付弹窗已按新的业务映射调整为：

- `1 -> usdt-coin.png`
- `2 -> pyt-coin.png`
- `3 -> mcg-coin.png`
- `5 -> mcg-coin.png`（兼容旧数据）
- `6 -> vic-coin.png`
- `7 -> cw-coin.png`
- `8 -> fbb-coin.png`
- `9 -> kiti-coin.png`
- `10 -> naau-coin.png`
- `17 -> vic-coin.png`
- `18 -> cw-coin.png`
- `19 -> fbb-coin.png`
- `20 -> kiti-coin.png`
- `21 -> naau-coin.png`

当前 React 已对齐到：

- [OrdersPage.tsx](/Users/daxing/Desktop/webList/react/aug-gold-web/src/features/old-pages/pages/order/OrdersPage.tsx)
  里的 `getCurrencyIconById()`

这也是为什么你看到待支付列表里的 token 图标应该跟着支付币种走，而不是跟着链名走。

## 5. 链判定逻辑

当前 React 支持三条链：

- BSC: `56`
- NADI: `399`
- PYTHIA: `9777`

定义位置：

- [src/features/old-pages/services/evm.ts](/Users/daxing/Desktop/webList/react/aug-gold-web/src/features/old-pages/services/evm.ts)

### 5.1 链配置

当前链配置：

- `56` -> `0x38` -> `BSC`
- `399` -> `0x18f` -> `NADI`
- `9777` -> `0x2631` -> `PYTHIA`

### 5.2 是否在正确链上

前端通过：

- `eth_chainId`

获取当前钱包链 ID，再和目标链配置对比。

对应函数：

- `getCurrentChainHexId()`
- `isChainMatched(chainId)`
- `checkChainMatch(targetChainId)`

这里真正控制“该走哪条链”的字段是：

- `chainCurrency.chain_id`
- 最终支付返回里的 `currency.chain_id`

### 5.3 切链逻辑

当用户当前钱包网络不匹配时，支付弹窗会提示切链，并调用：

- `wallet_switchEthereumChain`

如果钱包里还没有该链，则继续调用：

- `wallet_addEthereumChain`

对应函数：

- `switchOrAddChain(chainId)`
- `useChainPayment.switchChain(targetChainId)`

## 6. 余额判定逻辑

### 6.1 系统余额

系统余额不是链上余额，而是服务端直接返回：

- `systemAmount`

前端只做简单数值比较：

```ts
Number(systemAmount) >= Number(ac_amount)
```

### 6.2 链上余额

链上余额由钱包地址 + 币种信息决定。

对应调用链：

1. `useChainPayment.getBalanceForCurrency(currency, targetChainId)`
2. `refreshWalletState()`
3. `getSmartCurrencyBalance({ currency, targetChainId, owner })`

### 6.3 原生币与 ERC20 判定

判定函数：

- `isNativeCurrency(currency, targetChainId)`

判定条件：

1. 没有 `contract_address`
2. `contract_address === ZERO_ADDRESS`
3. `targetChainId === 399 && currency.name === 'NADI'`
4. `targetChainId === 9777 && currency.name === 'PYTHIA'`
5. `targetChainId === 56 && currency.name === 'BNB'`

满足任一条件时，按原生币余额读取：

- `eth_getBalance`

否则按 ERC20 余额读取：

- `balanceOf(address)`

## 6.4 链字段与 token 字段的职责区分

这部分是待支付订单迁移里最容易混淆的地方。

### 控制链的是谁

控制链的是：

- `chainCurrency.chain_id`
- `currency.chain_id`

它们决定：

- 当前支付应该走 `56`、`399` 还是 `9777`
- 是否要切换钱包网络
- 该执行 `executeBscPayment()`、`executeNadiPayment()` 还是 `executePythiaPayment()`

### 控制 token 名称和 token 图片的是谁

控制 token UI 展示的是：

- `system_currency_id`

它决定：

- 列表里的支付币种文案
- 待支付弹窗里的 token 图标
- 系统余额支付和链上支付项默认展示的币种图

当前 React 的核心映射为：

- `1 -> USDT -> /old-pages/wallet/usdt-coin.png`
- `2 -> PYTHIA -> /old-pages/wallet/pyt-coin.png`
- `3 -> MCG -> /old-pages/wallet/mcg-coin.png`

其余 `6/7/8/9/10/17/18/19/20/21` 仍保留旧 Vue 兼容映射。

### 控制真实链上支付参数的是谁

真实链上支付用到的是：

- `currency`
- `chainCurrency`
- `sub_currency`

它们提供：

- `contract_address`
- `decimals`
- `name`
- `chain_id`
- `amount`

也就是说：

- `system_currency_id` 更偏 UI 映射
- `currency / chainCurrency / sub_currency` 更偏真实支付数据

## 7. 支付确认后的完整执行流程

### 7.1 统一入口

支付确认入口在：

- `OrdersPage.handleConfirmPay()`

流程如下：

1. 调用 `payPreOrder`
2. 如果 `method.type === 1`，流程到此结束
3. 如果 `method.type === 2`，继续执行 `handleChainPayment()`
4. 链上支付完成后刷新订单列表

### 7.2 系统余额支付流程

系统余额支付由服务端完成扣款：

1. 前端调用 `POST /preOrder/pay`
2. `payment_methods` 传 `1`
3. 服务端处理系统余额扣款
4. 前端只负责刷新列表和提示结果

前端不会再发起链上交易。

### 7.3 链上支付流程

链上支付流程：

1. 前端调用 `POST /preOrder/pay`
2. `payment_methods` 传 `2`
3. 服务端返回：
   - `order_no`
   - `amount`
   - `currency`
   - `sub_currency`
4. 前端根据返回内容决定走 BSC、NADI 还是 PYTHIA
5. 拉起钱包发送链上交易

实际调用：

```ts
executePendingOrderChainPayment({
  paymentInfo: {
    currency: result.currency ?? paymentInfo?.currency ?? paymentInfo?.chainCurrency ?? null,
    sub_currency: result.sub_currency ?? paymentInfo?.sub_currency ?? null,
  },
  amount: result.amount,
  orderNo: result.order_no,
  paymentType: method.payment,
})
```

## 8. NADI / PYTHIA 原生链支付流程

NADI / PYTHIA 当前都走 `rechargeOne(address,uint256,string)` 这条原生链支付分支。

对应执行函数：

- `executeNadiPayment()`
- `executePythiaPayment()`

充值合约地址：

- `0x34A41001889Eeb080ce8ad7fA50252b5138D30Df`

说明：

- 当前仓库没有发现单独的 PYTHIA 前端实现或独立充值合约配置
- React 现阶段按和 NADI 一致的充值流程接入 `9777`
- `wallet_addEthereumChain` 对 `9777` 使用 `0x2631 / PYTHIA / https://rpc-pythia.naaidepin.co/`
- 如果后端后续给出专属 RPC / 浏览器 / 合约地址，应优先替换 `src/features/old-pages/services/evm.ts`

### 8.1 执行步骤

1. 请求钱包账户 `eth_requestAccounts`
2. 检查当前链必须是目标链
   - NADI 为 `399`
   - PYTHIA 为 `9777`
3. 判断支付币种是目标链原生币还是链上代币
4. 检查余额是否足够
5. 如果是 ERC20，先 `approve`
6. 调用充值合约：

```solidity
rechargeOne(address token, uint256 amount, string orderNo)
```

### 8.2 原生币支付

如果判定为原生币：

- `tokenAddress` 传 `ZERO_ADDRESS`
- `eth_sendTransaction` 时 `value = amount`

### 8.3 ERC20 支付

如果判定为 ERC20：

1. 先检查 `balanceOf`
2. 再检查 / 补足 `allowance`
3. 调用合约时 `value = 0`

## 9. BSC 支付流程

BSC 支付执行函数：

- `executeBscPayment()`

充值合约地址：

- `0x34A41001889Eeb080ce8ad7fA50252b5138D30Df`

### 9.1 执行步骤

1. 请求钱包账户
2. 检查当前链必须是 `56`
3. 读取主支付币 `currency`
4. 检查主币余额
5. 对主币执行 `approve`
6. 根据 `paymentType` 决定单币还是双币
7. 调用充值合约 `recharge(string,bytes)`

### 9.2 单币支付

当 `paymentType === 'chain_usdt'` 时：

- 只使用主币 `currency`
- ABI key 为 `single`

编码参数：

```ts
['address', 'uint256', 'string']
```

对应数据：

```ts
[mainCurrency.contract_address, mainAmount, orderNo]
```

### 9.3 双币支付

当 `paymentType === 'chain_usdt_spa'` 时：

- 主币来自 `currency`
- 副币来自 `sub_currency`
- `sub_currency.amount` 为副币应支付数量

执行步骤：

1. 校验 `sub_currency.contract_address`
2. 校验 `sub_currency.amount`
3. 检查副币余额
4. 对副币执行 `approve`
5. ABI key 改为 `double`

编码参数：

```ts
['address', 'uint256', 'address', 'uint256', 'string']
```

对应数据：

```ts
[
  mainCurrency.contract_address,
  mainAmount,
  subCurrency.contract_address,
  subAmount,
  orderNo,
]
```

## 10. 代币余额与授权判定

### 10.1 ERC20 余额

读取方式：

- `balanceOf(address)`

对应函数：

- `getErc20Balance(tokenAddress, owner)`

### 10.2 ERC20 授权

读取方式：

- `allowance(owner, spender)`

对应函数：

- `getErc20Allowance(tokenAddress, owner, spender)`

### 10.3 不足时自动授权

前端会在支付前自动补足授权：

```ts
approve(spender, MAX_UINT256)
```

当前授权上限：

- `MAX_UINT256`

对应函数：

- `approveErc20Token()`

逻辑：

1. 如果当前 `allowance >= minimumAmount`，则跳过
2. 否则发起一次 `approve`
3. 等待交易回执后继续充值交易

## 11. 当前页面上的展示判定

支付弹窗中每个支付项的 UI 状态来自以下条件：

### 11.1 是否需要切链

```ts
method.needSwitchChain
```

如果为 `true`：

- 不允许直接确认支付
- 先展示“切换到 xxx”按钮

### 11.2 是否余额足够

```ts
method.available
```

系统余额支付不足时：

- 仍展示该支付方式
- 但确认支付按钮会禁用

链上支付时：

- 当前实现允许先选中
- 最终能否支付还要看是否已经切到正确链

### 11.3 确认按钮可用条件

```ts
Boolean(
  selectedMethod &&
  !selectedMethod.needSwitchChain &&
  (selectedMethod.available || selectedMethod.type === 2)
)
```

说明：

- 系统余额支付必须余额充足
- 链上支付只要链正确即可点确认
- 链上余额不足的最终错误，会在实际交易前再次校验并报错

## 12. 当前实现的限制与建议

### 12.1 `9777` 的 RPC / explorer 仍需最终确认

当前代码已经把：

- 链 ID `9777`
- 链名 `PYTHIA`
- Hex 链 ID `0x2631`

接入到 React 支付链路里。

但由于仓库内没有旧 Vue 对应实现，以下配置目前属于前端保守补齐：

- `rpcUrls: ['https://rpc-pythia.naaidepin.co/']`
- `blockExplorerUrls: ['https://explorer.naaidepin.co']`

如果服务端或钱包侧已有正式配置，应以正式配置为准。

如果服务端后续返回其它 `chain_id`，当前 React 不会生成链上支付方式。

### 12.2 链上支付只覆盖 EVM 钱包

当前实现完全依赖：

- `window.ethereum`

因此：

- 必须是注入式 EVM 钱包
- 还没有接 wagmi / viem 这类更完整的多钱包层

### 12.3 币种名映射仍是前端静态表

订单列表和待支付弹窗里，`system_currency_id -> 名称/图片` 目前仍是前端映射。

当前主业务映射为：

- `1 -> USDT -> usdt-coin.png`
- `2 -> PYTHIA -> pyt-coin.png`
- `3 -> MCG -> mcg-coin.png`

这套映射只负责 UI 展示，不参与真实链上合约调用。

兼容旧币种时，当前仍保留：

- `6 -> VIC`
- `7 -> CW`
- `8 -> FBB`
- `9 -> KITI`
- `10 -> NAAU`
- `17 -> VIC`
- `18 -> CW`
- `19 -> FBB`
- `20 -> KITI`
- `21 -> NAAU`

如果服务端后续增加币种，建议把这个映射也改成接口化。

### 12.4 链上支付成功后的结果确认仍偏轻

当前前端做了：

- 发起链上交易
- 返回交易哈希
- 刷新订单列表

但没有做：

- 交易回执后的更细粒度状态展示
- 区块确认数提示
- 链上失败重试引导

如果后面要把支付体验做得更稳，建议再补一层交易状态页或轮询。

## 13. 适合后续商城复用的部分

这套实现已经具备抽成共享支付层的基础，后续商城固定金额支付可以直接复用：

- 订单页列表展示模式
- `PendingOrderPaymentModal`
- `useChainPayment`
- `evm.ts`
- `payPreOrder` 后接链上支付的流程

商城和销毁挖矿的差异主要只在：

- 预下单前的业务参数不同
- 是否需要先输入金额
- 支付方式来源字段不同

支付确认后的链判定、余额判定、授权、充值交易流程可以保持一致。
