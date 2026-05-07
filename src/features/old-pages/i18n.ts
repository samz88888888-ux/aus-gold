import { useContext } from 'react'

import type { LanguageCode } from '../figma/types'
import { OldPageHeaderContext } from './components/OldPageHeaderContext'

type OldPagesCopy = {
  tabHome: string
  tabMining: string
  tabShop: string
  tabWallet: string
  tabInvite: string
  noticeTitle: string
  noticeConfirm: string
  destroyMining: string
  destroyMinAmount: string
  currentPrice: string
  payWithNadi: string
  payWithNaau: string
  inputDestroyAmount: string
  inputUsdtAmount: string
  paymentAmount: string
  autoConvertedPaymentAmount: string
  confirmDestroy: string
  paymentMethod: string
  orderAmount: string
  mixedPayment: string
  singlePayment: string
  confirmPayment: string
  pendingOrder: string
  totalPayment: string
  unitPrice: string
  amountToPay: string
  systemBalance: string
  onChainPayment: string
  networkMismatch: string
  insufficientBalance: string
  availableBalance: string
  switchChainRequired: string
  payable: string
  serverBalancePaymentHint: string
  walletPaymentHint: string
  switchToNetwork: string
  miningCenter: string
  cumulativePower: string
  miningLog: string
  miningEngine: string
  coreMiningZone: string
  livePreview: string
  quickAccess: string
  quickAction: string
  destroyMiningDescription: string
  createOrderLoading: string
  choosePaymentMethod: string
  orderCreated: string
  goToOrders: string
  noPaymentMethods: string
  fetchPaymentMethodsFailed: string
  createDestroyOrderFailed: string
  myMiningMachines: string
  deviceList: string
  deviceListDescription: string
  deviceActivated: string
  destroyedMiner: string
  unionMiner: string
  nodeMiner: string
  loading: string
  noMachines: string
  running: string
  expired: string
  power: string
  dailyIncome: string
  totalIncome: string
  expireTime: string
  miningLogTitle: string
  all: string
  reduceIncome: string
  buyNode: string
  transferPower: string
  unknownType: string
  noRecords: string
  noMore: string
  loadMore: string
  filterType: string
  shop: string
  myOrders: string
  viewPurchaseRecords: string
  pendingReleaseRecords: string
  viewReleaseHistory: string
  inventory: string
  noProducts: string
  tryAnotherCategory: string
  productDetail: string
  sold: string
  handiworkFee: string
  specSelection: string
  quantity: string
  commodityDetail: string
  orderSummary: string
  commodityPrice: string
  laborFee: string
  buyNow: string
  goToPendingOrders: string
  continuePendingOrders: string
  noOrders: string
  weight: string
  confirmReceipt: string
  logisticsNo: string
  closeDialog: string
  confirm: string
  cancel: string
  purchaseAgreement: string
  agreeAndBuy: string
  pendingPaymentOrderExists: string
  unpaidOrderHint: string
  goPay: string
  confirmOrder: string
  orderDataMissing: string
  backToShop: string
  selectShippingAddress: string
  orderCreateFailed: string
  productAmount: string
  submitting: string
  payNow: string
  chooseAddress: string
  defaultSpec: string
  remarkInfo: string
  remarkPlaceholder: string
  releaseRecord: string
  noReleaseRecords: string
  releaseAmount: string
  releaseDate: string
  walletPageTitle: string
  myAssets: string
  recharge: string
  account: string
  bridge: string
  withdraw: string
  swap: string
  moneyLog: string
  myTokens: string
  equityPowerValue: string
  currentBalance: string
  fundsRecordTitle: string
  fundsRecordFor: string
  fundsRecordDesc: string
  noFundsRecords: string
  fundChange: string
  filterFundsType: string
  withdrawDeduct: string
  withdrawReturn: string
  income: string
  copy: string
  copySuccess: string
  myTeam: string
  currentUserLevel: string
  inviteCode: string
  inviteLink: string
  directMembers: string
  teamMembers: string
  personalPerformance: string
  teamPerformance: string
  districtPerformance: string
  members: string
  performance: string
  noTeamMembers: string
  }

