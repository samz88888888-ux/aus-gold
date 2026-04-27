import type {
  MachineItem, DestoryInfo, MiningLogItem, MiningLogResponse,
  GoldCategory, GoldProduct, GoldProductDetail, GoldOrderItem,
  OrderReleaseItem, BannerItem, GroupItem, GoldPrice,
  PreOrderItem, PreOrderPaymentInfo, PreOrderPayResponse,
  UserInfo, TeamMember, UnionMiningConfig,
  AddressItem,
} from './types'

export const machineList: MachineItem[] = [
  { id: 1, name: 'NAAI-S1', power: '100 TH/s', status: 'active', status_text: '运行中', created_at: '2025-03-15', image: '/old-pages/ming/ming-list-bg.png', daily_income: '12.50', total_income: '1,250.00', expire_at: '2026-03-15' },
  { id: 2, name: 'NAAI-S2', power: '200 TH/s', status: 'active', status_text: '运行中', created_at: '2025-04-01', image: '/old-pages/ming/ming-list-bg.png', daily_income: '25.00', total_income: '2,100.00', expire_at: '2026-04-01' },
  { id: 3, name: 'NAAI-PRO', power: '500 TH/s', status: 'expired', status_text: '已到期', created_at: '2024-06-10', image: '/old-pages/ming/ming-list-bg.png', daily_income: '0', total_income: '18,250.00', expire_at: '2025-06-10' },
]

export const destoryInfo: DestoryInfo = {
  min_amount: 100,
  price: 0.85,
  naau_price: 1.2,
  currency: { name: 'MCG' },
  payment: [
    { id: 1, name: 'USDT', icon: '', type: 'usdt', pay_type: 1, extend: { system_currency_id: 1 } },
    { id: 2, name: 'NADI+MCG', icon: '', type: 'nadi', pay_type: 2, extend: { primary_system_currency_id: 2, secondary_system_currency_id: 5 } },
  ],
  naau_payment: [{ id: 3, name: 'NAAU', icon: '', type: 'naau', pay_type: 1, extend: { system_currency_id: 10 } }],
}

const miningLogs: MiningLogItem[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  power: +(Math.random() * 100 * (i % 3 === 2 ? -1 : 1)).toFixed(4),
  power_type: (i % 6) + 1,
  created_at: `2025-04-${String(20 - i).padStart(2, '0')} 12:00:00`,
  remark: `算力日志记录 #${i + 1}`,
}))

export const miningLogResponse: MiningLogResponse = { list: miningLogs, total: 50, current_page: 1, last_page: 3 }

export const unionMiningConfigs: UnionMiningConfig[] = [
  { id: 1, name: '基础联合挖矿', min_amount: 100, max_amount: 10000, daily_rate: '0.5%', duration: 30, icon: '' },
  { id: 2, name: '高级联合挖矿', min_amount: 1000, max_amount: 50000, daily_rate: '0.8%', duration: 60, icon: '' },
]

export const bannerList: BannerItem[] = [
  { id: 1, image: 'https://file.naaidepin.com/upload/images/c6135c4990ab6e4f1506d78c4eaa0ed8.png', url: '' },
]

export const groupList: GroupItem[] = [
  { id: 1, name: '黄金专区', image: '/old-pages/shop/shop-banner.png', description: '精选黄金产品' },
  { id: 2, name: '铂金专区', image: '/old-pages/shop/shop-banner.png', description: '铂金臻品' },
]

export const categoryList: GoldCategory[] = [
  { id: 1, name: '金条', image: '/old-pages/shop/slide-ring.png' },
  { id: 2, name: '金币', image: '/old-pages/shop/slide-ring1.png' },
  { id: 3, name: '首饰', image: '/old-pages/shop/slide-choose.png' },
]

