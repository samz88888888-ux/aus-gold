import { appEnv } from '../../../config/env'
import { request } from '../../figma/services/api'
import { getSavedToken } from '../../figma/services/auth'
import type {
  DestoryInfo,
  MiningLogResponse,
  MachineItem,
  GoldCategory,
  GoldProduct,
  GoldProductDetail,
  GoldOrderItem,
  OrderReleaseItem,
  BannerItem,
  GroupItem,
  GoldPrice,
  PreOrderItem,
  PreOrderListResponse,
  PreOrderPaymentInfo,
  PreOrderPayResponse,
  PendingOrderTips,
  UserInfo,
  TeamMember,
  UnionMiningConfig,
  ApiResponse,
  AddressItem,
  AddressFormData,
  PagedList,
  PaymentMethod,
  WalletMoneyLogItem,
  GoldSkuInfo,
  WithdrawApplyPayload,
  WithdrawConfigData,
  WithdrawMinerDetailResponse,
  WithdrawRecordListResponse,
} from './types'
import * as mock from './mock'

const useMock = appEnv.useMock

type QueryParams = Record<string, unknown>

function getToken() {
  return getSavedToken()
}

async function withMockFallback<T>(requestFn: () => Promise<T>, fallbackFn: () => T): Promise<T> {
  try {
    return await requestFn()
  } catch (error) {
    if (useMock) {
      return fallbackFn()
    }
    throw error
  }
}

function normalizePagedList<T>(data: PagedList<T> | T[]): PagedList<T> {
  if (Array.isArray(data)) {
    return {
      list: data,
      total: data.length,
      current_page: 1,
      last_page: 1,
    }
  }

  return {
    list: Array.isArray(data.list) ? data.list : [],
    total: typeof data.total === 'number' ? data.total : 0,
    current_page: data.current_page,
    last_page: data.last_page,
  }
}

function paginateList<T>(list: T[], params?: QueryParams): PagedList<T> {
  const page = Math.max(1, Number(params?.page ?? 1))
  const pageSize = Math.max(1, Number(params?.page_size ?? (list.length || 10)))
  const start = (page - 1) * pageSize
  const pageList = list.slice(start, start + pageSize)

  return {
    list: pageList,
    total: list.length,
    current_page: page,
    last_page: Math.max(1, Math.ceil(list.length / pageSize)),
  }
}

function normalizeBannerList(data: Array<Partial<BannerItem>>): BannerItem[] {
  return data.map((item, index) => ({
    id: typeof item.id === 'number' ? item.id : index + 1,
    image: item.image || item.banner || '',
    banner: item.banner,
    url: item.url || '',
  }))
}

function normalizePaymentMethods(data: unknown): PaymentMethod[] {
  if (!Array.isArray(data)) return []
  return data
    .filter((item): item is PaymentMethod => !!item && typeof item === 'object' && typeof (item as PaymentMethod).id === 'number' && typeof (item as PaymentMethod).name === 'string')
}

function normalizeSkuMap(data: unknown): Record<string, GoldSkuInfo> | undefined {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return undefined
  return Object.entries(data as Record<string, unknown>).reduce<Record<string, GoldSkuInfo>>((acc, [key, value]) => {
    if (!value || typeof value !== 'object') return acc
    const record = value as Record<string, unknown>
    acc[key] = {
      price: typeof record.price === 'number' || typeof record.price === 'string' ? record.price : 0,
      stock: typeof record.stock === 'number' ? record.stock : Number(record.stock ?? 0),
      unique: typeof record.unique === 'string' ? record.unique : undefined,
      ...record,
    }
    return acc
  }, {})
}

