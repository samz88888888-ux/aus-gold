import CryptoJS from 'crypto-js'

import type { CurrencyInfo } from './types'

export const ZERO_ADDRESS = '0x1000000000000000000000000000000000000000'
export const DEFAULT_GAS_LIMIT = 1_000_000n
export const MAX_UINT256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
export const BSC_RECHARGE_CONTRACT = '0x34A41001889Eeb080ce8ad7fA50252b5138D30Df'
export const NADI_RECHARGE_CONTRACT = '0x34A41001889Eeb080ce8ad7fA50252b5138D30Df'
export const PYTHIA_RECHARGE_CONTRACT = '0x34A41001889Eeb080ce8ad7fA50252b5138D30Df'

export type SupportedChainId = 56 | 399 | 9777

export type ChainConfig = {
  chainId: SupportedChainId
  chainHexId: string
  chainName: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  rpcUrls: string[]
  blockExplorerUrls: string[]
}

const CHAIN_CONFIGS: Record<SupportedChainId, ChainConfig> = {
  56: {
    chainId: 56,
    chainHexId: '0x38',
    chainName: 'BSC',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    rpcUrls: ['https://bsc-dataseed.binance.org/'],
    blockExplorerUrls: ['https://bscscan.com'],
  },
  399: {
    chainId: 399,
    chainHexId: '0x18f',
    chainName: 'NADI',
    nativeCurrency: {
      name: 'NADI',
      symbol: 'NADI',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.naaidepin.co/', 'https://rpc-nadi.naaidepin.co'],
    blockExplorerUrls: ['https://explorer.naaidepin.co'],
  },
  9777: {
    chainId: 9777,
    chainHexId: '0x2631',
    chainName: 'PYTHIA',
    nativeCurrency: {
      name: 'PYTHIA',
      symbol: 'PYTHIA',
      decimals: 18,
    },
    rpcUrls: ['https://rpc-pythia.naaidepin.co/'],
    blockExplorerUrls: ['https://explorer.naaidepin.co'],
  },
}

function ensureEthereum() {
  if (!window.ethereum) {
    throw new Error('未检测到钱包，请先安装或打开 EVM 钱包')
  }
  return window.ethereum
}

function strip0x(value: string) {
  return value.startsWith('0x') ? value.slice(2) : value
}

function normalizeHex(value: string) {
  const hex = strip0x(value).toLowerCase()
  return hex.length % 2 === 0 ? hex : `0${hex}`
}

function padHex(value: string, byteLength = 32) {
  return normalizeHex(value).padStart(byteLength * 2, '0')
}

function toRpcHex(value: bigint) {
  const hex = value.toString(16)
  return `0x${hex === '' ? '0' : hex}`
}

function utf8ToHex(value: string) {
  const bytes = new TextEncoder().encode(value)
  return Array.from(bytes, (item) => item.toString(16).padStart(2, '0')).join('')
}

function bytesLengthFromHex(hexValue: string) {
  return normalizeHex(hexValue).length / 2
}

function functionSelector(signature: string) {
  return CryptoJS.SHA3(signature, { outputLength: 256 }).toString().slice(0, 8)
}

function encodeAddress(value: string) {
  return padHex(strip0x(value), 32)
}

function encodeUint256(value: bigint | number | string) {
  const bigintValue = typeof value === 'bigint' ? value : BigInt(value)
  return padHex(bigintValue.toString(16), 32)
}

function encodeDynamicHex(hexValue: string) {
  const normalized = normalizeHex(hexValue)
  const length = bytesLengthFromHex(normalized)
  const paddedSize = Math.ceil(length / 32) * 64
  return `${encodeUint256(BigInt(length))}${normalized.padEnd(paddedSize, '0')}`
}

function encodeParameters(types: string[], values: unknown[]) {
  const head: string[] = []
  const tail: string[] = []
  let offset = BigInt(types.length * 32)

  types.forEach((type, index) => {
    const value = values[index]
    if (type === 'address') {
      head.push(encodeAddress(String(value)))
      return
    }

    if (type === 'uint256') {
      head.push(encodeUint256(value as bigint | number | string))
      return
    }

    if (type === 'string') {
      const encoded = encodeDynamicHex(utf8ToHex(String(value ?? '')))
      head.push(encodeUint256(offset))
      tail.push(encoded)
      offset += BigInt(encoded.length / 2)
      return
    }

    if (type === 'bytes') {
      const encoded = encodeDynamicHex(String(value ?? ''))
      head.push(encodeUint256(offset))
      tail.push(encoded)
      offset += BigInt(encoded.length / 2)
      return
    }

    throw new Error(`暂不支持的 ABI 类型: ${type}`)
  })

  return `${head.join('')}${tail.join('')}`
}

export function encodeFunctionCall(signature: string, types: string[], values: unknown[]) {
  return `0x${functionSelector(signature)}${encodeParameters(types, values)}`
}

export function parseUnits(value: number | string, decimals = 18) {
  const normalized = String(value ?? '0').replace(/,/g, '').trim()
  if (!normalized) return 0n

  const [integerPart, decimalPart = ''] = normalized.split('.')
  const safeInteger = integerPart === '' ? '0' : integerPart
  const safeDecimal = decimalPart.padEnd(decimals, '0').slice(0, decimals)
  return BigInt(`${safeInteger}${safeDecimal}` || '0')
}

export function formatUnits(value: bigint | string | number, decimals = 18, precision = 4) {
  const bigintValue = typeof value === 'bigint' ? value : BigInt(value)
  const divisor = 10n ** BigInt(decimals)
  const integer = bigintValue / divisor
  const fraction = bigintValue % divisor
  const rawFraction = fraction.toString().padStart(decimals, '0').slice(0, precision)
  const trimmedFraction = rawFraction.replace(/0+$/, '')
  return trimmedFraction ? `${integer.toString()}.${trimmedFraction}` : integer.toString()
}

export async function requestAccounts() {
  const ethereum = ensureEthereum()
  const accounts = await ethereum.request({ method: 'eth_requestAccounts' }) as string[]
  const address = accounts?.[0]
  if (!address) {
    throw new Error('钱包未返回账户地址')
  }
  return address
}

export async function getConnectedAddress() {
  const ethereum = ensureEthereum()
  const accounts = await ethereum.request({ method: 'eth_accounts' }) as string[]
  return accounts?.[0] ?? null
}

export async function getCurrentChainHexId() {
  const ethereum = ensureEthereum()
  const chainId = await ethereum.request({ method: 'eth_chainId' })
  return typeof chainId === 'string' ? chainId.toLowerCase() : null
}

export function getChainConfig(chainId: SupportedChainId) {
  return CHAIN_CONFIGS[chainId]
}

export async function isChainMatched(chainId: SupportedChainId) {
  const current = await getCurrentChainHexId()
  return current === CHAIN_CONFIGS[chainId].chainHexId.toLowerCase()
}

export async function switchOrAddChain(chainId: SupportedChainId) {
  const ethereum = ensureEthereum()
  const config = CHAIN_CONFIGS[chainId]

  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: config.chainHexId }],
    })
  } catch (error) {
    const chainError = error as { code?: number }
    if (chainError.code !== 4902) throw error

    await ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: config.chainHexId,
        chainName: config.chainName,
        nativeCurrency: config.nativeCurrency,
        rpcUrls: config.rpcUrls,
        blockExplorerUrls: config.blockExplorerUrls,
      }],
    })
  }
}

