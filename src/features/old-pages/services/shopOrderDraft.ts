import type { ShopOrderDraft } from './types'

const SHOP_ORDER_DRAFT_KEY = 'old-pages-shop-order-draft'

export function saveShopOrderDraft(draft: ShopOrderDraft) {
  sessionStorage.setItem(SHOP_ORDER_DRAFT_KEY, JSON.stringify(draft))
}

export function getShopOrderDraft(): ShopOrderDraft | null {
  const raw = sessionStorage.getItem(SHOP_ORDER_DRAFT_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as ShopOrderDraft
  } catch {
    return null
  }
}

export function clearShopOrderDraft() {
  sessionStorage.removeItem(SHOP_ORDER_DRAFT_KEY)
}