function normalizeProductDetail(data: Partial<GoldProductDetail> & { img?: string; slider_img?: string[] }): GoldProductDetail {
  const image = typeof data.image === 'string' && data.image
    ? data.image
    : (typeof data.img === 'string' ? data.img : '')
  const images = Array.isArray(data.images)
    ? data.images.filter((item): item is string => typeof item === 'string' && item.length > 0)
    : []
  const sliderImages = Array.isArray(data.slider_img)
    ? data.slider_img.filter((item): item is string => typeof item === 'string' && item.length > 0)
    : []
  const mergedImages = images.length > 0 ? images : (sliderImages.length > 0 ? sliderImages : (image ? [image] : []))
  const specs = Array.isArray(data.specs)
    ? data.specs
      .filter((item): item is { label: string; value: string } => !!item && typeof item.label === 'string' && typeof item.value === 'string')
    : []

  return {
    id: typeof data.id === 'number' ? data.id : 0,
    name: typeof data.name === 'string' ? data.name : '',
    price: typeof data.price === 'string' ? data.price : String(data.price ?? '0'),
    image,
    description: typeof data.description === 'string' ? data.description : '',
    stock: typeof data.stock === 'number' ? data.stock : Number(data.stock ?? 0),
    sales: typeof data.sales === 'number' ? data.sales : Number(data.sales ?? 0),
    category_id: typeof data.category_id === 'number' ? data.category_id : Number(data.category_id ?? 0),
    is_purchased: Boolean(data.is_purchased),
    weight: typeof data.weight === 'string' ? data.weight : String(data.weight ?? ''),
    purity: typeof data.purity === 'string' ? data.purity : String(data.purity ?? ''),
    content: typeof data.content === 'string' ? data.content : '',
    agreement: typeof data.agreement === 'string' ? data.agreement : '',
    images: mergedImages,
    specs,
    img: image,
    slider_img: sliderImages,
    payment: normalizePaymentMethods(data.payment),
    no_payment: normalizePaymentMethods(data.no_payment),
    handicraft_fee: typeof data.handicraft_fee === 'number' || typeof data.handicraft_fee === 'string'
      ? data.handicraft_fee
      : 0,
    is_sku: typeof data.is_sku === 'number' ? data.is_sku : Number(data.is_sku ?? 0),
    sku_attr_value: normalizeSkuMap(data.sku_attr_value),
  }
}

function normalizePreOrderList(data: PreOrderListResponse | PreOrderItem[]): PreOrderItem[] {
  if (Array.isArray(data)) return data
  return Array.isArray(data.list) ? data.list : []
}

function normalizeWalletMoneyLogList(data: PagedList<WalletMoneyLogItem> | WalletMoneyLogItem[], currency: string): PagedList<WalletMoneyLogItem> {
  const normalized = normalizePagedList(data)

  return {
    ...normalized,
    list: normalized.list.map((item) => {
      const totalValue = Number(item.total ?? item.amount ?? 0)
      const amountValue = item.amount ?? ((item.type === 2 ? -1 : 1) * totalValue)

      return {
        ...item,
        title: item.msg || item.title || item.type_text || '资金变动',
        type_text: item.msg || item.type_text,
        amount: amountValue,
        currency: item.currency || currency,
        remark: item.content || item.remark || item.msg || '',
      }
    }),
  }
}

function normalizeMiningLogResponse(data: MiningLogResponse): MiningLogResponse {
  const list = Array.isArray(data.list) ? data.list : []

  return {
    ...data,
    list: list.map((item) => {
      const totalValue = Number(item.total ?? item.power ?? 0)
      const itemType = Number(item.type ?? 1)
      const normalizedPower = item.power ?? (itemType === 2 ? -totalValue : totalValue)

      return {
        ...item,
        power: Number(normalizedPower || 0),
        power_type: item.power_type ?? item.cate,
        remark: item.remark || item.content || '',
        msg: item.msg || '',
      }
    }),
  }
}

async function apiGet<T>(path: string, params?: QueryParams): Promise<ApiResponse<T>> {
  if (useMock) {
    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 400))
    throw new Error('USE_MOCK')
  }
  return request<T>('GET', path, params, getToken())
}

async function apiPost<T>(path: string, data?: QueryParams): Promise<ApiResponse<T>> {
  if (useMock) {
    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 400))
    throw new Error('USE_MOCK')
  }
  return request<T>('POST', path, data, getToken())
}

// --- 算力模块 ---
export async function fetchMachineList(params?: QueryParams): Promise<MachineItem[]> {
  return withMockFallback(async () => (await apiGet<MachineItem[]>('/machine/machineList', params)).data, () => mock.machineList)
}

export async function fetchDestoryInfo(): Promise<DestoryInfo> {
  return withMockFallback(async () => (await apiGet<DestoryInfo>('/machine/destroyInfo')).data, () => mock.destoryInfo)
}

export async function fetchMiningLog(params?: QueryParams): Promise<MiningLogResponse> {
  return withMockFallback(
    async () => normalizeMiningLogResponse((await apiGet<MiningLogResponse>('/user/powerLog', params)).data),
    () => normalizeMiningLogResponse(mock.miningLogResponse),
  )
}

export async function fetchUnionMiningConfig(): Promise<UnionMiningConfig[]> {
  return withMockFallback(async () => (await apiGet<UnionMiningConfig[]>('/joint/config')).data, () => mock.unionMiningConfigs)
}