async function rpcCall(method: string, params?: unknown[]) {
  const ethereum = ensureEthereum()
  return ethereum.request({ method, params })
}

export async function getNativeBalance(address: string) {
  const balance = await rpcCall('eth_getBalance', [address, 'latest'])
  return BigInt(String(balance))
}

export async function readContractUint256(contractAddress: string, data: string) {
  const result = await rpcCall('eth_call', [{ to: contractAddress, data }, 'latest'])
  return BigInt(String(result))
}

export async function getErc20Balance(tokenAddress: string, owner: string) {
  const data = encodeFunctionCall('balanceOf(address)', ['address'], [owner])
  return readContractUint256(tokenAddress, data)
}

export async function getErc20Allowance(tokenAddress: string, owner: string, spender: string) {
  const data = encodeFunctionCall('allowance(address,address)', ['address', 'address'], [owner, spender])
  return readContractUint256(tokenAddress, data)
}

export async function sendTransaction(params: {
  from: string
  to: string
  data: string
  value?: bigint
  gas?: bigint
}) {
  const txHash = await rpcCall('eth_sendTransaction', [{
    from: params.from,
    to: params.to,
    data: params.data,
    value: toRpcHex(params.value ?? 0n),
    gas: toRpcHex(params.gas ?? DEFAULT_GAS_LIMIT),
  }])

  return String(txHash)
}

