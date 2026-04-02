import { getLoginMessage, checkIsRegistered, login } from './api'

const TOKEN_KEY = 'mcg_token'
const ADDRESS_KEY = 'mcg_address'
export const BSC_CHAIN_ID = '0x38'

const BSC_NETWORK_PARAMS = {
  chainId: BSC_CHAIN_ID,
  chainName: 'BNB Smart Chain',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  rpcUrls: ['https://bsc-dataseed.binance.org/'],
  blockExplorerUrls: ['https://bscscan.com'],
}

export function getChainDisplayName(chainId: string | null): string {
  if (!chainId) {
    return 'Unknown'
  }

  const normalized = chainId.toLowerCase()
  if (normalized === BSC_CHAIN_ID) {
    return 'BNB Smart Chain'
  }
  if (normalized === '0x1') {
    return 'Ethereum'
  }
  if (normalized === '0x89') {
    return 'Polygon'
  }
  if (normalized === '0xa4b1') {
    return 'Arbitrum One'
  }
  if (normalized === '0xaa36a7') {
    return 'Sepolia'
  }

  return `Chain ${chainId}`
}

export function getSavedToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getSavedAddress(): string | null {
  return localStorage.getItem(ADDRESS_KEY)
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(ADDRESS_KEY)
}

function saveAuth(token: string, address: string) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(ADDRESS_KEY, address)
}

export function getInviteCodeFromUrl(): string {
  const params = new URLSearchParams(window.location.search)
  return params.get('code') ?? ''
}

export async function getCurrentChainId(): Promise<string | null> {
  if (!window.ethereum) {
    return null
  }

  const chainId = await window.ethereum.request({
    method: 'eth_chainId',
  })

  return typeof chainId === 'string' ? chainId : null
}

export async function isBscNetwork(): Promise<boolean> {
  const chainId = await getCurrentChainId()
  return chainId?.toLowerCase() === BSC_CHAIN_ID
}

export async function switchToBscNetwork(): Promise<void> {
  if (!window.ethereum) {
    throw new Error('NO_WALLET')
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: BSC_CHAIN_ID }],
    })
  } catch (error) {
    const err = error as { code?: number }
    if (err.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [BSC_NETWORK_PARAMS],
      })
      return
    }

    throw error
  }
}

export async function connectWallet(): Promise<string> {
  if (!window.ethereum) {
    throw new Error('NO_WALLET')
  }
  const accounts = (await window.ethereum.request({
    method: 'eth_requestAccounts',
  })) as string[]
  const address = accounts?.[0]
  if (!address) throw new Error('NO_ACCOUNT')
  return address
}

export async function signAndLogin(address: string, inviteCode?: string): Promise<{
  token: string
  isNew: boolean
}> {
  const isRegistered = await checkIsRegistered(address)

  if (!isRegistered && !inviteCode) {
    throw new Error('NEED_INVITE_CODE')
  }

  const message = await getLoginMessage()

  const signMessage = (await window.ethereum!.request({
    method: 'personal_sign',
    params: [message, address],
  })) as string

  const token = await login({
    address,
    message,
    sign_message: signMessage,
    code: isRegistered ? undefined : inviteCode,
  })

  saveAuth(token, address)
  return { token, isNew: !isRegistered }
}

export async function walletSignIn(inviteCode?: string): Promise<{
  address: string
  token: string
  isNew: boolean
}> {
  const address = await connectWallet()
  const result = await signAndLogin(address, inviteCode)
  return { address, ...result }
}

export async function switchWalletAccount(): Promise<string> {
  if (!window.ethereum) {
    throw new Error('NO_WALLET')
  }

  await window.ethereum.request({
    method: 'wallet_requestPermissions',
    params: [{ eth_accounts: {} }],
  })

  return connectWallet()
}