// --- 商城模块 ---
export async function fetchMallBanner(params?: QueryParams): Promise<BannerItem[]> {
  return withMockFallback(
    async () => {
      const data = (await apiGet<Array<Partial<BannerItem>>>('/gold/banner', params)).data
      return normalizeBannerList(data)
    },
    () => mock.bannerList,
  )
}

export async function fetchMallBlock(params?: QueryParams): Promise<GroupItem[]> {
  return withMockFallback(async () => (await apiGet<GroupItem[]>('/gold/group', params)).data, () => mock.groupList)
}

export async function fetchCategoryList(params?: QueryParams): Promise<GoldCategory[]> {
  return withMockFallback(async () => (await apiGet<GoldCategory[]>('/gold/categoryList', params)).data, () => mock.categoryList)
}

export async function fetchProductList(params?: QueryParams): Promise<PagedList<GoldProduct>> {
  return withMockFallback(
    async () => {
      const data = (await apiGet<PagedList<GoldProduct> | GoldProduct[]>('/gold/goodsList', params)).data
      return normalizePagedList(data)
    },
    () => ({ list: mock.productList, total: mock.productList.length, current_page: 1, last_page: 1 }),
  )
}

export async function fetchProductDetail(params: { id?: number; goods_id?: number }): Promise<GoldProductDetail> {
  return withMockFallback(
    async () => {
      const goodsId = params.goods_id ?? params.id
      const query: QueryParams = goodsId ? { goods_id: goodsId, id: goodsId } : {}
      const data = (await apiGet<Partial<GoldProductDetail> & { img?: string; slider_img?: string[] }>('/gold/goodsDetail', query)).data
      return normalizeProductDetail(data)
    },
    () => mock.productDetail,
  )
}

export async function fetchGoldOrderList(params?: QueryParams): Promise<{ list: GoldOrderItem[]; total: number }> {
  return withMockFallback(
    async () => (await apiGet<{ list: GoldOrderItem[]; total: number }>('/gold/orderList', params)).data,
    () => ({ list: mock.goldOrderList, total: mock.goldOrderList.length }),
  )
}

export async function fetchOrderReleaseList(params?: QueryParams): Promise<{ list: OrderReleaseItem[]; total: number }> {
  return withMockFallback(
    async () => (await apiGet<{ list: OrderReleaseItem[]; total: number }>('/gold/releaseOrderList', params)).data,
    () => ({ list: mock.orderReleaseList, total: mock.orderReleaseList.length }),
  )
}

export async function fetchTodayGoldPrice(): Promise<GoldPrice> {
  return withMockFallback(async () => (await apiGet<GoldPrice>('/gold/price')).data, () => mock.goldPrice)
}

export async function fetchGoldProductConfirm(data: QueryParams): Promise<QueryParams> {
  return withMockFallback(async () => (await apiPost<QueryParams>('/gold/receipt', data)).data, () => ({ success: true }))
}

// --- 订单模块 ---
export async function fetchPreOrderList(params?: QueryParams): Promise<PreOrderItem[]> {
  return withMockFallback(
    async () => {
      const data = (await apiGet<PreOrderListResponse | PreOrderItem[]>('/preOrder/preOrderList', params)).data
      return normalizePreOrderList(data)
    },
    () => mock.preOrderList,
  )
}

export async function fetchMachineOrderList(params?: QueryParams): Promise<{ list: GoldOrderItem[]; total: number }> {
  return withMockFallback(
    async () => (await apiGet<{ list: GoldOrderItem[]; total: number }>('/machine/orderList', params)).data,
    () => ({ list: mock.machineOrderList, total: mock.machineOrderList.length }),
  )
}

export async function cancelPreOrder(params: QueryParams): Promise<void> {
  return withMockFallback(async () => {
    await apiPost('/preOrder/cancel', params)
  }, () => undefined)
}

export async function createPreOrder(data: QueryParams): Promise<QueryParams> {
  return withMockFallback(
    async () => (await apiPost<QueryParams>('/preOrder/preOrder', data)).data,
    () => ({ success: true }),
  )
}

export async function fetchPreOrderPaymentInfo(params: QueryParams): Promise<PreOrderPaymentInfo> {
  return withMockFallback(
    async () => (await apiGet<PreOrderPaymentInfo>('/preOrder/getPreOrderPayment', params)).data,
    () => mock.preOrderPaymentInfo,
  )
}

export async function payPreOrder(params: QueryParams): Promise<PreOrderPayResponse> {
  return withMockFallback(
    async () => (await apiPost<PreOrderPayResponse>('/preOrder/pay', params)).data,
    () => mock.preOrderPayResponse,
  )
}

