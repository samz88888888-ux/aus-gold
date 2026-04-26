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
} from './types'
import * as mock from './mock'

const useMock = appEnv.useMock

function getToken() {
  return getSavedToken()
}

async function apiGet<T>(path: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
  if (useMock) {
    await new Promise(r => setTimeout(r, 300 + Math.random() * 400))
    throw new Error('USE_MOCK')
  }
  return request<T>('GET', path, params, getToken())
}

async function apiPost<T>(path: string, data?: Record<string, unknown>): Promise<ApiResponse<T>> {
  if (useMock) {
    await new Promise(r => setTimeout(r, 300 + Math.random() * 400))
    throw new Error('USE_MOCK')
  }
  return request<T>('POST', path, data, getToken())
}

// --- 算力模块 ---
export async function fetchMachineList(params?: Record<string, unknown>): Promise<MachineItem[]> {
  try { return (await apiGet<MachineItem[]>('/machine/machineList', params)).data } catch { return mock.machineList }
}

export async function fetchDestoryInfo(): Promise<DestoryInfo> {
  try { return (await apiGet<DestoryInfo>('/machine/destroyInfo')).data } catch { return mock.destoryInfo }
}

export async function fetchMiningLog(params?: Record<string, unknown>): Promise<MiningLogResponse> {
  try { return (await apiGet<MiningLogResponse>('/user/powerLog', params)).data } catch { return mock.miningLogResponse }
}

export async function fetchUnionMiningConfig(): Promise<UnionMiningConfig[]> {
  try { return (await apiGet<UnionMiningConfig[]>('/joint/config')).data } catch { return mock.unionMiningConfigs }
}

// --- 商城模块 ---
export async function fetchMallBanner(): Promise<BannerItem[]> {
  try { return (await apiGet<BannerItem[]>('/gold/banner')).data } catch { return mock.bannerList }
}

export async function fetchMallBlock(): Promise<GroupItem[]> {
  try { return (await apiGet<GroupItem[]>('/gold/group')).data } catch { return mock.groupList }
}

export async function fetchCategoryList(): Promise<GoldCategory[]> {
  try { return (await apiGet<GoldCategory[]>('/gold/categoryList')).data } catch { return mock.categoryList }
}

export async function fetchProductList(params?: Record<string, unknown>): Promise<GoldProduct[]> {
  try { return (await apiGet<GoldProduct[]>('/gold/goodsList', params)).data } catch { return mock.productList }
}

export async function fetchProductDetail(params: { id: number }): Promise<GoldProductDetail> {
  try { return (await apiGet<GoldProductDetail>('/gold/goodsDetail', params as unknown as Record<string, unknown>)).data } catch { return mock.productDetail }
}

export async function fetchGoldOrderList(params?: Record<string, unknown>): Promise<{ list: GoldOrderItem[]; total: number }> {
  try { return (await apiGet<{ list: GoldOrderItem[]; total: number }>('/gold/orderList', params)).data } catch { return { list: mock.goldOrderList, total: mock.goldOrderList.length } }
}

export async function fetchOrderReleaseList(params?: Record<string, unknown>): Promise<{ list: OrderReleaseItem[]; total: number }> {
  try { return (await apiGet<{ list: OrderReleaseItem[]; total: number }>('/gold/releaseOrderList', params)).data } catch { return { list: mock.orderReleaseList, total: mock.orderReleaseList.length } }
}

export async function fetchTodayGoldPrice(): Promise<GoldPrice> {
  try { return (await apiGet<GoldPrice>('/gold/price')).data } catch { return mock.goldPrice }
}

export async function fetchGoldProductConfirm(data: Record<string, unknown>): Promise<Record<string, unknown>> {
  try { return (await apiPost<Record<string, unknown>>('/gold/receipt', data)).data } catch { return { success: true } }
}

// --- 订单模块 ---
export async function fetchPreOrderList(): Promise<PreOrderItem[]> {
  try { return (await apiGet<PreOrderItem[]>('/preOrder/preOrderList')).data } catch { return mock.preOrderList }
}

export async function fetchMachineOrderList(params?: Record<string, unknown>): Promise<{ list: GoldOrderItem[]; total: number }> {
  try { return (await apiGet<{ list: GoldOrderItem[]; total: number }>('/machine/orderList', params)).data } catch { return { list: mock.machineOrderList, total: mock.machineOrderList.length } }
}

export async function cancelPreOrder(params: Record<string, unknown>): Promise<void> {
  try { await apiPost('/preOrder/cancel', params) } catch { /* mock: no-op */ }
}

// --- 用户模块 ---
export async function fetchUserInfoOld(): Promise<UserInfo> {
  try { return (await apiGet<UserInfo>('/user/info')).data } catch { return mock.userInfoData }
}

export async function fetchTeamList(): Promise<TeamMember[]> {
  try { return (await apiGet<TeamMember[]>('/user/zhiList')).data } catch { return mock.teamList }
}

// --- 地址模块 ---
let mockAddresses = [...mock.addressList]
let mockNextId = 100

export async function fetchAddressList(): Promise<AddressItem[]> {
  try { return (await apiGet<AddressItem[]>('/address/addressList')).data } catch { return mockAddresses }
}

export async function fetchAddressDetail(id: number): Promise<AddressItem | undefined> {
  try { return (await apiGet<AddressItem>('/address/addressDetail', { id })).data } catch { return mockAddresses.find(a => a.id === id) }
}

export async function addAddress(data: AddressFormData): Promise<AddressItem> {
  try { return (await apiPost<AddressItem>('/address/addAddress', data as unknown as Record<string, unknown>)).data }
  catch {
    const item: AddressItem = { ...data, id: mockNextId++ }
    if (item.is_default === 1) mockAddresses = mockAddresses.map(a => ({ ...a, is_default: 0 }))
    mockAddresses.push(item)
    return item
  }
}

export async function updateAddress(id: number, data: AddressFormData): Promise<void> {
  try { await apiPost('/address/editAddress', { id, ...data } as unknown as Record<string, unknown>) }
  catch {
    if (data.is_default === 1) mockAddresses = mockAddresses.map(a => ({ ...a, is_default: 0 }))
    mockAddresses = mockAddresses.map(a => a.id === id ? { ...a, ...data } : a)
  }
}

export async function deleteAddress(id: number): Promise<void> {
  try { await apiPost('/address/deleteAddress', { id }) } catch { mockAddresses = mockAddresses.filter(a => a.id !== id) }
}

export async function setDefaultAddress(id: number): Promise<void> {
  try { await apiPost('/address/setDefaultAddress', { id }) }
  catch { mockAddresses = mockAddresses.map(a => ({ ...a, is_default: a.id === id ? 1 : 0 })) }
}
