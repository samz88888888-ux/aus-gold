import { useState, useEffect, useCallback } from 'react'
import { PageContainer } from '../../components/PageContainer'
import { PageNavBar } from '../../components/PageNavBar'
import { fetchMiningLog } from '../../services/api'
import type { MiningLogItem } from '../../services/types'
import type { AppPage, PageParams } from '../../../figma/types'

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
  const [selectedType, setSelectedType] = useState(0)
  const [showFilter, setShowFilter] = useState(false)
  const [loading, setLoading] = useState(false)

  const loadData = useCallback(async (powerType: number) => {
    setLoading(true)
    try {
      const res = await fetchMiningLog({ page: 1, page_size: 50, power_type: powerType || undefined })
      setList(res.list)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { loadData(selectedType) }, [selectedType, loadData])

  const selectedLabel = TYPE_OPTIONS.find(o => o.value === selectedType)?.text ?? '全部'

  return (
    <PageContainer bgClass="bg-[#07071a]">
      <div className="relative min-h-screen">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[300px]"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(251,208,5,0.08) 0%, transparent 70%)' }} />

        <PageNavBar title="算力日志" onBack={() => onNavigate('ming')} />

        <div className="relative px-4 pt-2 pb-8">
          <FilterChip label={selectedLabel} onClick={() => setShowFilter(true)} />
          <LogList list={list} loading={loading} />
        </div>

        <FilterSheet
          visible={showFilter}
          selected={selectedType}
          onSelect={(v) => { setSelectedType(v); setShowFilter(false) }}
          onClose={() => setShowFilter(false)}
        />
      </div>
    </PageContainer>
  )
}

function FilterChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="mb-4 flex items-center gap-1.5 rounded-full border border-[#fbd005]/20 bg-[#fbd005]/8 px-4 py-2 transition active:scale-95">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbd005" strokeWidth="2" strokeLinecap="round">
        <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
      </svg>
      <span className="text-xs font-medium text-[#fbd005]">{label}</span>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fbd005" strokeWidth="2.5" strokeLinecap="round">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>
  )
}

function LogList({ list, loading }: { list: MiningLogItem[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#fbd005]/30 border-t-[#fbd005]" />
        <span className="mt-3 text-xs text-white/30">加载中...</span>
      </div>
    )
  }
  if (list.length === 0) {
    return (
      <div className="flex flex-col items-center py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.04]">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>
        <span className="mt-3 text-sm text-white/25">暂无记录</span>
      </div>
    )
  }
  return (
    <div className="space-y-2.5">
      {list.map(item => <LogCard key={item.id} item={item} />)}
    </div>
  )
}

function LogCard({ item }: { item: MiningLogItem }) {
  const isPositive = !item.amount.startsWith('-')
  return (
    <div className="rounded-2xl border border-white/[0.06] px-4 py-3.5"
      style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)' }}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-[#fbd005]/10 px-2 py-0.5 text-[10px] font-medium text-[#fbd005]">
              {item.type_text}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <div className="h-1 w-1 rounded-full bg-white/20" />
            <span className="text-[12px] text-white/35">{item.created_at}</span>
          </div>
          {item.remark && (
            <p className="mt-1.5 text-[11px] leading-relaxed text-white/30">{item.remark}</p>
          )}
        </div>
        <span className={`text-base font-semibold tabular-nums ${isPositive ? 'text-[#4ade80]' : 'text-[#f87171]'}`}>
          {isPositive ? '+' : ''}{item.amount}
        </span>
      </div>
    </div>
  )
}

function FilterSheet({ visible, selected, onSelect, onClose }: {
  visible: boolean
  selected: number
  onSelect: (v: number) => void
  onClose: () => void
}) {
  if (!visible) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button type="button" className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-label="关闭" />
      <div className="relative w-full max-w-[430px] rounded-t-[24px]"
        style={{ backgroundColor: '#fffdf8', animation: 'slideUp 0.3s ease' }}>
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-[4px] w-10 rounded-full bg-black/12" />
        </div>
        <div className="px-5 pb-8 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-bold text-black">筛选类型</h2>
            <button type="button" onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-black/8 bg-black/4 text-black/50">
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <line x1="5" y1="5" x2="15" y2="15" />
                <line x1="15" y1="5" x2="5" y2="15" />
              </svg>
            </button>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            {TYPE_OPTIONS.map(opt => {
              const active = opt.value === selected
              return (
                <button key={opt.value} type="button" onClick={() => onSelect(opt.value)}
                  className={[
                    'rounded-xl px-4 py-3 text-[13px] font-medium transition',
                    active
                      ? 'border-2 border-[#fbd005] bg-[#fbd005]/10 text-[#b8860b] shadow-[0_2px_8px_rgba(251,208,5,0.15)]'
                      : 'border border-black/8 bg-black/[0.02] text-black/50 hover:bg-black/[0.04]',
                  ].join(' ')}>
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
