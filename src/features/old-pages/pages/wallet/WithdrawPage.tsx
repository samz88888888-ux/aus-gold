import { useEffect, useEffectEvent, useMemo, useRef, useState } from 'react'

import type { AppPage, PageParams } from '../../../figma/types'
import { BottomPopup } from '../../components/BottomPopup'
import { NoticePopup } from '../../components/NoticePopup'
import { PageContainer } from '../../components/PageContainer'
import { PageNavBar } from '../../components/PageNavBar'
import {
  applyWithdraw,
  fetchUserInfoOld,
  fetchWithdrawConfig,
  fetchWithdrawList,
  fetchWithdrawMinerDetail,
} from '../../services/api'
import type {
  UserInfo,
  WithdrawConfigData,
  WithdrawDayConfigItem,
  WithdrawMinerDetailItem,
  WithdrawRecordItem,
} from '../../services/types'

type WithdrawPageProps = {
  onNavigate: (page: AppPage, params?: PageParams) => void
}

type CurrencyType = 'USDT' | 'USDT_MINE'
type RecordFilter = 'all' | CurrencyType

type NoticeState = {
  title?: string
  message: string
  confirmText?: string
  onConfirm?: () => void
}

const TOKEN_ICON = '/old-pages/wallet/usdt-coin.png'
const AUS_ICON = '/old-pages/wallet/mcg-coin.png'

const COINS: Array<{ key: CurrencyType; label: string; subtitle: string }> = [
  { key: 'USDT', label: 'USDT', subtitle: '输入数量后可直接提交' },
  { key: 'USDT_MINE', label: 'USDT挖矿', subtitle: '按价格换算 AUS 并按天自动到账' },
]

const RECORD_FILTERS: Array<{ key: RecordFilter; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'USDT', label: 'USDT' },
  { key: 'USDT_MINE', label: 'USDT挖矿' },
]