export async function fetchPreOrderTips(params?: QueryParams): Promise<PendingOrderTips> {
  return withMockFallback(
    async () => (await apiGet<PendingOrderTips>('/preOrder/tips', params)).data,
    () => ({ exists: mock.preOrderList.length > 0 }),
  )
}

// --- 用户模块 ---
let mockUserInfo = { ...mock.userInfoData }
let mockWithdrawRecords = [...mock.withdrawRecordList]
let mockWithdrawMinerDetails = [...mock.withdrawMinerDetailList]

export async function fetchUserInfoOld(): Promise<UserInfo> {
  return withMockFallback(async () => (await apiGet<UserInfo>('/user/info')).data, () => mockUserInfo)
}

export async function fetchWalletMoneyLog(logKind: 'usdt' | 'usdtMine', params?: QueryParams): Promise<PagedList<WalletMoneyLogItem>> {
  return withMockFallback(
    async () => {
      const endpoint = logKind === 'usdt' ? '/user/usdtLog' : '/user/usdtMineLog'
      const currency = logKind === 'usdt' ? 'USDT' : 'USDT挖矿'
      const data = (await apiGet<PagedList<WalletMoneyLogItem> | WalletMoneyLogItem[]>(endpoint, params)).data
      return normalizeWalletMoneyLogList(data, currency)
    },
    () => {
      const sourceList = mock.walletMoneyLogList.filter((item) => item.currency === (logKind === 'usdt' ? 'USDT' : 'USDT挖矿'))
      const filterType = Number(params?.type ?? 0)
      const filteredList = filterType === 0
        ? sourceList
        : sourceList.filter((item) => {
          if (filterType === 1) return item.msg === '提币扣除'
          if (filterType === 2) return item.msg === '提币退回'
          if (filterType === 3) return item.msg === '收益'
          return true
        })

      return normalizeWalletMoneyLogList({
        list: filteredList,
        total: filteredList.length,
        current_page: 1,
        last_page: 1,
      }, logKind === 'usdt' ? 'USDT' : 'USDT挖矿')
    },
  )
}

export async function fetchTeamList(): Promise<TeamMember[]> {
  return withMockFallback(async () => (await apiGet<TeamMember[]>('/user/zhiList')).data, () => mock.teamList)
}

// --- 提现模块 ---
export async function fetchWithdrawConfig(): Promise<WithdrawConfigData> {
  return withMockFallback(
    async () => (await apiGet<WithdrawConfigData>('/withdraw/withdrawConfig')).data,
    () => mock.withdrawConfigData,
  )
}

export async function applyWithdraw(data: WithdrawApplyPayload): Promise<void> {
  return withMockFallback(async () => {
    await apiPost('/withdraw/apply', data as unknown as QueryParams)
  }, () => {
    const now = new Date()
    const nowText = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
    const nextId = Math.max(0, ...mockWithdrawRecords.map((item) => item.id)) + 1
    const isMine = data.coin_type === 2
    const config = mock.withdrawConfigData
    const selectedDay = isMine
      ? config.usdt_mine_config.day_list.find((item) => String(item.id) === String(data.conf_id))
      : null
    const feeRate = Number(isMine ? selectedDay?.fee_rate ?? 0 : config.usdt_config.fee_rate ?? 0) / 100
    const num = Number(data.num || 0)
    const feeAmount = num * feeRate
    const acAmount = num - feeAmount
    const coinPrice = Number(isMine ? config.usdt_mine_config.coin_price : config.usdt_config.coin_price)
    const realNum = num * coinPrice
    const realFeeAmount = feeAmount * coinPrice
    const realAcAmount = acAmount * coinPrice

    const record = {
      id: nextId,
      no: `W${Date.now()}`,
      coin_type: data.coin_type,
      total_day: isMine ? Number(selectedDay?.day ?? 1) : 1,
      wait_day: isMine ? Number(selectedDay?.day ?? 1) : 1,
      num: num.toFixed(6),
      fee: feeRate.toFixed(6),
      fee_amount: feeAmount.toFixed(6),
      ac_amount: acAmount.toFixed(6),
      real_coin_id: isMine ? 3 : 1,
      real_num: realNum.toFixed(6),
      real_fee_amount: realFeeAmount.toFixed(6),
      real_ac_amount: realAcAmount.toFixed(6),
      status: 0,
      coin_price: coinPrice.toFixed(10),
      created_at: nowText,
    } satisfies WithdrawRecordListResponse['list'][number]

    mockWithdrawRecords = [record, ...mockWithdrawRecords]

    if (isMine) {
      const totalDay = Number(selectedDay?.day ?? 1)
      const items = Array.from({ length: totalDay }, (_, index) => {
        const date = new Date(now)
        date.setDate(date.getDate() + index + 1)
        const dayText = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        return {
          id: nextId * 100 + index + 1,
          wid: nextId,
          user_id: 61,
          ordernum: `WI${nextId}${String(index + 1).padStart(2, '0')}`,
          address: mockUserInfo.wallet_address,
          status: 0,
          day: dayText,
          num: (num / totalDay).toFixed(6),
          fee: feeRate.toFixed(6),
          fee_amount: (feeAmount / totalDay).toFixed(6),
          ac_amount: (acAmount / totalDay).toFixed(6),
          real_coin_id: 3,
          real_num: (realNum / totalDay).toFixed(6),
          real_fee_amount: (realFeeAmount / totalDay).toFixed(6),
          real_ac_amount: (realAcAmount / totalDay).toFixed(6),
          coin_price: coinPrice.toFixed(10),
          finsh_time: '',
          push_time: `${dayText} ${nowText.slice(11)}`,
          is_push: 0,
          hash: '',
          created_at: nowText,
          updated_at: nowText,
        }
      })
      mockWithdrawMinerDetails = [...items, ...mockWithdrawMinerDetails]
      mockUserInfo = {
        ...mockUserInfo,
        usdt_mine: String(Math.max(0, Number(mockUserInfo.usdt_mine || 0) - num)),
      }
      return
    }

    mockUserInfo = {
      ...mockUserInfo,
      usdt: String(Math.max(0, Number(mockUserInfo.usdt || 0) - num)),
    }
  })
}

