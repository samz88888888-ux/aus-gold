import { useCallback, useEffect, useRef, useState } from 'react'

import { copyByLanguage, languageOptions, menuItems } from './data'
import {
  FeedbackToast,
  InviteCodeSheet,
  LanguageSheet,
  NetworkSheet,
  SideDrawer,
  WalletSheet,
} from './components/shared'
import { HomeScreen } from './pages/HomeScreen'
import { SubscriptionCenterScreen } from './pages/SubscriptionCenterScreen'
import { CommunityScreen } from './pages/CommunityScreen'
import { MingPage } from '../old-pages/pages/ming/MingPage'
import { MingLogPage } from '../old-pages/pages/ming/MingLogPage'
import { DestoryListPage } from '../old-pages/pages/ming/DestoryListPage'
import { ShopPage } from '../old-pages/pages/shop/ShopPage'
import { ShopDetailPage } from '../old-pages/pages/shop/ShopDetailPage'
import { ShopOrderListPage } from '../old-pages/pages/shop/ShopOrderListPage'
import { ShopOrderReleasePage } from '../old-pages/pages/shop/ShopOrderReleasePage'
import { ShopOrderConfirmPage } from '../old-pages/pages/shop/ShopOrderConfirmPage'
import { OrdersPage } from '../old-pages/pages/order/OrdersPage'
import { UserPage } from '../old-pages/pages/user/UserPage'
import { AddressListPage } from '../old-pages/pages/address/AddressListPage'
import { AddressAddPage } from '../old-pages/pages/address/AddressAddPage'
import { AddressEditPage } from '../old-pages/pages/address/AddressEditPage'
import { OldPageHeaderProvider } from '../old-pages/components/OldPageHeaderProvider'
import {
  BSC_CHAIN_ID,
  clearAuth,
  connectWallet,
  getChainDisplayName,
  getCurrentChainId,
  getInviteCodeFromUrl,
  isBscNetwork,
  signAndLogin,
  switchToBscNetwork,
  switchWalletAccount,
} from './services/auth'
import { getMarquee } from './services/api'
import type { NoticeItem } from './services/api'
import type { AppPage, LanguageCode, PageParams, SubscriptionPlanId } from './types'

