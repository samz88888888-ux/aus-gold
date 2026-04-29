import { useEffect, useEffectEvent, useMemo, useState } from 'react'

import type { AppPage, PageParams } from '../../../figma/types'
import { BottomPopup } from '../../components/BottomPopup'
import { PageContainer } from '../../components/PageContainer'
import { PageNavBar } from '../../components/PageNavBar'
import { fetchWalletMoneyLog } from '../../services/api'
import type { WalletMoneyLogItem } from '../../services/types'

type MoneyLogPageProps = {
  onNavigate: (page: AppPage, params?: PageParams) => void
}

type LogTab = 'usdt' | 'usdtMine'
type FundsFilter = 0 | 1 | 2 | 3

const TABS: Array<{ key: LogTab; label: string }> = [
  { key: 'usdt', label: 'USDT' },
  { key: 'usdtMine', label: 'USDT挖矿' },
]

const FILTERS: Array<{ key: FundsFilter; label: string }> = [
  { key: 0, label: '全部' },
  { key: 1, label: '提币扣除' },
  { key: 2, label: '提币退回' },
  { key: 3, label: '收益' },
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
  const [selectedTab, setSelectedTab] = useState<LogTab>('usdt')
  const [selectedFilter, setSelectedFilter] = useState<FundsFilter>(0)

  const loadData = useEffectEvent(async (pageNum: number, reset = false) => {
    if (loading) return
    setLoading(true)
    try {
      const res = await fetchWalletMoneyLog(selectedTab, {
        page: pageNum,
        page_size: 20,
        ...(selectedFilter !== 0 ? { type: selectedFilter } : {}),
      })
      const newList = res.list ?? []
      let currentLength = newList.length
      setList((prev) => {
        const nextList = reset ? newList : [...prev, ...newList]
        currentLength = nextList.length
        return nextList
      })
      setPage(pageNum)
      const total = Number(res.total ?? 0)
      setFinished(newList.length === 0 || (total > 0 && currentLength >= total))
    } catch {
      if (reset) setList([])
      setFinished(true)
    } finally {
      setLoading(false)
    }
  })

  useEffect(() => {
    setList([])
    setFinished(false)
    setPage(1)
    void loadData(1, true)
  }, [selectedTab, selectedFilter])

  const currentTabLabel = useMemo(
    () => TABS.find((item) => item.key === selectedTab)?.label ?? 'USDT',
    [selectedTab],
  )

  return (
    <PageContainer bgClass="bg-[#05060a]">
      <PageNavBar title="资金记录" onBack={() => onNavigate('wallet')} />

      <div className="px-4 pb-24 pt-3">
        <div className="mb-4 rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(24,25,31,0.98),rgba(15,16,22,0.98))] p-2">
          <div className="grid grid-cols-2 gap-2">
            {TABS.map((tab) => {
              const active = tab.key === selectedTab
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setSelectedTab(tab.key)}
                  className={`rounded-2xl px-3 py-3 text-sm font-semibold transition ${active ? 'bg-[#fbd005] text-[#191300]' : 'bg-white/4 text-white/65'}`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-[15px] font-semibold text-white">{currentTabLabel} 资金记录</h2>
            <p className="mt-1 text-[11px] text-white/42">按资金类型筛选日志记录</p>
          </div>
          {/* <button
            type="button"
            onClick={() => setShowFilter(true)}
            className="inline-flex items-center gap-2 rounded-full border border-[#fbd005]/30 bg-[#1b1c25] px-3.5 py-1.5 text-xs text-white"
          >
            {currentFilterLabel}
            <span className="text-[10px] text-white/65">筛选</span>
          </button> */}
        </div>

        {list.length === 0 ? (
          <div className="rounded-2xl border border-white/8 bg-[#17181f] py-16 text-center text-sm text-white/45">
            暂无资金记录
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((item) => {
              const amount = Number(item.amount || 0)
              return (
                <div key={item.id} className="rounded-2xl border border-white/8 bg-[#17181f] px-4 py-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-semibold text-white">{item.msg || item.title || '资金变动'}</p>
                      <p className="mt-1 text-[11px] text-white/48">{item.remark || item.content || '--'}</p>
                    </div>
                    <span className={`text-[14px] font-bold ${amount >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                      {formatAmount(item.amount)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-white/42">
                    <span className="truncate">{item.ordernum || currentTabLabel}</span>
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

      <BottomPopup visible={showFilter} onClose={() => setShowFilter(false)} title="筛选资金类型">
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