export const productList: GoldProduct[] = [
  { id: 16, name: '50g投资金条', price: '28,800', image: '/old-pages/shop/ring-cycle.png', description: '999.9纯金投资金条', stock: 100, sales: 56, category_id: 1, is_purchased: false, weight: '50g', purity: '999.9' },
  { id: 17, name: '100g投资金条', price: '57,600', image: '/old-pages/shop/ring-cycle.png', description: '999.9纯金投资金条', stock: 50, sales: 23, category_id: 1, is_purchased: true, weight: '100g', purity: '999.9' },
  { id: 18, name: '黄金转运珠手链', price: '3,200', image: '/old-pages/shop/slide-ring.png', description: '足金转运珠手链', stock: 200, sales: 189, category_id: 3, is_purchased: false, weight: '5g', purity: '999' },
  { id: 19, name: '1oz金币', price: '15,800', image: '/old-pages/shop/slide-ring1.png', description: '纪念金币', stock: 30, sales: 12, category_id: 2, is_purchased: false, weight: '31.1g', purity: '999.9' },
]

export const productDetail: GoldProductDetail = {
  id: 16, name: '50g投资金条', price: '28,800', image: '/old-pages/shop/ring-cycle.png',
  description: '999.9纯金投资金条，国际认证', stock: 100, sales: 56, category_id: 1,
  is_purchased: false, weight: '50g', purity: '999.9',
  content: '<p>本产品为999.9纯金投资金条，重量50克，附带国际认证证书。</p>',
  agreement: '购买协议：本协议确认您已了解黄金投资风险，同意按照平台规则进行交易。黄金价格受市场波动影响，投资需谨慎。购买后将按照约定周期进行释放。',
  images: ['/old-pages/shop/ring-cycle.png', '/old-pages/shop/slide-ring.png'],
  specs: [{ label: '重量', value: '50g' }, { label: '纯度', value: '999.9' }, { label: '认证', value: '国际认证' }],
  img: '/old-pages/shop/ring-cycle.png',
  slider_img: ['/old-pages/shop/ring-cycle.png', '/old-pages/shop/slide-ring.png'],
  handicraft_fee: '20.00',
  payment: [{ id: 11, name: 'USDT', pay_type: 1, extend: { system_currency_id: 1 } }],
  no_payment: [{ id: 12, name: 'NADI', pay_type: 1, extend: { system_currency_id: 2 } }],
  is_sku: 2,
  sku_attr_value: {
    '标准款': { price: '28800', stock: 20, unique: 'sku-std' },
    '典藏款': { price: '29800', stock: 10, unique: 'sku-pro' },
  },
}

export const goldOrderList: GoldOrderItem[] = [
  { id: 1, order_no: 'GD20250401001', goods_name: '50g投资金条', goods_image: '/old-pages/shop/ring-cycle.png', price: '28,800', quantity: 1, total_amount: '28,800', status: 1, status_text: '待发货', created_at: '2025-04-01 10:30:00', shipped_at: null, logistics_no: null, weight: '50g' },
  { id: 2, order_no: 'GD20250320002', goods_name: '黄金转运珠手链', goods_image: '/old-pages/shop/slide-ring.png', price: '3,200', quantity: 2, total_amount: '6,400', status: 2, status_text: '已发货', created_at: '2025-03-20 14:20:00', shipped_at: '2025-03-22 09:00:00', logistics_no: 'SF1234567890', weight: '10g' },
  { id: 3, order_no: 'GD20250310003', goods_name: '100g投资金条', goods_image: '/old-pages/shop/ring-cycle.png', price: '57,600', quantity: 1, total_amount: '57,600', status: 3, status_text: '已完成', created_at: '2025-03-10 08:15:00', shipped_at: '2025-03-12 10:00:00', logistics_no: 'YT9876543210', weight: '100g' },
]

export const orderReleaseList: OrderReleaseItem[] = [
  { id: 1, order_no: 'GD20250401001', goods_name: '50g投资金条', release_amount: '960.00', release_date: '2025-04-15', status: 'released', status_text: '已释放' },
  { id: 2, order_no: 'GD20250401001', goods_name: '50g投资金条', release_amount: '960.00', release_date: '2025-04-30', status: 'pending', status_text: '待释放' },
  { id: 3, order_no: 'GD20250320002', goods_name: '黄金转运珠手链', release_amount: '213.33', release_date: '2025-04-20', status: 'released', status_text: '已释放' },
]

export const goldPrice: GoldPrice = { price: '576.00', change: '+3.20', change_rate: '+0.56%' }