export function NavigationShowcase() {
  const heroSectionRef = useRef<HTMLElement | null>(null)
  const advantagesSectionRef = useRef<HTMLElement | null>(null)
  const modelSectionRef = useRef<HTMLElement | null>(null)
  const partnersSectionRef = useRef<HTMLElement | null>(null)
  const contactSectionRef = useRef<HTMLElement | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isLanguageSheetOpen, setIsLanguageSheetOpen] = useState(false)
  const [isWalletSheetOpen, setIsWalletSheetOpen] = useState(false)
  const [isNoticeDetailOpen, setIsNoticeDetailOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState<AppPage>('home')
  const [pageParams, setPageParams] = useState<PageParams>({})
  const [activeMenu, setActiveMenu] = useState(menuItems[0].label)
  const [activeSubscriptionPlan, setActiveSubscriptionPlan] = useState<SubscriptionPlanId>('ops')
  const [selectedLanguageCode] = useState<LanguageCode>(() => {
    if (typeof window === 'undefined') {
      return 'zh-TW'
    }

    const savedLanguage = window.localStorage.getItem('mcg-language')
    const validCodes: LanguageCode[] = ['zh-TW', 'en', 'ko', 'ja', 'th', 'ms']
    return validCodes.includes(savedLanguage as LanguageCode)
      ? (savedLanguage as LanguageCode)
      : 'zh-TW'
  })
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [isConnectingWallet, setIsConnectingWallet] = useState(false)
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const [isInviteCodeSheetOpen, setIsInviteCodeSheetOpen] = useState(false)
  const [isNetworkSheetOpen, setIsNetworkSheetOpen] = useState(false)
  const [pendingAddress, setPendingAddress] = useState<string | null>(null)
  const [pendingNetworkAddress, setPendingNetworkAddress] = useState<string | null>(null)
  const [currentChainId, setCurrentChainId] = useState<string | null>(null)
  const [notices, setNotices] = useState<NoticeItem[]>([])
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null)
  const urlInviteCode = useRef(getInviteCodeFromUrl())

  const selectedLanguage =
    languageOptions.find((item) => item.code === selectedLanguageCode) ?? languageOptions[0]
  const copy = copyByLanguage[selectedLanguage.code]

  useEffect(() => {
    window.localStorage.setItem('mcg-language', selectedLanguageCode)
  }, [selectedLanguageCode])

  useEffect(() => {
    if (!feedbackMessage) {
      return
    }

    const timeout = window.setTimeout(() => setFeedbackMessage(null), 2200)
    return () => window.clearTimeout(timeout)
  }, [feedbackMessage])

  useEffect(() => {
    getMarquee()
      .then((list) => {
        setNotices(list)
        const pop = list.find((n) => n.ispop === 1)
        if (pop) {
          setSelectedNotice(pop)
          setIsNoticeDetailOpen(true)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    getCurrentChainId()
      .then((chainId) => setCurrentChainId(chainId))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const ethereum = window.ethereum
    if (!ethereum?.on) return

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = Array.isArray(args[0]) ? args[0] : []
      const account = typeof accounts[0] === 'string' ? accounts[0] : null
      if (!account || account !== walletAddress) {
        clearAuth()
        setWalletAddress(null)
        setAuthToken(null)
      }
    }

    const handleChainChanged = (...args: unknown[]) => {
      const chainId = typeof args[0] === 'string' ? args[0] : null
      setCurrentChainId(chainId)
    }

    ethereum.on('accountsChanged', handleAccountsChanged)
    ethereum.on('chainChanged', handleChainChanged)
    return () => {
      ethereum.removeListener?.('accountsChanged', handleAccountsChanged)
      ethereum.removeListener?.('chainChanged', handleChainChanged)
    }
  }, [walletAddress])


  const showError = useCallback((err: unknown) => {
    const msg = err instanceof Error ? err.message : ''
    if (msg === 'NO_WALLET') {
      setFeedbackMessage(copy.walletMissing)
    } else if (msg && msg !== 'NEED_INVITE_CODE') {
      setFeedbackMessage(msg)
    }
  }, [copy])

  const doSignIn = useCallback(async (address: string, inviteCode?: string) => {
    try {
      const result = await signAndLogin(address, inviteCode)
      setWalletAddress(address)
      setAuthToken(result.token)
      setPendingAddress(null)
      setFeedbackMessage(copy.walletConnected)
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (msg === 'NEED_INVITE_CODE') {
        setPendingAddress(address)
        setIsInviteCodeSheetOpen(true)
      } else {
        showError(err)
      }
    }
  }, [copy, showError])

  const continueWithConnectedWallet = useCallback(async (address: string) => {
    const onBsc = await isBscNetwork()
    const chainId = await getCurrentChainId()
    setCurrentChainId(chainId)

    if (!onBsc) {
      setPendingNetworkAddress(address)
      setIsNetworkSheetOpen(true)
      return
    }

    await doSignIn(address, urlInviteCode.current || undefined)
  }, [doSignIn])

  const handleWalletConnect = useCallback(async () => {
    if (walletAddress && authToken) {
      setIsWalletSheetOpen(true)
      return
    }

    if (isConnectingWallet) return

    if (!window.ethereum) {
      setFeedbackMessage(copy.walletMissing)
      return
    }

    try {
      setIsConnectingWallet(true)
      const address = await connectWallet()
      await continueWithConnectedWallet(address)
    } catch (err) {
      showError(err)
    } finally {
      setIsConnectingWallet(false)
    }
  }, [walletAddress, authToken, isConnectingWallet, copy, continueWithConnectedWallet, showError])

  const handleInviteCodeConfirm = useCallback(async (code: string) => {
    setIsInviteCodeSheetOpen(false)
    if (!pendingAddress) return
    try {
      setIsConnectingWallet(true)
      await doSignIn(pendingAddress, code)
    } catch (err) {
      showError(err)
    } finally {
      setIsConnectingWallet(false)
    }
  }, [pendingAddress, doSignIn, showError])

  const handleWalletSwitch = useCallback(async () => {
    if (!window.ethereum) {
      setFeedbackMessage(copy.walletMissing)
      return
    }
    try {
      setIsConnectingWallet(true)
      const address = await switchWalletAccount()
      await continueWithConnectedWallet(address)
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (msg === 'NEED_INVITE_CODE') {
        const address = await connectWallet()
        setPendingAddress(address)
        setIsInviteCodeSheetOpen(true)
      } else {
        showError(err)
      }
    } finally {
      setIsConnectingWallet(false)
    }
  }, [copy, continueWithConnectedWallet, showError])

  const handleSwitchToBsc = useCallback(async () => {
    try {
      setIsSwitchingNetwork(true)
      await switchToBscNetwork()
      const chainId = await getCurrentChainId()
      setCurrentChainId(chainId)
      setFeedbackMessage(copy.networkReady)
      setIsNetworkSheetOpen(false)

      if (pendingNetworkAddress && chainId?.toLowerCase() === BSC_CHAIN_ID) {
        setIsConnectingWallet(true)
        await doSignIn(pendingNetworkAddress, urlInviteCode.current || undefined)
        setPendingNetworkAddress(null)
      }
    } catch (err) {
      showError(err)
    } finally {
      setIsSwitchingNetwork(false)
      setIsConnectingWallet(false)
    }
  }, [copy, doSignIn, pendingNetworkAddress, showError])

  const handleWalletDisconnect = useCallback(() => {
    clearAuth()
    setWalletAddress(null)
    setAuthToken(null)
    setIsWalletSheetOpen(false)
    setFeedbackMessage(copy.walletDisconnected)
  }, [copy])

  const handleCopyWallet = async () => {
    if (!walletAddress) {
      setFeedbackMessage(copy.walletMissing)
      return
    }

    try {
      await navigator.clipboard.writeText(walletAddress)
      setFeedbackMessage(copy.walletCopied)
    } catch {
      setFeedbackMessage(walletAddress)
    }
  }

  const walletButtonLabel = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : isConnectingWallet
      ? '...'
      : copy.wallet

  const chainName = getChainDisplayName(currentChainId)
  const isCurrentChainBsc = currentChainId?.toLowerCase() === BSC_CHAIN_ID

  const oldPageHeaderProps = {
    copy,
    currentLanguage: selectedLanguage,
    walletButtonLabel,
    onMenuToggle: () => setIsDrawerOpen((open) => !open),
    onLanguageToggle: () => setIsLanguageSheetOpen((open) => !open),
    onWalletConnect: handleWalletConnect,
  }


  const navigateToPage = (page: AppPage, params?: PageParams) => {
    setCurrentPage(page)
    setPageParams(params ?? {})
    const menuMap: Partial<Record<AppPage, string>> = {
      home: '首頁',
      subscription: '認購中心',
      community: '我的社區',
      ming: '算力挖礦',
      shop: '黃金商城',
      orders: '待支付訂單',
      user: '邀請中心',
    }
    if (menuMap[page]) {
      setActiveMenu(menuMap[page]!)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const selectSubscriptionPlan = (planId: SubscriptionPlanId) => {
    setActiveSubscriptionPlan(planId)
  }

  return (
    <main className="min-h-screen bg-[#03070b] text-white">
      <div className="mx-auto min-h-screen max-w-[430px] bg-[#1c1508] shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
        <div className="relative min-h-screen overflow-hidden">
          {currentPage === 'home' ? (
            <HomeScreen
              copy={copy}
              currentLanguage={selectedLanguage}
              notices={notices}
              selectedNotice={selectedNotice}
              walletButtonLabel={walletButtonLabel}
              onMenuToggle={() => setIsDrawerOpen((open) => !open)}
              onLanguageToggle={() => setIsLanguageSheetOpen((open) => !open)}
              onNoticeSelect={(n) => { setSelectedNotice(n); setIsNoticeDetailOpen(true) }}
              onNoticeDetailClose={() => { setIsNoticeDetailOpen(false); setSelectedNotice(null) }}
              isNoticeDetailOpen={isNoticeDetailOpen}
              onWalletConnect={handleWalletConnect}
              onOpenSubscription={() => {
                if (!authToken) {
                  setFeedbackMessage(copy.loginRequired)
                  return
                }
                navigateToPage('subscription')
              }}
              heroSectionRef={heroSectionRef}
              advantagesSectionRef={advantagesSectionRef}
              modelSectionRef={modelSectionRef}
              partnersSectionRef={partnersSectionRef}
              contactSectionRef={contactSectionRef}
            />
          ) : currentPage === 'subscription' ? (
            <SubscriptionCenterScreen
              copy={copy}
              currentLanguage={selectedLanguage}
              walletButtonLabel={walletButtonLabel}
              walletAddress={walletAddress}
              authToken={authToken}
              activePlan={activeSubscriptionPlan}
              onMenuToggle={() => setIsDrawerOpen((open) => !open)}
              onLanguageToggle={() => setIsLanguageSheetOpen((open) => !open)}
              onWalletConnect={handleWalletConnect}
              onSelectPlan={selectSubscriptionPlan}
              onSubscribe={(planId) => {
                setActiveSubscriptionPlan(planId)
                setFeedbackMessage(copy.purchaseQueued)
              }}
              onFeedback={setFeedbackMessage}
            />
          ) : currentPage === 'community' ? (
            <CommunityScreen
              copy={copy}
              currentLanguage={selectedLanguage}
              walletButtonLabel={walletButtonLabel}
              authToken={authToken}
              onMenuToggle={() => setIsDrawerOpen((open) => !open)}
              onLanguageToggle={() => setIsLanguageSheetOpen((open) => !open)}
              onWalletConnect={handleWalletConnect}
              onFeedback={setFeedbackMessage}
            />
          ) : ['ming', 'mingLog', 'destoryList', 'shop', 'shopDetail', 'shopOrderList', 'shopOrderRelease', 'shopOrderConfirm', 'orders', 'user', 'address', 'addressAdd', 'addressEdit'].includes(currentPage) ? (
            <OldPageHeaderProvider value={oldPageHeaderProps}>
              {currentPage === 'ming' ? (
                <MingPage onNavigate={navigateToPage} />
              ) : currentPage === 'mingLog' ? (
                <MingLogPage onNavigate={navigateToPage} />
              ) : currentPage === 'destoryList' ? (
                <DestoryListPage onNavigate={navigateToPage} />
              ) : currentPage === 'shop' ? (
                <ShopPage onNavigate={navigateToPage} />
              ) : currentPage === 'shopDetail' ? (
                <ShopDetailPage productId={pageParams.id ?? ''} onNavigate={navigateToPage} />
              ) : currentPage === 'shopOrderList' ? (
                <ShopOrderListPage groupId={pageParams.group_id} onNavigate={navigateToPage} />
              ) : currentPage === 'shopOrderRelease' ? (
                <ShopOrderReleasePage groupId={pageParams.group_id} status={pageParams.status} onNavigate={navigateToPage} />
              ) : currentPage === 'shopOrderConfirm' ? (
                <ShopOrderConfirmPage pageState={pageParams.state as { product: import('../old-pages/services/types').GoldProductDetail; quantity: number } | null} addressId={pageParams.address_id} onNavigate={navigateToPage} />
              ) : currentPage === 'orders' ? (
                <OrdersPage onNavigate={navigateToPage} />
              ) : currentPage === 'user' ? (
                <UserPage onNavigate={navigateToPage} />
              ) : currentPage === 'address' ? (
                <AddressListPage from={pageParams.from} onNavigate={navigateToPage} />
              ) : currentPage === 'addressAdd' ? (
                <AddressAddPage onNavigate={navigateToPage} />
              ) : currentPage === 'addressEdit' ? (
                <AddressEditPage addressId={pageParams.id ?? ''} onNavigate={navigateToPage} />
              ) : null}
            </OldPageHeaderProvider>
          ) : null}

          {isDrawerOpen ? (
            <button
              type="button"
              aria-label="關閉選單遮罩"
              onClick={() => setIsDrawerOpen(false)}
              className="absolute inset-0 z-20 bg-black/55"
            />
          ) : null}

          {isLanguageSheetOpen ? (
            <button
              type="button"
              aria-label="關閉語言彈層遮罩"
              onClick={() => setIsLanguageSheetOpen(false)}
              className="fixed inset-0 z-40 bg-black/55"
            />
          ) : null}

          {isWalletSheetOpen ? (
            <button
              type="button"
              aria-label="關閉錢包彈層遮罩"
              onClick={() => setIsWalletSheetOpen(false)}
              className="fixed inset-0 z-40 bg-black/55"
            />
          ) : null}

          {isNetworkSheetOpen ? (
            <button
              type="button"
              aria-label="關閉網絡彈層遮罩"
              onClick={() => { setIsNetworkSheetOpen(false); setPendingNetworkAddress(null) }}
              className="fixed inset-0 z-40 bg-black/55"
            />
          ) : null}

          <SideDrawer
            copy={copy}
            isOpen={isDrawerOpen}
            activeMenu={activeMenu}
            walletAddress={walletAddress}
            onClose={() => setIsDrawerOpen(false)}
            onMenuSelect={(label) => {
              setIsDrawerOpen(false)
              if (label === '首頁') {
                navigateToPage('home')
                return
              }
              if (label === '認購中心' || label === '我的社區') {
                if (!authToken) {
                  setFeedbackMessage(copy.loginRequired)
                  return
                }
                navigateToPage(label === '認購中心' ? 'subscription' : 'community')
                return
              }
              const pageMap: Record<string, AppPage> = {
                '算力挖礦': 'ming',
                '黃金商城': 'shop',
                '待支付訂單': 'orders',
                '邀請中心': 'user',
              }
              const page = pageMap[label]
              if (page) {
                if (!authToken) {
                  setFeedbackMessage(copy.loginRequired)
                  return
                }
                navigateToPage(page)
                return
              }
              setFeedbackMessage(copy.developing)
            }}
            onWalletConnect={handleWalletConnect}
            onWalletSwitch={handleWalletSwitch}
            onWalletDisconnect={handleWalletDisconnect}
          />

          <LanguageSheet
            copy={copy}
            isOpen={isLanguageSheetOpen}
            selectedLanguageCode={selectedLanguage.code}
            onClose={() => setIsLanguageSheetOpen(false)}
            onSelectLanguage={(code) => {
              if (code !== selectedLanguageCode) {
                window.localStorage.setItem('mcg-language', code)
                window.location.reload()
                return
              }
              setIsLanguageSheetOpen(false)
            }}
          />

          <WalletSheet
            copy={copy}
            isOpen={isWalletSheetOpen}
            walletAddress={walletAddress}
            chainName={chainName}
            isBscNetwork={isCurrentChainBsc}
            onClose={() => setIsWalletSheetOpen(false)}
            onCopyWallet={handleCopyWallet}
            onSwitch={handleWalletSwitch}
            onSwitchNetwork={handleSwitchToBsc}
            onDisconnect={handleWalletDisconnect}
            isSwitchingNetwork={isSwitchingNetwork}
          />

          <NetworkSheet
            copy={copy}
            isOpen={isNetworkSheetOpen}
            chainName={chainName}
            onClose={() => { setIsNetworkSheetOpen(false); setPendingNetworkAddress(null) }}
            onSwitchNetwork={handleSwitchToBsc}
            isSwitching={isSwitchingNetwork}
          />

          {isInviteCodeSheetOpen ? (
            <button
              type="button"
              aria-label="關閉邀請碼彈層遮罩"
              onClick={() => { setIsInviteCodeSheetOpen(false); setPendingAddress(null) }}
              className="fixed inset-0 z-40 bg-black/55"
            />
          ) : null}

          <InviteCodeSheet
            isOpen={isInviteCodeSheetOpen}
            onClose={() => { setIsInviteCodeSheetOpen(false); setPendingAddress(null) }}
            onConfirm={handleInviteCodeConfirm}
          />

          <FeedbackToast message={feedbackMessage} />
        </div>
      </div>
    </main>
  )
}