export async function waitForReceipt(txHash: string, attempts = 60, intervalMs = 2000) {
  for (let index = 0; index < attempts; index += 1) {
    const receipt = await rpcCall('eth_getTransactionReceipt', [txHash])
    if (receipt) return receipt
    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }
  return null
}

export async function approveErc20Token(params: {
  owner: string
  tokenAddress: string
  spender: string
  minimumAmount: bigint
}) {
  const currentAllowance = await getErc20Allowance(params.tokenAddress, params.owner, params.spender)
  if (currentAllowance >= params.minimumAmount) return null

  const approveData = encodeFunctionCall('approve(address,uint256)', ['address', 'uint256'], [params.spender, BigInt(MAX_UINT256)])
  const txHash = await sendTransaction({
    from: params.owner,
    to: params.tokenAddress,
    data: approveData,
  })
  await waitForReceipt(txHash)
  return txHash
}

export function isNativeCurrency(currency: CurrencyInfo | null | undefined, targetChainId: SupportedChainId) {
  if (!currency?.contract_address) return true
  const normalized = currency.contract_address.toLowerCase()
  if (normalized === ZERO_ADDRESS.toLowerCase()) return true
  if (targetChainId === 399 && currency.name?.toUpperCase() === 'NADI') return true
  if (targetChainId === 9777 && currency.name?.toUpperCase() === 'PYTHIA') return true
  if (targetChainId === 56 && currency.name?.toUpperCase() === 'BNB') return true
  return false
}

export async function getSmartCurrencyBalance(params: {
  currency: CurrencyInfo
  targetChainId: SupportedChainId
  owner: string
}) {
  if (isNativeCurrency(params.currency, params.targetChainId)) {
    return getNativeBalance(params.owner)
  }

  if (!params.currency.contract_address) {
    return 0n
  }

  return getErc20Balance(params.currency.contract_address, params.owner)
}

async function executeNativeRechargePayment(params: {
  targetChainId: 399 | 9777
  rechargeContract: string
  paymentInfo: {
    currency?: CurrencyInfo | null
  }
  amount: number | string
  orderNo: string
}) {
  const address = await requestAccounts()
  if (!(await isChainMatched(params.targetChainId))) {
    throw new Error(`请切换到 ${CHAIN_CONFIGS[params.targetChainId].chainName} 网络`)
  }

  const currency = params.paymentInfo.currency
  const nativePayment = isNativeCurrency(currency, params.targetChainId)
  const amountValue = parseUnits(params.amount, currency?.decimals ?? 18)
  const tokenAddress = nativePayment ? ZERO_ADDRESS : String(currency?.contract_address ?? '')

  if (nativePayment) {
    const nativeBalance = await getNativeBalance(address)
    if (nativeBalance < amountValue) {
      throw new Error('链上余额不足')
    }
  } else if (currency?.contract_address) {
    const tokenBalance = await getErc20Balance(currency.contract_address, address)
    if (tokenBalance < amountValue) {
      throw new Error(`${currency.name || '代币'}余额不足`)
    }
  }

  if (!nativePayment && currency?.contract_address) {
    await approveErc20Token({
      owner: address,
      tokenAddress: currency.contract_address,
      spender: params.rechargeContract,
      minimumAmount: amountValue,
    })
  }

  const data = encodeFunctionCall(
    'rechargeOne(address,uint256,string)',
    ['address', 'uint256', 'string'],
    [tokenAddress, amountValue, params.orderNo],
  )

  return sendTransaction({
    from: address,
    to: params.rechargeContract,
    data,
    value: nativePayment ? amountValue : 0n,
  })
}

