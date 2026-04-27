import { useCallback, useEffect, useMemo, useState } from 'react'

import type { AppPage, PageParams } from '../../../figma/types'
import { BottomPopup } from '../../components/BottomPopup'
import { PageContainer } from '../../components/PageContainer'
import { PageNavBar } from '../../components/PageNavBar'
import { fetchWalletMoneyLog } from '../../services/api'
import type { WalletMoneyLogItem } from '../../services/types'

type MoneyLogPageProps = {
  onNavigate: (page: AppPage, params?: PageParams) => void
}

type CurrencyFilter = 'all' | 'USDT' | 'USDT(挖矿)'

const FILTERS: Array<{ key: CurrencyFilter; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'USDT', label: 'USDT' },
  { key: 'USDT(挖矿)', label: 'USDT(挖矿)' },
]

function formatAmount(value: number | string | undefined) {
  const num = Number(value || 0)
  const sign = num > 0 ? '+' : ''
  return `${sign}${num.toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 })}`
}

export function MoneyLogPage({ onNavigate }: MoneyLogPageProps) {
  const [list, setList] = useState<WalletMoneyLogItem[]>([])
  const [loading, setLoading] = useState(false)
  const [finished, setFinished] = useState(false)
  const [page, setPage] = useState(1)
  const [showFilter, setShowFilter] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<CurrencyFilter>('all')

  const loadData = useCallback(async (pageNum: number, reset = false) => {
    if (loading) return
    setLoading(true)
    try {
      const res = await fetchWalletMoneyLog({ page: pageNum, page_size: 20 })
      const newList = res.list ?? []
      setList((prev) => (reset ? newList : [...prev, ...newList]))
      setPage(pageNum)
      const total = Number(res.total ?? 0)
      const currentLength = (reset ? newList : [...list, ...newList]).length
      if (newList.length === 0 || (total > 0 && currentLength >= total)) {
        setFinished(true)
      }
    } catch {
      if (reset) setList([])
      setFinished(true)
    } finally {
      setLoading(false)
    }
  }, [list, loading])

  useEffect(() => {
    setList([])
    setFinished(false)
    setPage(1)
    void loadData(1, true)
  }, [loadData])

  const displayList = useMemo(() => {
    if (selectedFilter === 'all') return list
    return list.filter((item) => {
      const currency = item.currency || ''
      return currency === selectedFilter
    })
  }, [list, selectedFilter])

  return (
    <PageContainer bgClass="bg-[#05060a]">
      <PageNavBar title="资金记录" onBack={() => onNavigate('wallet')} />

      <div className="px-4 pb-24 pt-3">
        <button
          type="button"
          onClick={() => setShowFilter(true)}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#fbd005]/30 bg-[#1b1c25] px-3.5 py-1.5 text-xs text-white"
        >
          {FILTERS.find((item) => item.key === selectedFilter)?.label}
          <span className="text-[10px] text-white/65">筛选</span>
        </button>

        {displayList.length === 0 ? (
          <div className="rounded-2xl border border-white/8 bg-[#17181f] py-16 text-center text-sm text-white/45">
            暂无资金记录
          </div>
        ) : (
          <div className="space-y-3">
            {displayList.map((item) => {
              const amount = Number(item.amount || 0)
              return (
                <div key={item.id} className="rounded-2xl border border-white/8 bg-[#17181f] px-4 py-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-semibold text-white">{item.title || item.type_text || '资金变动'}</p>
                      <p className="mt-1 text-[11px] text-white/48">{item.remark || item.currency || '--'}</p>
                    </div>
                    <span className={`text-[14px] font-bold ${amount >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                      {formatAmount(item.amount)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-white/42">
                    <span>{item.currency || '--'}</span>
                    <span>{item.created_at}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!finished ? (
          <button
            type="button"
            disabled={loading}
            onClick={() => void loadData(page + 1)}
            className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm text-white/78 disabled:opacity-50"
          >
            {loading ? '加载中...' : '加载更多'}
          </button>
        ) : null}
      </div>

      <BottomPopup visible={showFilter} onClose={() => setShowFilter(false)} title="筛选币种">
        <div className="space-y-2">
          {FILTERS.map((filter) => {
            const active = filter.key === selectedFilter
            return (
              <button
                key={filter.key}
                type="button"
                onClick={() => {
                  setSelectedFilter(filter.key)
                  setShowFilter(false)
                }}
                className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${active ? 'border-[#fbd005]/60 bg-[#fbd005]/10 text-[#fbd005]' : 'border-white/10 bg-white/5 text-white/85'}`}
              >
                {filter.label}
              </button>
            )
          })}
        </div>
      </BottomPopup>
    </PageContainer>
  )
}