const oldPagesCopyByLanguage: Record<LanguageCode, OldPagesCopy> = {
  'zh-TW': {
    tabHome: '首頁',
    tabMining: '算力',
    tabShop: '商城',
    tabWallet: '錢包',
    tabInvite: '邀請',
    noticeTitle: '提示',
    noticeConfirm: '我知道了',
    destroyMining: '銷毀挖礦',
    destroyMinAmount: '最低銷毀數量',
    currentPrice: '當前價格',
    payWithNadi: 'NADI 支付',
    payWithNaau: 'NAAU 支付',
    inputDestroyAmount: '輸入銷毀金額',
    inputUsdtAmount: '請輸入 USDT 數量',
    paymentAmount: '需支付數量',
    autoConvertedPaymentAmount: '自動換算支付數量',
    confirmDestroy: '確認銷毀',
    paymentMethod: '支付方式',
    orderAmount: '訂單金額',
    mixedPayment: '混合支付',
    singlePayment: '單幣支付',
    confirmPayment: '確認支付',
    pendingOrder: '待支付訂單',
    totalPayment: '支付總額',
    unitPrice: '單價',
    amountToPay: '需支付',
    systemBalance: '系統餘額',
    onChainPayment: '鏈上支付',
    networkMismatch: '當前錢包網絡不匹配，請切換到 {{network}}',
    insufficientBalance: '餘額不足，當前可用 {{amount}}',
    availableBalance: '可用餘額: {{amount}}',
    switchChainRequired: '需切鏈',
    payable: '可支付',
    serverBalancePaymentHint: '服務端完成系統餘額扣款。',
    walletPaymentHint: '確認後將拉起錢包完成鏈上支付。',
    switchToNetwork: '切換到 {{network}}',
    miningCenter: 'Mining Center',
    cumulativePower: '累計算力 (T)',
    miningLog: '算力日誌',
    miningEngine: 'Mining Engine',
    coreMiningZone: '核心算力區',
    livePreview: 'Live Preview',
    quickAccess: 'Quick Access',
    quickAction: '快捷操作',
    destroyMiningDescription: '輸入 USDT 金額後自動換算支付幣種，建立待支付訂單後前往完成鏈上或餘額支付。',
    createOrderLoading: '正在創建訂單...',
    choosePaymentMethod: '選擇支付方式',
    orderCreated: '下單成功，請前往待支付訂單完成支付',
    goToOrders: '前往訂單',
    noPaymentMethods: '暫無可用支付方式',
    fetchPaymentMethodsFailed: '獲取支付方式失敗',
    createDestroyOrderFailed: '銷毀下單失敗',
    myMiningMachines: '我的礦機',
    deviceList: '設備列表',
    deviceListDescription: '按設備類型查看當前礦機收益與狀態',
    deviceActivated: '激活設備',
    destroyedMiner: '銷毀礦機',
    unionMiner: '聯合礦機',
    nodeMiner: '節點礦機',
    loading: '載入中...',
    noMachines: '暫無礦機',
    running: '運行中',
    expired: '已過期',
    power: '算力',
    dailyIncome: '日收益',
    totalIncome: '總收益',
    expireTime: '到期時間',
    miningLogTitle: '算力日誌',
    all: '全部',
    reduceIncome: '減少收益',
    buyNode: '購買節點',
    transferPower: '轉移算力',
    unknownType: '未知類型',
    noRecords: '暫無記錄',
    noMore: '沒有更多了',
    loadMore: '載入更多',
    filterType: '篩選類型',
    shop: '商城',
    myOrders: '我的訂單',
    viewPurchaseRecords: '查看購買記錄',
    pendingReleaseRecords: '待釋放記錄',
    viewReleaseHistory: '查看釋放歷史',
    inventory: '庫存',
    noProducts: '暫無商品',
    tryAnotherCategory: '換個分類看看吧',
    productDetail: '商品詳情',
    sold: '已售',
    handiworkFee: '工費',
    specSelection: '規格選擇',
    quantity: '數量',
    commodityDetail: '商品詳情',
    orderSummary: 'Order Summary',
    commodityPrice: '商品價',
    laborFee: '工時費',
    buyNow: '立即購買',
    goToPendingOrders: '前往待支付訂單',
    continuePendingOrders: '快速查看並繼續完成未支付訂單',
    noOrders: '暫無訂單',
    weight: '重量',
    confirmReceipt: '確認收貨',
    logisticsNo: '物流單號',
    closeDialog: '關閉',
    confirm: '確認',
    cancel: '取消',
    purchaseAgreement: '購買協議',
    agreeAndBuy: '同意並購買',
    pendingPaymentOrderExists: '存在待支付訂單',
    unpaidOrderHint: '檢測到你有未完成支付的預訂單，可直接前往待支付訂單繼續支付。',
    goPay: '去支付',
    confirmOrder: '確認訂單',
    orderDataMissing: '訂單數據不存在',
    backToShop: '返回商城',
    selectShippingAddress: '請選擇收貨地址',
    orderCreateFailed: '創建訂單失敗',
    productAmount: '商品金額',
    submitting: '提交中...',
    payNow: '立即支付 →',
    chooseAddress: '+ 選擇收貨地址',
    defaultSpec: '默認規格',
    remarkInfo: '備註信息',
    remarkPlaceholder: '選填，請輸入備註信息',
    releaseRecord: '待釋放記錄',
    noReleaseRecords: '暫無釋放記錄',
    releaseAmount: '釋放金額',
    releaseDate: '釋放日期',
    walletPageTitle: '錢包',
    myAssets: '我的資產',
    recharge: '充值',
    account: '賬戶',
    bridge: '跨鏈橋',
    withdraw: '提現',
    swap: '閃兌',
    moneyLog: '資金記錄',
    myTokens: '我的代幣',
    equityPowerValue: '股權算力值',
    currentBalance: '當前餘額',
    fundsRecordTitle: '資金記錄',
    fundsRecordFor: '{{name}} 資金記錄',
    fundsRecordDesc: '按資金類型篩選日誌記錄',
    noFundsRecords: '暫無資金記錄',
    fundChange: '資金變動',
    filterFundsType: '篩選資金類型',
    withdrawDeduct: '提幣扣除',
    withdrawReturn: '提幣退回',
    income: '收益',
    copy: '複製',
    copySuccess: '複製成功',
    myTeam: '我的團隊',
    currentUserLevel: '當前用戶等級',
    inviteCode: '邀請碼',
    inviteLink: '邀請連結',
    directMembers: '直推人數',
    teamMembers: '團隊人數',
    personalPerformance: '個人業績',
    teamPerformance: '團隊業績',
    districtPerformance: '小區業績',
    members: '成員',
    performance: '業績',
    noTeamMembers: '暫無團隊成員',
  },
  en: {
    tabHome: 'Home',
    tabMining: 'Mining',
    tabShop: 'Shop',
    tabWallet: 'Wallet',
    tabInvite: 'Invite',
    noticeTitle: 'Notice',
    noticeConfirm: 'Got it',
    destroyMining: 'Destroy Mining',
    destroyMinAmount: 'Minimum destroy amount',
    currentPrice: 'Current price',
    payWithNadi: 'Pay with NADI',
    payWithNaau: 'Pay with NAAU',
    inputDestroyAmount: 'Enter destroy amount',
    inputUsdtAmount: 'Enter USDT amount',
    paymentAmount: 'Payment amount',
    autoConvertedPaymentAmount: 'Auto converted payment amount',
    confirmDestroy: 'Confirm destroy',
    paymentMethod: 'Payment method',
    orderAmount: 'Order amount',
    mixedPayment: 'Mixed payment',
    singlePayment: 'Single-token payment',
    confirmPayment: 'Confirm payment',
    pendingOrder: 'Pending order',
    totalPayment: 'Total payment',
    unitPrice: 'Unit price',
    amountToPay: 'Amount to pay',
    systemBalance: 'System balance',
    onChainPayment: 'On-chain payment',
    networkMismatch: 'Current wallet network does not match. Switch to {{network}}',
    insufficientBalance: 'Insufficient balance. Available {{amount}}',
    availableBalance: 'Available balance: {{amount}}',
    switchChainRequired: 'Switch chain',
    payable: 'Payable',
    serverBalancePaymentHint: 'The server will complete the system balance deduction.',
    walletPaymentHint: 'After confirmation, the wallet will open for on-chain payment.',
    switchToNetwork: 'Switch to {{network}}',
    miningCenter: 'Mining Center',
    cumulativePower: 'Total Power (T)',
    miningLog: 'Mining Logs',
    miningEngine: 'Mining Engine',
    coreMiningZone: 'Core Mining Zone',
    livePreview: 'Live Preview',
    quickAccess: 'Quick Access',
    quickAction: 'Main Action',
    destroyMiningDescription: 'Enter a USDT amount to auto-convert the payment token, then create a pending order and complete on-chain or balance payment.',
    createOrderLoading: 'Creating order...',
    choosePaymentMethod: 'Choose payment method',
    orderCreated: 'Order created. Please complete payment in pending orders.',
    goToOrders: 'Go to orders',
    noPaymentMethods: 'No payment methods available',
    fetchPaymentMethodsFailed: 'Failed to fetch payment methods',
    createDestroyOrderFailed: 'Failed to create destroy order',
    myMiningMachines: 'My Mining Machines',
    deviceList: 'Device List',
    deviceListDescription: 'View current mining revenue and status by device type',
    deviceActivated: 'Activated Device',
    destroyedMiner: 'Destroyed Miner',
    unionMiner: 'Union Miner',
    nodeMiner: 'Node Miner',
    loading: 'Loading...',
    noMachines: 'No machines',
    running: 'Running',
    expired: 'Expired',
    power: 'Power',
    dailyIncome: 'Daily income',
    totalIncome: 'Total income',
    expireTime: 'Expire time',
    miningLogTitle: 'Mining Logs',
    all: 'All',
    reduceIncome: 'Reduced income',
    buyNode: 'Buy node',
    transferPower: 'Transfer power',
    unknownType: 'Unknown type',
    noRecords: 'No records',
    noMore: 'No more',
    loadMore: 'Load more',
    filterType: 'Filter Type',
    shop: 'Shop',
    myOrders: 'My Orders',
    viewPurchaseRecords: 'View purchase history',
    pendingReleaseRecords: 'Pending release records',
    viewReleaseHistory: 'View release history',
    inventory: 'Inventory',
    noProducts: 'No products',
    tryAnotherCategory: 'Try another category',
    productDetail: 'Product Detail',
    sold: 'Sold',
    handiworkFee: 'Craft fee',
    specSelection: 'Specification',
    quantity: 'Quantity',
    commodityDetail: 'Product Details',
    orderSummary: 'Order Summary',
    commodityPrice: 'Product price',
    laborFee: 'Labor fee',
    buyNow: 'Buy now',
    goToPendingOrders: 'Go to pending orders',
    continuePendingOrders: 'Quickly review and continue unpaid orders',
    noOrders: 'No orders',
    weight: 'Weight',
    confirmReceipt: 'Confirm receipt',
    logisticsNo: 'Tracking No.',
    closeDialog: 'Close',
    confirm: 'Confirm',
    cancel: 'Cancel',
    purchaseAgreement: 'Purchase Agreement',
    agreeAndBuy: 'Agree and Buy',
    pendingPaymentOrderExists: 'Pending payment order found',
    unpaidOrderHint: 'An unpaid pre-order was detected. You can go directly to pending orders to continue payment.',
    goPay: 'Pay now',
    confirmOrder: 'Confirm Order',
    orderDataMissing: 'Order data is missing',
    backToShop: 'Back to shop',
    selectShippingAddress: 'Please select a shipping address',
    orderCreateFailed: 'Failed to create order',
    productAmount: 'Product amount',
    submitting: 'Submitting...',
    payNow: 'Pay now →',
    chooseAddress: '+ Select shipping address',
    defaultSpec: 'Default spec',
    remarkInfo: 'Remark',
    remarkPlaceholder: 'Optional, enter remarks',
    releaseRecord: 'Pending Release Records',
    noReleaseRecords: 'No release records',
    releaseAmount: 'Release amount',
    releaseDate: 'Release date',
    walletPageTitle: 'Wallet',
    myAssets: 'My Assets',
    recharge: 'Recharge',
    account: 'Account',
    bridge: 'Bridge',
    withdraw: 'Withdraw',
    swap: 'Swap',
    moneyLog: 'Funds Records',
    myTokens: 'My Tokens',
    equityPowerValue: 'Equity Power Value',
    currentBalance: 'Current balance',
    fundsRecordTitle: 'Funds Records',
    fundsRecordFor: '{{name}} Funds Records',
    fundsRecordDesc: 'Filter logs by fund type',
    noFundsRecords: 'No funds records',
    fundChange: 'Fund change',
    filterFundsType: 'Filter Fund Types',
    withdrawDeduct: 'Withdrawal Deduction',
    withdrawReturn: 'Withdrawal Return',
    income: 'Income',
    copy: 'Copy',
    copySuccess: 'Copied',
    myTeam: 'My Team',
    currentUserLevel: 'Current User Level',
    inviteCode: 'Invite Code',
    inviteLink: 'Invite Link',
    directMembers: 'Direct Members',
    teamMembers: 'Team Members',
    personalPerformance: 'Personal Performance',
    teamPerformance: 'Team Performance',
    districtPerformance: 'District Performance',
    members: 'Members',
    performance: 'Performance',
    noTeamMembers: 'No team members',
  },
  ko: {} as OldPagesCopy,
  ja: {} as OldPagesCopy,
  th: {} as OldPagesCopy,
  ms: {} as OldPagesCopy,
}

oldPagesCopyByLanguage.ko = oldPagesCopyByLanguage.en
oldPagesCopyByLanguage.ja = oldPagesCopyByLanguage.en
oldPagesCopyByLanguage.th = oldPagesCopyByLanguage.en
oldPagesCopyByLanguage.ms = oldPagesCopyByLanguage.en

export function useOldPagesCopy() {
  const header = useContext(OldPageHeaderContext)
  const code = header?.currentLanguage.code ?? 'zh-TW'
  return getOldPagesCopy(code)
}

export function getOldPagesCopy(code: LanguageCode) {
  return oldPagesCopyByLanguage[code]
}

export function fillTemplate(template: string, values: Record<string, string>) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, value),
    template,
  )
}
