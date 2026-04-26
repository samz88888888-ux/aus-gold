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
  UserInfo,
  TeamMember,
  UnionMiningConfig,
  ApiResponse,
  AddressItem,
  AddressFormData,
  PagedList,
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

function normalizeBannerList(data: Array<Partial<BannerItem>>): BannerItem[] {
  return data.map((item, index) => ({
    id: typeof item.id === 'number' ? item.id : index + 1,
    image: item.image || item.banner || '',
    banner: item.banner,
    url: item.url || '',
  }))
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
  return withMockFallback(async () => (await apiGet<MiningLogResponse>('/user/powerLog', params)).data, () => mock.miningLogResponse)
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
  return withMockFallback(async () => (await apiGet<PreOrderItem[]>('/preOrder/preOrderList', params)).data, () => mock.preOrderList)
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

// --- 用户模块 ---
export async function fetchUserInfoOld(): Promise<UserInfo> {
  return withMockFallback(async () => (await apiGet<UserInfo>('/user/info')).data, () => mock.userInfoData)
}

export async function fetchTeamList(): Promise<TeamMember[]> {
  return withMockFallback(async () => (await apiGet<TeamMember[]>('/user/zhiList')).data, () => mock.teamList)
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
