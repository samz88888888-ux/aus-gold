import type { ReactNode } from 'react'

export type MenuItem = {
  label: string
  icon: (props: { className?: string }) => ReactNode
}

export type LanguageCode = 'zh-TW' | 'en' | 'ko' | 'ja' | 'th' | 'ms'

export type LanguageOption = {
  label: string
  flagUrl: string
  code: LanguageCode
}

export type AdvantageCard = {
  code: string
  title: string
  description: string
  image: string
}

export type ModelItem = {
  title: string
  description: string
}

export type AppPage =
  | 'home'
  | 'subscription'
  | 'community'
  | 'ming'
  | 'mingLog'
  | 'destoryList'
  | 'shop'
  | 'shopDetail'
  | 'shopOrderList'
  | 'shopOrderRelease'
  | 'shopOrderConfirm'
  | 'orders'
  | 'user'
  | 'address'
  | 'addressAdd'
  | 'addressEdit'

export type PageParams = {
  id?: string | number
  from?: string
  address_id?: string
  group_id?: string
  status?: string
  state?: unknown
}

export type SubscriptionPlanId = 'ops' | 'studio' | 'super' | 'normal'

export type SubscriptionPlan = {
  id: SubscriptionPlanId
  tabLabel: string
  title: string
  description: string
  amount: string
  quantity: string
  icon: string
  power: string
  level: string
  reinvest: string
  timeBonus: string
  purchased?: boolean
}

export type CopyText = {
  home: string
  subscriptionCenter: string
  wallet: string
  walletConnected: string
  walletMissing: string
  walletRejected: string
  walletCopied: string
  walletTitle: string
  walletDescription: string
  walletConnectAction: string
  walletCopyAction: string
  developing: string
  languageTitle: string
  close: string
  notice: string
  noticeContent: string
  menuClose: string
  activeLabel: string
  heroTitle: string
  heroDescription: string
  heroButton: string
  advantagesTitle: string
  advantagesBadge: string
  modelTitle: string
  partnersTitle: string
  contactTitle: string
  subscribeNow: string
  purchaseQueued: string
  walletSwitch: string
  walletDisconnect: string
  walletDisconnected: string
  networkCurrent: string
  networkUnsupported: string
  networkSwitchTitle: string
  networkSwitchDescription: string
  networkSwitchAction: string
  networkReady: string
  networkBscName: string
  communityTitle: string
  communityDesc: string
  inviteTitle: string
  inviteDesc: string
  inviteCopy: string
  inviteCopied: string
  teamTitle: string
  teamTotal: string
  teamDirect: string
  teamIndirect: string
  loginRequired: string
}

export type BrowserEthereum = {
  request: (args: { method: string; params?: unknown[] | Record<string, unknown>[] }) => Promise<unknown>
  on?: (event: string, listener: (...args: unknown[]) => void) => void
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => void
}

declare global {
  interface Window {
    ethereum?: BrowserEthereum
  }
}