export async function fetchWithdrawList(params?: QueryParams): Promise<WithdrawRecordListResponse> {
  return withMockFallback(
    async () => (await apiGet<WithdrawRecordListResponse>('/withdraw/list', params)).data,
    () => {
      const paged = paginateList(mockWithdrawRecords, params)
      return {
        list: paged.list,
        total: paged.total,
      }
    },
  )
}

export async function fetchWithdrawMinerDetail(params: { wid: number | string }): Promise<WithdrawMinerDetailResponse> {
  return withMockFallback(
    async () => (await apiGet<WithdrawMinerDetailResponse>('/withdraw/itemList', params as unknown as QueryParams)).data,
    () => {
      const wid = Number(params.wid)
      const list = mockWithdrawMinerDetails.filter((item) => item.wid === wid)
      return {
        list,
        total: list.length,
      }
    },
  )
}

// --- 地址模块 ---
let mockAddresses = [...mock.addressList]
let mockNextId = 100

export async function fetchAddressList(): Promise<AddressItem[]> {
  return withMockFallback(async () => (await apiGet<AddressItem[]>('/address/addressList')).data, () => mockAddresses)
}

export async function fetchAddressDetail(id: number): Promise<AddressItem | undefined> {
  return withMockFallback(async () => (await apiGet<AddressItem>('/address/addressDetail', { id })).data, () => mockAddresses.find((a) => a.id === id))
}

export async function addAddress(data: AddressFormData): Promise<AddressItem> {
  return withMockFallback(
    async () => (await apiPost<AddressItem>('/address/addAddress', data as unknown as QueryParams)).data,
    () => {
      const item: AddressItem = { ...data, id: mockNextId++ }
      if (item.is_default === 1) mockAddresses = mockAddresses.map((a) => ({ ...a, is_default: 0 }))
      mockAddresses.push(item)
      return item
    },
  )
}

export async function updateAddress(id: number, data: AddressFormData): Promise<void> {
  return withMockFallback(async () => {
    await apiPost('/address/editAddress', { id, ...data } as unknown as QueryParams)
  }, () => {
    if (data.is_default === 1) mockAddresses = mockAddresses.map((a) => ({ ...a, is_default: 0 }))
    mockAddresses = mockAddresses.map((a) => (a.id === id ? { ...a, ...data } : a))
  })
}

export async function deleteAddress(id: number): Promise<void> {
  return withMockFallback(async () => {
    await apiPost('/address/deleteAddress', { id })
  }, () => {
    mockAddresses = mockAddresses.filter((a) => a.id !== id)
  })
}

export async function setDefaultAddress(id: number): Promise<void> {
  return withMockFallback(async () => {
    await apiPost('/address/setDefaultAddress', { id })
  }, () => {
    mockAddresses = mockAddresses.map((a) => ({ ...a, is_default: a.id === id ? 1 : 0 }))
  })
}