function fmt(value: number | string | undefined, digits = 6) {
  return Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

function shortAddress(addr: string) {
  if (!addr) return '--'
  if (addr.length <= 14) return addr
  return `${addr.slice(0, 6)}...${addr.slice(-6)}`
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message
  return fallback
}

function getRecordTypeLabel(coinType: number) {
  return coinType === 2 ? 'USDT挖矿' : 'USDT'
}

function getRecordStatusMeta(status: number) {
  if (status === 1) {
    return { label: '已完成', className: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200' }
  }
  if (status === 2) {
    return { label: '已退款', className: 'border-rose-400/20 bg-rose-400/10 text-rose-200' }
  }
  return { label: '提现中', className: 'border-sky-400/20 bg-sky-400/10 text-sky-200' }
}

function getRealCurrencyName(realCoinId: number) {
  if (realCoinId === 1) return 'USDT'
  if (realCoinId === 2) return 'PYTHIA'
  if (realCoinId === 3 || realCoinId === 5) return 'AUS'
  return '--'
}

function getRecordCurrencyFilter(item: WithdrawRecordItem): RecordFilter {
  return item.coin_type === 2 ? 'USDT_MINE' : 'USDT'
}

function buildNotice(message: string, onClose: () => void): NoticeState {
  return {
    message,
    onConfirm: onClose,
  }
}

export function WithdrawPage({ onNavigate }: WithdrawPageProps) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [config, setConfig] = useState<WithdrawConfigData | null>(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyType>('USDT')
  const [selectedDayId, setSelectedDayId] = useState('')
  const [amount, setAmount] = useState('')
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false)

  const [showRecords, setShowRecords] = useState(false)
  const [recordFilter, setRecordFilter] = useState<RecordFilter>('all')
  const [recordList, setRecordList] = useState<WithdrawRecordItem[]>([])
  const [recordPage, setRecordPage] = useState(1)
  const [recordFinished, setRecordFinished] = useState(false)
  const [recordLoading, setRecordLoading] = useState(false)

  const [selectedRecord, setSelectedRecord] = useState<WithdrawRecordItem | null>(null)
  const [detailList, setDetailList] = useState<WithdrawMinerDetailItem[]>([])
  const [detailLoading, setDetailLoading] = useState(false)

  const [notice, setNotice] = useState<NoticeState | null>(null)
  const initLoadedRef = useRef(false)
  const pageRequestingRef = useRef(false)

  const loadPageData = useEffectEvent(async (force = false) => {
    if (pageRequestingRef.current) return
    if (!force && initLoadedRef.current) return

    pageRequestingRef.current = true
    setPageLoading(true)
    try {
      const [userResult, withdrawConfigResult] = await Promise.allSettled([
        fetchUserInfoOld(),
        fetchWithdrawConfig(),
      ])

      if (userResult.status === 'fulfilled') {
        setUserInfo(userResult.value)
      }

      if (withdrawConfigResult.status === 'fulfilled') {
        setConfig(withdrawConfigResult.value)
      }

      initLoadedRef.current = true

      if (userResult.status === 'rejected' && withdrawConfigResult.status === 'rejected') {
        setNotice(buildNotice('用户信息与提现配置加载失败', () => setNotice(null)))
        return
      }

      if (withdrawConfigResult.status === 'rejected') {
        setNotice(buildNotice(getErrorMessage(withdrawConfigResult.reason, '提现配置加载失败'), () => setNotice(null)))
      } else if (userResult.status === 'rejected') {
        setNotice(buildNotice(getErrorMessage(userResult.reason, '用户信息加载失败'), () => setNotice(null)))
      }
    } finally {
      pageRequestingRef.current = false
      setPageLoading(false)
    }
  })

  const loadRecords = useEffectEvent(async (pageNum: number, reset = false) => {
    if (recordLoading) return
    setRecordLoading(true)
    try {
      const res = await fetchWithdrawList({ page: pageNum, page_size: 10 })
      const nextList = res.list ?? []
      const mergedList = reset ? nextList : [...recordList, ...nextList]
      setRecordList(mergedList)
      setRecordPage(pageNum)
      setRecordFinished(nextList.length === 0 || mergedList.length >= Number(res.total ?? 0))
    } catch (error) {
      if (reset) setRecordList([])
      setRecordFinished(true)
      setNotice(buildNotice(getErrorMessage(error, '提现记录加载失败'), () => setNotice(null)))
    } finally {
      setRecordLoading(false)
    }
  })

  const loadRecordDetail = useEffectEvent(async (wid: number) => {
    setDetailLoading(true)
    try {
      const res = await fetchWithdrawMinerDetail({ wid })
      setDetailList(res.list ?? [])
    } catch (error) {
      setDetailList([])
      setNotice(buildNotice(getErrorMessage(error, '到账明细加载失败'), () => setNotice(null)))
    } finally {
      setDetailLoading(false)
    }
  })

  useEffect(() => {
    void loadPageData()
  }, [])

  useEffect(() => {
    if (selectedCurrency !== 'USDT_MINE') {
      setSelectedDayId('')
      return
    }

    const firstDay = config?.usdt_mine_config.day_list?.[0]
    if (!firstDay) return

    const exists = config?.usdt_mine_config.day_list.some((item) => String(item.id) === selectedDayId)
    if (!exists) {
      setSelectedDayId(String(firstDay.id))
    }
  }, [config, selectedCurrency, selectedDayId])

  useEffect(() => {
    if (!showRecords) return
    void loadRecords(1, true)
  }, [showRecords])

  useEffect(() => {
    if (!selectedRecord || selectedRecord.coin_type !== 2) {
      setDetailList([])
      return
    }
    void loadRecordDetail(selectedRecord.id)
  }, [selectedRecord])

  const address = userInfo?.address || userInfo?.wallet_address || userInfo?.name || ''
  const selectedCoinMeta = COINS.find((item) => item.key === selectedCurrency) ?? COINS[0]
  const selectedConfig = selectedCurrency === 'USDT' ? config?.usdt_config : config?.usdt_mine_config
  const available = selectedCurrency === 'USDT'
    ? Number(userInfo?.usdt || 0)
    : Number(userInfo?.usdt_mine || 0)
  const selectedDay = useMemo<WithdrawDayConfigItem | null>(() => {
    if (selectedCurrency !== 'USDT_MINE') return null
    return config?.usdt_mine_config.day_list.find((item) => String(item.id) === selectedDayId) ?? null
  }, [config?.usdt_mine_config.day_list, selectedCurrency, selectedDayId])

  const amountNumber = Number(amount || 0)
  const minWithdraw = Number(selectedConfig?.min_withdraw || 0)
  const maxWithdraw = Number(selectedConfig?.max_withdraw || 0)
  const feeRate = Number(
    selectedCurrency === 'USDT_MINE'
      ? selectedDay?.fee_rate ?? 0
      : selectedConfig?.fee_rate ?? 0,
  ) / 100
  const feeAmount = amountNumber > 0 ? amountNumber * feeRate : 0
  const actualUsdtAmount = Math.max(amountNumber - feeAmount, 0)
  const coinPrice = Number(selectedConfig?.coin_price || 0)
  const ausAmount = amountNumber > 0 ? amountNumber * coinPrice : 0
  const actualAusAmount = actualUsdtAmount * coinPrice
  const dailyAusAmount = selectedDay ? actualAusAmount / Number(selectedDay.day || 1) : 0

  const displayRecords = useMemo(() => {
    if (recordFilter === 'all') return recordList
    return recordList.filter((item) => getRecordCurrencyFilter(item) === recordFilter)
  }, [recordFilter, recordList])

  const handleSubmit = async () => {
    if (!selectedConfig) {
      setNotice(buildNotice('提现配置加载中，请稍后再试', () => setNotice(null)))
      return
    }

    if (Number(selectedConfig.withdraw_enable) !== 1) {
      setNotice(buildNotice('当前币种暂不可提现', () => setNotice(null)))
      return
    }

    if (!amount.trim() || Number.isNaN(amountNumber) || amountNumber <= 0) {
      setNotice(buildNotice('请输入正确的提现数量', () => setNotice(null)))
      return
    }

    if (amountNumber < minWithdraw) {
      setNotice(buildNotice(`最少提现 ${fmt(minWithdraw)} ${selectedCoinMeta.label}`, () => setNotice(null)))
      return
    }

    if (maxWithdraw > 0 && amountNumber > maxWithdraw) {
      setNotice(buildNotice(`单次最多提现 ${fmt(maxWithdraw)} ${selectedCoinMeta.label}`, () => setNotice(null)))
      return
    }

    if (amountNumber > available) {
      setNotice(buildNotice('提现数量超过可用余额', () => setNotice(null)))
      return
    }

    if (selectedCurrency === 'USDT_MINE' && !selectedDay) {
      setNotice(buildNotice('请选择到账天数', () => setNotice(null)))
      return
    }

    setSubmitting(true)
    try {
      await applyWithdraw({
        num: amount.trim(),
        coin_type: selectedCurrency === 'USDT' ? 1 : 2,
        conf_id: selectedCurrency === 'USDT_MINE' ? selectedDay?.id : undefined,
      })
      setAmount('')
      await loadPageData(true)
      if (showRecords) {
        await loadRecords(1, true)
      }
      setNotice({
        message: selectedCurrency === 'USDT'
          ? 'USDT 提现申请已提交'
          : 'USDT挖矿提现申请已提交，可在记录中查看分天到账明细',
        confirmText: '查看记录',
        onConfirm: () => {
          setNotice(null)
          setShowRecords(true)
        },
      })
    } catch (error) {
      setNotice(buildNotice(getErrorMessage(error, '提现提交失败'), () => setNotice(null)))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageContainer bgClass="bg-[#05060a]">
      <PageNavBar title="提现" onBack={() => onNavigate('wallet')} />

      <div className="min-h-[calc(100vh-48px)] overflow-hidden bg-[radial-gradient(circle_at_top,rgba(251,208,5,0.14),transparent_30%),linear-gradient(180deg,#08090d_0%,#05060a_100%)] px-4 pb-8 pt-4">
        <div className="flex min-h-full flex-col">
          <section className="relative overflow-hidden rounded-[28px] border border-[#f5d773]/12 bg-[linear-gradient(135deg,rgba(34,28,11,0.95),rgba(14,15,21,0.98))] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#fbd005]/12 blur-3xl" />
            <div className="relative">
              <div className="flex items-center justify-between gap-3">
                <div className="inline-flex items-center rounded-full border border-[#fbd005]/18 bg-[linear-gradient(180deg,rgba(251,208,5,0.14),rgba(251,208,5,0.06))] px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#ffe08a]/84">
                    Withdraw
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRecords(true)}
                  className="inline-flex h-10 shrink-0 items-center rounded-full border border-[#fbd005]/22 bg-[linear-gradient(180deg,rgba(251,208,5,0.1),rgba(251,208,5,0.04))] px-4 text-[12px] font-semibold text-[#ffe08a] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] active:opacity-80"
                >
                  提现记录
                </button>
              </div>

              <div className="mt-4">
                <h2 className="text-[19px] font-black leading-none tracking-[-0.02em] text-white">
                  灵活提现 AUS / USDT
                </h2>
                <p className="mt-3 max-w-[280px] text-[11px] leading-5 text-white/55">
                  USDT
                  可直接申请提现，1股权算力值🟰1usdt，按照Aus实时价格进行兑换，并按照选定天数逐日到账
                </p>
              </div>
            </div>

            <div className="relative mt-5 grid grid-cols-2 gap-3">
              <MetricCard
                label="钱包账户"
                value={shortAddress(address)}
                highlight={false}
              />
              <MetricCard
                label={
                  selectedCurrency === 'USDT' ? '可提 USDT' : '可提 USDT挖矿'
                }
                value={fmt(available)}
              />
            </div>
          </section>

          <section className="mt-4 flex-1 rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(26,27,34,0.95),rgba(14,15,21,0.98))] p-4 shadow-[0_18px_42px_rgba(0,0,0,0.2)]">
            {pageLoading ? (
              <div className="flex h-full min-h-[360px] items-center justify-center text-sm text-white/45">
                提现配置加载中...
              </div>
            ) : (
              <div className="flex h-full flex-col">
                <div className="space-y-4">
                  <div>
                    <p className="text-[12px] text-white/48">提现币种</p>
                    <button
                      type="button"
                      onClick={() => setShowCurrencyPicker(true)}
                      className="mt-2 flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/4 px-4 py-4 text-left"
                    >
                      <span className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fbd005]/10">
                          <img
                            src={
                              selectedCurrency === 'USDT'
                                ? TOKEN_ICON
                                : AUS_ICON
                            }
                            alt={selectedCoinMeta.label}
                            className="h-7 w-7 object-contain"
                          />
                        </span>
                        <span>
                          <span className="block text-[15px] font-semibold text-white">
                            {selectedCoinMeta.label}
                          </span>
                          <span className="mt-0.5 block text-[11px] text-white/45">
                            {selectedCoinMeta.subtitle}
                          </span>
                        </span>
                      </span>
                      <span className="text-[11px] text-[#ffe08a]">切换</span>
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-[12px] text-white/48">提现数量</p>
                      <span className="text-[11px] text-white/38">
                        限额 {fmt(minWithdraw)} - {fmt(maxWithdraw)}{' '}
                        {selectedCoinMeta.label}
                      </span>
                    </div>
                    <div className="mt-2 rounded-[24px] border border-white/10 bg-white/4 px-4 py-4">
                      <div className="flex items-center gap-3">
                        <input
                          value={amount}
                          onChange={(e) =>
                            setAmount(e.target.value.replace(/[^\d.]/g, ''))
                          }
                          placeholder={
                            selectedCurrency === 'USDT'
                              ? '输入 USDT 数量'
                              : '输入 USDT挖矿 数量'
                          }
                          inputMode="decimal"
                          className="w-full bg-transparent text-[24px] font-black text-white outline-none placeholder:text-white/18"
                        />
                        <button
                          type="button"
                          onClick={() => setAmount(String(available))}
                          className="shrink-0 rounded-full border border-[#fbd005]/28 px-3 py-1 text-[11px] font-semibold text-[#ffe08a]"
                        >
                          全部
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-[11px] text-white/40">
                        <span>
                          可用余额 {fmt(available)} {selectedCoinMeta.label}
                        </span>
                        <span>
                          当日可申请{' '}
                          {selectedConfig?.daily_max_withdraw ?? '--'} 次
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedCurrency === 'USDT_MINE' ? (
                    <div>
                      <p className="text-[12px] text-white/48">到账天数</p>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {(config?.usdt_mine_config.day_list ?? []).map(
                          (item) => {
                            const active = String(item.id) === selectedDayId
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() =>
                                  setSelectedDayId(String(item.id))
                                }
                                className={`rounded-2xl border px-3 py-3 text-left transition ${active ? 'border-[#fbd005]/55 bg-[#fbd005]/10 text-[#ffe08a]' : 'border-white/10 bg-white/4 text-white/78'}`}
                              >
                                <span className="block text-[15px] font-bold">
                                  {item.day} 天
                                </span>
                                <span className="mt-1 block text-[11px] text-inherit/75">
                                  手续费 {item.fee_rate}%
                                </span>
                              </button>
                            )
                          }
                        )}
                      </div>
                    </div>
                  ) : null}

                  <div className="grid grid-cols-2 gap-3">
                    <MetricCard
                      label={
                        selectedCurrency === 'USDT'
                          ? '预计到账 USDT'
                          : '预计总到账 AUS'
                      }
                      value={fmt(
                        selectedCurrency === 'USDT'
                          ? actualUsdtAmount
                          : actualAusAmount
                      )}
                    />
                    <MetricCard
                      label={
                        selectedCurrency === 'USDT'
                          ? '手续费'
                          : '预计每日到账 AUS'
                      }
                      value={fmt(
                        selectedCurrency === 'USDT' ? feeAmount : dailyAusAmount
                      )}
                      highlight={selectedCurrency === 'USDT_MINE'}
                    />
                  </div>

                  <div className="rounded-[22px] border border-[#fbd005]/12 bg-[#0f1118] px-4 py-3">
                    <div className="flex items-center justify-between text-[12px] text-white/62">
                      <span>价格换算</span>
                      <span>1 USDT = {fmt(coinPrice)} AUS</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[12px] text-white/45">
                      <span>手续费率</span>
                      <span>{(feeRate * 100).toFixed(2)}%</span>
                    </div>
                    {selectedCurrency === 'USDT_MINE' ? (
                      <div className="mt-2 flex items-center justify-between text-[12px] text-white/45">
                        <span>按输入数量换算 AUS</span>
                        <span>{fmt(ausAmount)} AUS</span>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="mt-auto pt-5">
                  <button
                    type="button"
                    disabled={pageLoading || submitting}
                    onClick={() => void handleSubmit()}
                    className="w-full rounded-[22px] bg-gradient-to-r from-[#fff3a6] via-[#fbd005] to-[#e7a700] py-4 text-[15px] font-black text-[#1b1400] shadow-[0_18px_34px_rgba(251,208,5,0.22)] disabled:opacity-55"
                  >
                    {submitting
                      ? '提交中...'
                      : selectedCurrency === 'USDT'
                        ? '提交 USDT 提现'
                        : '提交 USDT挖矿 提现'}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      <BottomPopup
        visible={showCurrencyPicker}
        onClose={() => setShowCurrencyPicker(false)}
        title="选择提现币种"
      >
        <div className="space-y-2">
          {COINS.map((coin) => {
            const active = coin.key === selectedCurrency
            return (
              <button
                key={coin.key}
                type="button"
                onClick={() => {
                  setSelectedCurrency(coin.key)
                  setAmount('')
                  setShowCurrencyPicker(false)
                }}
                className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left ${active ? 'border-[#fbd005]/60 bg-[#fbd005]/10' : 'border-white/10 bg-white/5'}`}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/6">
                  <img
                    src={coin.key === 'USDT' ? TOKEN_ICON : AUS_ICON}
                    alt={coin.label}
                    className="h-7 w-7 object-contain"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={`block text-sm font-semibold ${active ? 'text-[#ffe08a]' : 'text-white/88'}`}
                  >
                    {coin.label}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-white/45">
                    {coin.subtitle}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </BottomPopup>

      <BottomPopup
        visible={showRecords}
        onClose={() => setShowRecords(false)}
        title="提现记录"
      >
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {RECORD_FILTERS.map((filter) => {
              const active = filter.key === recordFilter
              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setRecordFilter(filter.key)}
                  className={`rounded-full px-3 py-1.5 text-[12px] font-medium ${active ? 'bg-[#fbd005] text-[#1a1400]' : 'bg-white/6 text-white/65'}`}
                >
                  {filter.label}
                </button>
              )
            })}
          </div>

          <div className="max-h-[62vh] space-y-3 overflow-y-auto pr-1">
            {displayRecords.length === 0 && !recordLoading ? (
              <div className="rounded-2xl border border-white/8 bg-white/4 py-12 text-center text-sm text-white/45">
                暂无提现记录
              </div>
            ) : null}

            {displayRecords.map((item) => (
              <RecordCard
                key={item.id}
                item={item}
                onViewDetail={() => setSelectedRecord(item)}
              />
            ))}

            {!recordFinished ? (
              <button
                type="button"
                disabled={recordLoading}
                onClick={() => void loadRecords(recordPage + 1)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 text-sm text-white/78 disabled:opacity-50"
              >
                {recordLoading ? '加载中...' : '加载更多'}
              </button>
            ) : null}
          </div>
        </div>
      </BottomPopup>

      <BottomPopup
        visible={selectedRecord !== null}
        onClose={() => setSelectedRecord(null)}
        title={selectedRecord?.coin_type === 2 ? 'AUS 到账明细' : '提现详情'}
      >
        {!selectedRecord ? null : selectedRecord.coin_type !== 2 ? (
          <div className="space-y-3">
            <MetricCard
              label="订单编号"
              value={selectedRecord.no}
              highlight={false}
            />
            <MetricCard
              label="实际到账"
              value={`${fmt(selectedRecord.real_ac_amount)} ${getRealCurrencyName(selectedRecord.real_coin_id)}`}
            />
            <MetricCard
              label="创建时间"
              value={selectedRecord.created_at}
              highlight={false}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                label="提现 USDT挖矿"
                value={fmt(selectedRecord.num)}
              />
              <MetricCard
                label="总到账 AUS"
                value={fmt(selectedRecord.real_ac_amount)}
                highlight
              />
            </div>

            <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
              {detailLoading ? (
                <div className="rounded-2xl border border-white/8 bg-white/4 py-12 text-center text-sm text-white/45">
                  到账明细加载中...
                </div>
              ) : detailList.length === 0 ? (
                <div className="rounded-2xl border border-white/8 bg-white/4 py-12 text-center text-sm text-white/45">
                  暂无到账明细
                </div>
              ) : (
                detailList.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-[20px] border border-white/8 bg-white/4 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[14px] font-semibold text-white">
                          第 {index + 1} 笔自动到账
                        </p>
                        <p className="mt-1 text-[11px] text-white/42">
                          {item.push_time || '--'}
                        </p>
                      </div>
                      <span
                        className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-semibold ${getRecordStatusMeta(item.status).className}`}
                      >
                        {getRecordStatusMeta(item.status).label}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <DetailValue label="USDT 数量" value={fmt(item.num)} />
                      <DetailValue
                        label="到账 AUS"
                        value={fmt(item.real_ac_amount)}
                      />
                      <DetailValue
                        label="手续费 AUS"
                        value={fmt(item.real_fee_amount)}
                      />
                      <DetailValue label="订单号" value={item.ordernum} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </BottomPopup>

      <NoticePopup
        visible={notice !== null}
        title={notice?.title}
        message={notice?.message ?? ''}
        confirmText={notice?.confirmText}
        onClose={() => setNotice(null)}
        onConfirm={notice?.onConfirm}
      />
    </PageContainer>
  )
}

function MetricCard({ label, value, highlight = true }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-[22px] border px-4 py-3 ${highlight ? 'border-[#fbd005]/14 bg-[#fbd005]/6' : 'border-white/8 bg-white/4'}`}>
      <p className="text-[11px] text-white/45">{label}</p>
      <p className={`mt-2 truncate text-[14px] font-bold ${highlight ? 'text-[#fff0aa]' : 'text-white'}`}>{value}</p>
    </div>
  )
}

function DetailValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-black/20 px-3 py-2.5">
      <p className="text-[10px] text-white/42">{label}</p>
      <p className="mt-1 break-all text-[12px] font-medium text-white/88">{value}</p>
    </div>
  )
}

function RecordCard({
  item,
  onViewDetail,
}: {
  item: WithdrawRecordItem
  onViewDetail: () => void
}) {
  const status = getRecordStatusMeta(item.status)
  const realCurrency = getRealCurrencyName(item.real_coin_id)

  return (
    <div className="rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/8 px-2.5 py-1 text-[10px] font-semibold text-white/78">
              {getRecordTypeLabel(item.coin_type)}
            </span>
            <span className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-semibold ${status.className}`}>
              {status.label}
            </span>
          </div>
          <p className="mt-2 truncate text-[13px] font-semibold text-white">{item.no}</p>
          <p className="mt-1 text-[11px] text-white/42">{item.created_at}</p>
        </div>

        <div className="text-right">
          <p className="text-[11px] text-white/42">申请数量</p>
          <p className="mt-1 text-[18px] font-black text-white">{fmt(item.num)}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <DetailValue label="到账币种" value={realCurrency} />
        <DetailValue label="实际到账" value={fmt(item.real_ac_amount)} />
        <DetailValue label="手续费" value={fmt(item.fee_amount)} />
        {item.coin_type === 2 ? (
          <DetailValue label="剩余天数" value={String(item.wait_day)} />
        ) : null}
      </div>

      {item.coin_type === 2 ? (
        <button
          type="button"
          onClick={onViewDetail}
          className="mt-3 w-full rounded-2xl border border-[#fbd005]/25 bg-[#fbd005]/10 py-2.5 text-sm font-semibold text-[#ffe08a]"
        >
          查看 AUS 到账明细
        </button>
      ) : null}
    </div>
  )
}
