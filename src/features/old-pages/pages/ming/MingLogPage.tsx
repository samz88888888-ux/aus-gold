import { useEffect, useState } from 'react'

import type { AppPage, PageParams } from '../../../figma/types'
import { PageContainer } from '../../components/PageContainer'
import { PageNavBar } from '../../components/PageNavBar'
import { fetchMiningLog } from '../../services/api'
import type { MiningLogItem } from '../../services/types'

const TYPE_OPTIONS = [
  { text: '全部', value: 0 },
  { text: '激活设备', value: 1 },
  { text: '销毁挖矿', value: 2 },
  { text: '减少收益', value: 3 },
  { text: '购买节点', value: 4 },
  { text: '联合挖矿', value: 5 },
  { text: '转移算力', value: 6 },
]

type MingLogPageProps = {
  onNavigate: (page: AppPage, params?: PageParams) => void
}

export function MingLogPage({ onNavigate }: MingLogPageProps) {
  const [list, setList] = useState<MiningLogItem[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [selectedType, setSelectedType] = useState(0)
  const [showFilter, setShowFilter] = useState(false)

  useEffect(() => {
    void loadData(1, selectedType, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType])

  async function loadData(pageNum: number, powerType: number, reset = false) {
    if (loading) return
    setLoading(true)
    try {
      const params: Record<string, unknown> = { page: pageNum, page_size: 10 }
      if (powerType !== 0) {
        params.power_type = powerType
      }

      const res = await fetchMiningLog(params)
      const newList = res.list ?? []
      const nextTotal = res.total ?? 0

      setTotal(nextTotal)
      setPage(pageNum)
      setList((prev) => (reset ? newList : [...prev, ...newList]))
    } finally {
      setLoading(false)
    }
  }

  const finished = list.length >= total && total > 0
  return (
    <PageContainer bgClass="bg-[#050505]">
      <PageNavBar title="算力日志" onBack={() => onNavigate('ming')} />

      <div className="relative overflow-hidden px-4 pb-10 pt-4">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[300px] bg-[radial-gradient(circle_at_top,rgba(251,208,5,0.2),rgba(251,208,5,0.04)_42%,transparent_72%)]" />

        {/* <section className="relative rounded-[24px] border border-[#f6c640]/20 bg-[linear-gradient(165deg,rgba(24,24,24,0.98)_0%,rgba(10,10,10,0.98)_100%)] p-4 shadow-[0_14px_36px_rgba(0,0,0,0.35)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#f6c640]">
                Mining Logs
              </p>
              <h2 className="mt-1 text-[20px] font-black text-white">算力变动记录</h2>
              <p className="mt-2 text-[11px] text-white/55">
                共 {total} 条 · 当前 {list.length} 条
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowFilter(true)}
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[#f6c640]/25 bg-black/45 px-3 text-[12px] font-semibold text-[#f6c640]"
            >
              {selectedLabel}
              <img src="/old-pages/ming/arrow-down.png" alt="" className="h-2.5 w-2.5 opacity-80" />
            </button>
          </div>
        </section> */}

        <section className="mt-4 space-y-3">
          {list.map((item) => (
            <LogCard key={item.id} item={item} />
          ))}
        </section>

        <LoadStatus
          loading={loading}
          finished={finished}
          hasData={list.length > 0}
          onLoadMore={() => void loadData(page + 1, selectedType)}
        />
      </div>

      <FilterSheet
        visible={showFilter}
        selected={selectedType}
        onSelect={(value) => {
          setSelectedType(value)
          setShowFilter(false)
        }}
        onClose={() => setShowFilter(false)}
      />
    </PageContainer>
  )
}

function LogCard({ item }: { item: MiningLogItem }) {
  const isPositive = item.power >= 0
  const typeText = item.msg || '未知类型'

  return (
    <article className="rounded-[20px] border border-white/8 bg-[linear-gradient(160deg,rgba(25,25,25,0.95),rgba(10,10,10,0.95))] p-4 shadow-[0_10px_26px_rgba(0,0,0,0.24)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-[16px] font-black leading-none tabular-nums ${isPositive ? 'text-[#67e39d]' : 'text-[#ff6b6b]'}`}>
            {isPositive ? '+' : ''}
            {fmt(item.power)}
          </p>
          <div className="mt-2 flex items-center gap-1.5">
            <img src="/old-pages/ming/dot.svg" alt="" className="h-1.5 w-1.5" />
            <span className="text-[11px] text-white/45">{item.created_at}</span>
          </div>
        </div>

        <span className="rounded-full border border-[#f6c640]/26 bg-[#f6c640]/10 px-2.5 py-1 text-[11px] font-semibold text-[#f6c640]">
          {typeText}
        </span>
      </div>

      {/* {item.remark ? (
        <p className="mt-3 rounded-[12px] border border-white/7 bg-white/[0.03] px-3 py-2 text-[12px] text-white/52">
          {item.remark}
        </p>
      ) : null} */}
    </article>
  )
}

function fmt(value: number | string | undefined) {
  if (!value && value !== 0) return '0.00'
  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  })
}

function LoadStatus({
  loading,
  finished,
  hasData,
  onLoadMore,
}: {
  loading: boolean
  finished: boolean
  hasData: boolean
  onLoadMore: () => void
}) {
  if (loading) {
    return <p className="py-7 text-center text-[13px] text-white/35">加载中...</p>
  }

  if (!hasData) {
    return <p className="py-20 text-center text-[13px] text-white/30">暂无记录</p>
  }

  if (finished) {
    return <p className="py-7 text-center text-[13px] text-white/30">没有更多了</p>
  }

  return (
    <button
      type="button"
      onClick={onLoadMore}
      className="mt-4 w-full rounded-[16px] border border-[#f6c640]/20 bg-[#f6c640]/10 py-3 text-[13px] font-semibold text-[#f6c640] transition active:scale-[0.99]"
    >
      加载更多
    </button>
  )
}

function FilterSheet({
  visible,
  selected,
  onSelect,
  onClose,
}: {
  visible: boolean
  selected: number
  onSelect: (v: number) => void
  onClose: () => void
}) {
  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button type="button" className="absolute inset-0 bg-black/72 backdrop-blur-sm" onClick={onClose} aria-label="关闭" />

      <div className="relative w-full max-w-[430px] overflow-hidden rounded-t-[26px] border border-white/10 bg-[#0f0f10] shadow-[0_-20px_50px_rgba(0,0,0,0.4)]">
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-[4px] w-10 rounded-full bg-white/16" />
        </div>

        <div className="px-5 pb-8 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-black text-white">篩選類型</h2>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <line x1="5" y1="5" x2="15" y2="15" />
                <line x1="15" y1="5" x2="5" y2="15" />
              </svg>
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5">
            {TYPE_OPTIONS.map((opt) => {
              const active = opt.value === selected
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onSelect(opt.value)}
                  className={[
                    'rounded-[14px] px-4 py-3 text-[12px] font-semibold transition',
                    active
                      ? 'border border-[#f6c640] bg-[#f6c640]/14 text-[#f6c640]'
                      : 'border border-white/10 bg-white/[0.02] text-white/55',
                  ].join(' ')}
                >
                  {opt.text}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
