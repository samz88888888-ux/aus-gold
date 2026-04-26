import CryptoJS from 'crypto-js'

import { appEnv } from '../../../config/env'

const BASE_URL = appEnv.apiBaseUrl
const API_PREFIX = '/api/v1'
const GATEWAY_URL = `${BASE_URL}${appEnv.apiGatewayPath}`
const USE_GATEWAY = appEnv.apiUseGateway

const LANG_HEADER_MAP: Record<string, string> = {
  'zh-TW': 'TW',
  en: 'EN',
  ko: 'KO',
  ja: 'JP',
  th: 'TH',
  ms: 'MS',
}

function getCurrentLangHeader(): string {
  const saved = typeof window !== 'undefined'
    ? window.localStorage.getItem('mcg-language')
    : null
  return LANG_HEADER_MAP[saved ?? 'zh-TW'] ?? 'TW'
}

type ApiResponse<T = unknown> = {
  code: number
  local: string
  message: string
  data: T
}

type RequestMethod = 'GET' | 'POST'

type GatewayPayload = {
  uri: string
  method: RequestMethod
  params: Record<string, unknown>
  headers?: Record<string, string>
}

type GatewayResponse = {
  handshake?: string
  code: number
  message?: string
  data?: string
}

function normalizeToken(token?: string | null): string | null {
  if (!token) return null
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`
}

function getApiHeaders(token?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Lang: getCurrentLangHeader(),
  }

  const normalizedToken = normalizeToken(token)
  if (normalizedToken) {
    headers.Authorization = normalizedToken
  }

  return headers
}

function createHandshake(length = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

function encryptGatewayData(value: string, handshake: string): string {
  return CryptoJS.AES.encrypt(value, CryptoJS.enc.Utf8.parse(handshake), {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  }).toString()
}

function decryptGatewayData(value: string, handshake: string): string {
  const decrypted = CryptoJS.AES.decrypt(value, CryptoJS.enc.Utf8.parse(handshake), {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  })

  return CryptoJS.enc.Utf8.stringify(decrypted)
}

async function parseJsonResponse<T>(res: Response): Promise<ApiResponse<T>> {
  const json = (await res.json()) as ApiResponse<T>

  if (json.code !== 200) {
    throw new Error(json.message || `Request failed: ${json.code}`)
  }

  return json
}

async function requestDirect<T>(
  method: RequestMethod,
  path: string,
  body?: Record<string, unknown>,
  token?: string | null,
): Promise<ApiResponse<T>> {
  const url = new URL(`${BASE_URL}${API_PREFIX}${path}`)
  if (method === 'GET' && body) {
    Object.entries(body).forEach(([key, value]) => {
      if (value === undefined || value === null) return
      url.searchParams.append(key, String(value))
    })
  }

  const res = await fetch(url.toString(), {
    method,
    headers: getApiHeaders(token),
    body: method === 'GET' ? undefined : (body ? JSON.stringify(body) : undefined),
  })

  return parseJsonResponse<T>(res)
}

async function requestViaGateway<T>(
  method: RequestMethod,
  path: string,
  body?: Record<string, unknown>,
  token?: string | null,
): Promise<ApiResponse<T>> {
  const handshake = createHandshake()
  const gatewayPayload: GatewayPayload = {
    uri: `${API_PREFIX}${path}`,
    method,
    params: body ?? {},
    headers: {
      Lang: getCurrentLangHeader(),
    },
  }

  const normalizedToken = normalizeToken(token)
  if (normalizedToken) {
    gatewayPayload.headers = {
      ...gatewayPayload.headers,
      Authorization: normalizedToken,
    }
  }

  const res = await fetch(GATEWAY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      handshake,
      data: encryptGatewayData(JSON.stringify(gatewayPayload), handshake),
      timestamp: Date.now(),
    }),
  })

  const json = (await res.json()) as GatewayResponse

  if (json.code !== 200 || !json.handshake || typeof json.data !== 'string') {
    throw new Error(json.message || `Gateway request failed: ${json.code}`)
  }

  const decrypted = decryptGatewayData(json.data, json.handshake)
  if (!decrypted) {
    throw new Error('Gateway response decryption failed')
  }

  const innerJson = JSON.parse(decrypted) as ApiResponse<T>
  if (innerJson.code !== 200) {
    throw new Error(innerJson.message || `Request failed: ${innerJson.code}`)
  }

  return innerJson
}

async function request<T>(
  method: RequestMethod,
  path: string,
  body?: Record<string, unknown>,
  token?: string | null,
): Promise<ApiResponse<T>> {
  if (USE_GATEWAY) {
    return requestViaGateway<T>(method, path, body, token)
  }

  return requestDirect<T>(method, path, body, token)
}

export async function getLoginMessage(): Promise<string> {
  const res = await request<{ message: string }>('GET', '/auth/loginMessage')
  return res.data.message
}

export async function checkIsRegistered(address: string): Promise<boolean> {
  const res = await request<{ isRegister: boolean }>('POST', '/auth/isRegister', { address })
  return res.data.isRegister
}

export async function login(params: {
  address: string
  message: string
  sign_message: string
  code?: string
}): Promise<string> {
  const res = await request<{ token: string }>('POST', '/auth/login', params as Record<string, unknown>)
  return res.data.token
}

export type NoticeItem = {
  id: number
  title: string
  content: string
  order: number
  ispop: number
  created_at: string | null
}

export async function getMarquee(): Promise<NoticeItem[]> {
  const res = await request<NoticeItem[]>('GET', '/common/marquee')
  return res.data
}

export type UserInfo = {
  name: string
  code: string
  zhi_num: number
  team_num: number
  level_id: number
  level_name: string
}

export type ZhiListItem = {
  id: number
  address: string
  zhi_num: number
  team_num: number
  created_at: string
}

export async function getUserInfo(token: string): Promise<UserInfo> {
  const res = await request<UserInfo>('GET', '/user/info', undefined, token)
  return res.data
}

export async function getZhiList(token: string): Promise<ZhiListItem[]> {
  const res = await request<ZhiListItem[]>('GET', '/user/zhiList', undefined, token)
  return res.data
}

export type SubscriptionPlanApi = {
  id: number
  slug: string
  name: string
  description: string | null
  price: string
  price_display: string
  total_quantity: number
  sold_quantity: number
  remaining: number
  quantity_display: string
  power_multiplier: string
  power_value: string
  power_display: string
  level_id: number
  level_name: string
  has_reinvest: boolean
  reinvest_display: string
  has_time_bonus: boolean
  time_bonus_display: string
  sort_order: number
  purchased: boolean
}

export async function getSubscriptionPlans(token: string): Promise<SubscriptionPlanApi[]> {
  const res = await request<SubscriptionPlanApi[]>('GET', '/subscription/list', undefined, token)
  return res.data
}

export type GetOrderResult = {
  order_no: string
  recharge_contract: string
  usdt_contract: string
  amount_wei: string
  amount_display: string
  tx_data: string
}

export async function getOrder(token: string, slug: string): Promise<GetOrderResult> {
  const res = await request<GetOrderResult>('POST', '/subscription/getOrder', { slug }, token)
  return res.data
}

export type OrderListItem = {
  id: number
  order_no: string
  plan_name: string
  amount: string
  amount_display: string
  power_value: string
  status: number
  status_text: string
  tx_hash: string
  created_at: string | null
}

export async function getOrderList(token: string): Promise<{ list: OrderListItem[]; total: number }> {
  const res = await request<{ list: OrderListItem[]; total: number }>('GET', '/subscription/orderList', undefined, token)
  return res.data
}

export { request }
