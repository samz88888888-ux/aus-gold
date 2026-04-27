import { useEffect, useState } from 'react'

import {
  executeBscPayment,
  executeNadiPayment,
  executePythiaPayment,
  formatUnits,
  getConnectedAddress,
  getChainConfig,
  getCurrentChainHexId,
  getSmartCurrencyBalance,
  isChainMatched,
  type SupportedChainId,
  switchOrAddChain,
} from '../services/evm'
import type { CurrencyInfo } from '../services/types'

export function useChainPayment() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [currentChainId, setCurrentChainId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [statusText, setStatusText] = useState('')

  useEffect(() => {
    const ethereum = window.ethereum
    if (!ethereum?.on) return

    const syncState = () => {
      getCurrentChainHexId().then(setCurrentChainId).catch(() => setCurrentChainId(null))
      getConnectedAddress().then(setWalletAddress).catch(() => setWalletAddress(null))
    }

    syncState()

    const handleAccountsChanged = (accounts: unknown) => {
      const nextAddress = Array.isArray(accounts) && typeof accounts[0] === 'string'
        ? accounts[0]
        : null
      setWalletAddress(nextAddress)
    }

    const handleChainChanged = (chainId: unknown) => {
      setCurrentChainId(typeof chainId === 'string' ? chainId.toLowerCase() : null)
    }

    ethereum.on('accountsChanged', handleAccountsChanged)
    ethereum.on('chainChanged', handleChainChanged)

    return () => {
      ethereum.removeListener?.('accountsChanged', handleAccountsChanged)
      ethereum.removeListener?.('chainChanged', handleChainChanged)
    }
  }, [])

  const refreshWalletState = async () => {
    try {
      const [address, chainId] = await Promise.all([
        getConnectedAddress().catch(() => null),
        getCurrentChainHexId().catch(() => null),
      ])
      setWalletAddress(address)
      setCurrentChainId(chainId)
      return { address, chainId }
    } catch {
      return { address: null, chainId: null }
    }
  }

  const getBalanceForCurrency = async (currency: CurrencyInfo, targetChainId: SupportedChainId) => {
    const { address } = await refreshWalletState()
    if (!address) return 0
    const rawBalance = await getSmartCurrencyBalance({ currency, targetChainId, owner: address })
    return Number(formatUnits(rawBalance, currency.decimals ?? 18, 6))
  }

  const checkChainMatch = async (targetChainId: SupportedChainId) => {
    const matched = await isChainMatched(targetChainId)
    const chainId = await getCurrentChainHexId().catch(() => null)
    setCurrentChainId(chainId)
    return matched
  }

  const switchChain = async (targetChainId: SupportedChainId) => {
    await switchOrAddChain(targetChainId)
    const chainId = await getCurrentChainHexId().catch(() => null)
    setCurrentChainId(chainId)
  }

  const executePendingOrderChainPayment = async (params: {
    paymentInfo: { currency?: CurrencyInfo | null; sub_currency?: CurrencyInfo | null }
    amount: number | string
    orderNo: string
    paymentType: string
  }) => {
    setIsProcessing(true)
    setStatusText('等待钱包确认交易...')

    try {
      const chainId = params.paymentInfo.currency?.chain_id
      if (chainId !== 56 && chainId !== 399 && chainId !== 9777) {
        throw new Error(`不支持的链ID: ${chainId ?? 'unknown'}`)
      }

      const txHash = chainId === 399
        ? await executeNadiPayment({
          paymentInfo: { currency: params.paymentInfo.currency },
          amount: params.amount,
          orderNo: params.orderNo,
        })
        : chainId === 9777
          ? await executePythiaPayment({
            paymentInfo: { currency: params.paymentInfo.currency },
            amount: params.amount,
            orderNo: params.orderNo,
          })
        : await executeBscPayment({
          paymentInfo: params.paymentInfo,
          amount: params.amount,
          orderNo: params.orderNo,
          paymentType: params.paymentType,
        })

      setStatusText('')
      await refreshWalletState()
      return txHash
    } finally {
      setIsProcessing(false)
      setStatusText('')
    }
  }

  return {
    walletAddress,
    currentChainId,
    isProcessing,
    statusText,
    refreshWalletState,
    getBalanceForCurrency,
    checkChainMatch,
    switchChain,
    executePendingOrderChainPayment,
    getTargetChainName: (targetChainId: SupportedChainId) => getChainConfig(targetChainId).chainName,
  }
}
