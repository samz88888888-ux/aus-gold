export type ApiResponse<T = unknown> = {
  code: number
  message: string
  data: T
}

export type CurrencyInfo = {
  id?: number
  name?: string
  chain_id?: number
  contract_address?: string
  decimals?: number
  amount?: number | string
}

export type PaymentMethodExtend = {
  system_currency_id?: number
  primary_system_currency_id?: number
  secondary_system_currency_id?: number
  [key: string]: unknown
}

export type PaymentMethod = {
  id: number
  name: string
  icon?: string
  type?: string | number
  pay_type?: number
  extend?: PaymentMethodExtend
  [key: string]: unknown
}

export type MachineItem = {
  id: number
  name: string
  power: string
  status: string
  status_text: string
  created_at: string
  image: string
  daily_income: string
  total_income: string
  expire_at: string
}

export type DestoryInfo = {
  min_amount: number
  price: number
  naau_price: number
  payment: PaymentMethod[]
  naau_payment: PaymentMethod[]
  currency?: CurrencyInfo | null
}

export type MiningLogItem = {
  id: number
  power: number
  power_type: number
  created_at: string
  remark: string
}

export type MiningLogResponse = {
  list: MiningLogItem[]
  total: number
  current_page: number
  last_page: number
}

export type GoldCategory = {
  id: number
  name: string
  image: string
}

export type GoldProduct = {
  id: number
  name: string
  price: string
  image: string
  description: string
  stock: number
  sales: number
  category_id: number
  is_purchased: boolean
  weight: string
  purity: string
  img?: string
}

export type GoldSkuInfo = {
  price: number | string
  stock: number
  unique?: string
  [key: string]: unknown
}

export type PagedList<T> = {
  list: T[]
  total: number
  current_page?: number
  last_page?: number
}

export type GoldProductDetail = GoldProduct & {
  content: string
  agreement: string
  images: string[]
  specs: { label: string; value: string }[]
  payment?: PaymentMethod[]
  no_payment?: PaymentMethod[]
  handicraft_fee?: number | string
  slider_img?: string[]
  is_sku?: number
  sku_attr_value?: Record<string, GoldSkuInfo>
  gold_order_status?: boolean
}

export type GoldOrderItem = {
  id: number
  order_no: string
  goods_name: string
  goods_image: string
  price: string
  quantity: number
  total_amount: string
  status: number
  status_text: string
  created_at: string
  shipped_at: string | null
  logistics_no: string | null
  weight: string
}

export type OrderReleaseItem = {
  id: number
  order_no: string
  goods_name: string
  release_amount: string
  release_date: string
  status: string
  status_text: string
}

export type BannerItem = {
  id: number
  image: string
  banner?: string
  url: string
}

export type GroupItem = {
  id: number
  name: string
  image: string
  description: string
}

export type GoldPrice = {
  price: string
  change: string
  change_rate: string
}

export type PreOrderPaymentItem = {
  id: number
  system_currency_id?: number
  radio_rate?: number | string
  total_amount?: number | string
  status: number
  name?: string
  icon?: string
  [key: string]: unknown
}

export type PreOrderSourceInfo = {
  title?: string
  name?: string
}

export type PreOrderItem = {
  id: number
  order_no: string
  order_type: string | number
  order_type_text?: string
  amount?: string
  total_amount?: string
  status: number
  status_text: string
  created_at: string
  expire_at: string
  payment?: PreOrderPaymentItem[]
  payment_methods?: PaymentMethod[]
  equipment_source?: PreOrderSourceInfo | null
  node_source?: PreOrderSourceInfo | null
  gold_source?: PreOrderSourceInfo | null
}

export type PreOrderListResponse = PagedList<PreOrderItem>

export type PreOrderPaymentInfo = {
  ac_amount: number | string
  price: number | string
  total_amount: number | string
  payment_methods: number
  system_currency_id?: number
  systemAmount?: number | string
  chainCurrency?: CurrencyInfo | null
  currency?: CurrencyInfo | null
  sub_currency?: CurrencyInfo | null
  amount?: number | string
  order_no?: string
}

export type PreOrderPayResponse = {
  currency?: CurrencyInfo | null
  sub_currency?: CurrencyInfo | null
  amount: number | string
  order_no: string
}

export type PendingOrderTips = {
  exists: boolean
}

export type ResolvedPendingPaymentMethod = {
  id: number
  type: 1 | 2
  system_currency_id?: number
  name: string
  currency: string
  icon?: string
  balance: number
  available: boolean
  payment: string
  isChainMatch?: boolean
  targetChainId?: number
  targetChainName?: string
  needSwitchChain?: boolean
  chainInfo?: CurrencyInfo | null
}

export type UserInfo = {
  code: string
  name: string
  address?: string
  wallet_address: string
  zhi_num: number
  team_num: number
  me_performance: number
  team_performance: number
  level_id: number
  level_name: string
  valid_user_power: number
  power: number
  usdt?: number | string
  usdt_mine?: number | string
  gold_order_status?: boolean
}

export type WalletMoneyLogItem = {
  id: number
  title?: string
  type_text?: string
  amount?: number | string
  currency?: string
  created_at: string
  remark?: string
}

export type TeamMember = {
  id: number
  address: string
  zhi_num: number
  team_num: number
  created_at: string
  level_name: string
  performance: number
}

export type UnionMiningConfig = {
  id: number
  name: string
  min_amount: number
  max_amount: number
  daily_rate: string
  duration: number
  icon: string
}

export type ShopOrderDraft = {
  product: {
    id: number
    name: string
    img: string
    payment?: PaymentMethod[]
    no_payment?: PaymentMethod[]
    handicraft_fee?: number | string
  }
  quantity: number
  selectedSkuValue: string | null
  skuInfo: GoldSkuInfo | null
  price: number | string
  totalPrice: string
}

export type AddressItem = {
  id: number
  real_name: string
  phone: string
  province: string
  city: string
  district: string
  address: string
  is_default: number
}

export type AddressFormData = {
  real_name: string
  phone: string
  province: string
  city: string
  district: string
  address: string
  is_default: number
}
