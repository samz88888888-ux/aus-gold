export type ApiResponse<T = unknown> = {
  code: number
  message: string
  data: T
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
}

export type PaymentMethod = {
  id: number
  name: string
  icon: string
  type: string
}

export type MiningLogItem = {
  id: number
  type: string
  type_text: string
  amount: string
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
}

export type GoldProductDetail = GoldProduct & {
  content: string
  agreement: string
  images: string[]
  specs: { label: string; value: string }[]
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

export type PreOrderItem = {
  id: number
  order_no: string
  order_type: string
  order_type_text: string
  amount: string
  status: number
  status_text: string
  created_at: string
  expire_at: string
  payment_methods: PaymentMethod[]
}

export type UserInfo = {
  code: string
  name: string
  wallet_address: string
  zhi_num: number
  team_num: number
  me_performance: number
  team_performance: number
  level_id: number
  level_name: string
  valid_user_power: number
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

export type ShopOrderInfo = {
  goods_id: number
  goods_name: string
  goods_image: string
  price: string
  quantity: number
  total_amount: string
  address_id?: number
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