export async function executeNadiPayment(params: {
  paymentInfo: {
    currency?: CurrencyInfo | null
  }
  amount: number | string
  orderNo: string
}) {
  return executeNativeRechargePayment({
    targetChainId: 399,
    rechargeContract: NADI_RECHARGE_CONTRACT,
    ...params,
  })
}

export async function executePythiaPayment(params: {
  paymentInfo: {
    currency?: CurrencyInfo | null
  }
  amount: number | string
  orderNo: string
}) {
  return executeNativeRechargePayment({
    targetChainId: 9777,
    rechargeContract: PYTHIA_RECHARGE_CONTRACT,
    ...params,
  })
}

export async function executeBscPayment(params: {
  paymentInfo: {
    currency?: CurrencyInfo | null
    sub_currency?: CurrencyInfo | null
  }
  amount: number | string
  orderNo: string
  paymentType: string
}) {
  const address = await requestAccounts()
  if (!(await isChainMatched(56))) {
    throw new Error(`请切换到 ${CHAIN_CONFIGS[56].chainName} 网络`)
  }

  const mainCurrency = params.paymentInfo.currency
  if (!mainCurrency?.contract_address) {
    throw new Error('缺少主支付代币合约地址')
  }

  const mainAmount = parseUnits(params.amount, mainCurrency.decimals ?? 18)
  const mainBalance = await getErc20Balance(mainCurrency.contract_address, address)
  if (mainBalance < mainAmount) {
    throw new Error(`${mainCurrency.name || '主代币'}余额不足`)
  }

  await approveErc20Token({
    owner: address,
    tokenAddress: mainCurrency.contract_address,
    spender: BSC_RECHARGE_CONTRACT,
    minimumAmount: mainAmount,
  })

  const isDoublePayment = params.paymentType === 'chain_usdt_spa'
  let abiKey = 'single'
  let encodedInnerData = encodeParameters(
    ['address', 'uint256', 'string'],
    [mainCurrency.contract_address, mainAmount, params.orderNo],
  )

  if (isDoublePayment) {
    const subCurrency = params.paymentInfo.sub_currency
    if (!subCurrency?.contract_address || subCurrency.amount === undefined) {
      throw new Error('双币支付缺少子代币信息')
    }

    const subAmount = parseUnits(subCurrency.amount, subCurrency.decimals ?? 18)
    const subBalance = await getErc20Balance(subCurrency.contract_address, address)
    if (subBalance < subAmount) {
      throw new Error(`${subCurrency.name || '子代币'}余额不足`)
    }

    await approveErc20Token({
      owner: address,
      tokenAddress: subCurrency.contract_address,
      spender: BSC_RECHARGE_CONTRACT,
      minimumAmount: subAmount,
    })

    abiKey = 'double'
    encodedInnerData = encodeParameters(
      ['address', 'uint256', 'address', 'uint256', 'string'],
      [mainCurrency.contract_address, mainAmount, subCurrency.contract_address, subAmount, params.orderNo],
    )
  }

  const data = encodeFunctionCall(
    'recharge(string,bytes)',
    ['string', 'bytes'],
    [abiKey, encodedInnerData],
  )

  return sendTransaction({
    from: address,
    to: BSC_RECHARGE_CONTRACT,
    data,
    value: 0n,
  })
}