export const preOrderList: PreOrderItem[] = [
  {
    id: 1,
    order_no: 'PO20250420001',
    order_type: 3,
    order_type_text: '销毁挖矿',
    amount: '500.00',
    total_amount: '500.00',
    status: 1,
    status_text: '待支付',
    created_at: '2025-04-20 15:30:00',
    expire_at: '2025-04-20 16:30:00',
    payment: [{ id: 101, system_currency_id: 2, radio_rate: '100', total_amount: '425', status: 1 }],
  },
  {
    id: 2,
    order_no: 'PO20250418002',
    order_type: 5,
    order_type_text: '黄金购买',
    amount: '28800.00',
    total_amount: '28800.00',
    status: 1,
    status_text: '待支付',
    created_at: '2025-04-18 10:00:00',
    expire_at: '2025-04-18 11:00:00',
    payment: [{ id: 102, system_currency_id: 1, radio_rate: '100', total_amount: '28800', status: 1 }],
    gold_source: { title: '50g投资金条' },
  },
]

export const preOrderPaymentInfo: PreOrderPaymentInfo = {
  ac_amount: '425',
  price: '0.85',
  total_amount: '500',
  payment_methods: 3,
  system_currency_id: 2,
  systemAmount: '300',
  chainCurrency: {
    name: 'NADI',
    chain_id: 399,
    contract_address: '0x1000000000000000000000000000000000000000',
    decimals: 18,
  },
}

export const preOrderPayResponse: PreOrderPayResponse = {
  amount: '425',
  order_no: 'PO20250420001',
  currency: {
    name: 'NADI',
    chain_id: 399,
    contract_address: '0x1000000000000000000000000000000000000000',
    decimals: 18,
  },
}

export const machineOrderList: GoldOrderItem[] = [
  { id: 10, order_no: 'MC20250401001', goods_name: 'NAAI-S1 矿机', goods_image: '/old-pages/ming/ming-list-bg.png', price: '1,000', quantity: 1, total_amount: '1,000', status: 2, status_text: '已发货', created_at: '2025-04-01 10:30:00', shipped_at: '2025-04-03 09:00:00', logistics_no: 'SF1111111111', weight: '' },
]

export const userInfoData: UserInfo = {
  code: 'A8B2C1', name: 'User_0x3f...a1b2', wallet_address: '0x3f4e5d6c7b8a9012345678901234567890a1b2c3',
  zhi_num: 12, team_num: 156, me_performance: 25000, team_performance: 380000,
  level_id: 3, level_name: 'VIP3', valid_user_power: 1250.5,power: 0, gold_order_status: false,
}

export const teamList: TeamMember[] = [
  { id: 1, address: '0x1234...5678', zhi_num: 5, team_num: 23, created_at: '2025-01-15', level_name: 'VIP1', performance: 8500 },
  { id: 2, address: '0xabcd...ef01', zhi_num: 8, team_num: 45, created_at: '2025-02-20', level_name: 'VIP2', performance: 15200 },
  { id: 3, address: '0x9876...5432', zhi_num: 3, team_num: 12, created_at: '2025-03-10', level_name: 'VIP1', performance: 5600 },
  { id: 4, address: '0xfedc...ba98', zhi_num: 15, team_num: 89, created_at: '2024-12-05', level_name: 'VIP3', performance: 42000 },
  { id: 5, address: '0x2468...1357', zhi_num: 2, team_num: 8, created_at: '2025-04-01', level_name: 'VIP1', performance: 3200 },
]

export const addressList: AddressItem[] = [
  { id: 1, real_name: '张三', phone: '13800138000', province: '广东省', city: '深圳市', district: '南山区', address: '科技园路1号创维大厦A座18楼', is_default: 1 },
  { id: 2, real_name: '李四', phone: '13900139000', province: '北京市', city: '北京市', district: '朝阳区', address: '望京SOHO T3 12层', is_default: 0 },
  { id: 3, real_name: '王五', phone: '13700137000', province: '上海市', city: '上海市', district: '浦东新区', address: '陆家嘴环路1000号恒生银行大厦', is_default: 0 },
]
