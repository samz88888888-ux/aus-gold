import { useEffect, useEffectEvent, useMemo, useRef, useState } from 'react'

import type { AppPage, PageParams } from '../../../figma/types'
import { BottomPopup } from '../../components/BottomPopup'
import { NoticePopup } from '../../components/NoticePopup'
import { PageContainer } from '../../components/PageContainer'
import { PageNavBar } from '../../components/PageNavBar'
import { fillTemplate, useOldPagesCopy } from '../../i18n'
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

const TOKEN_ICON = '/old-pages/wallet/usdc-coin.png'
const AUS_ICON = '/old-pages/wallet/mcg-coin.png'

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

function getRecordTypeLabel(coinType: number, usdtMiningLabel: string) {
  return coinType === 2 ? usdtMiningLabel : 'USDC'
}

function getRecordStatusMeta(status: number, copy: ReturnType<typeof useOldPagesCopy>) {
  if (status === 1) {
    return { label: copy.withdrawStatusCompleted, className: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200' }
  }
  if (status === 2) {
    return { label: copy.withdrawStatusRefunded, className: 'border-rose-400/20 bg-rose-400/10 text-rose-200' }
  }
  return { label: copy.withdrawStatusProcessing, className: 'border-sky-400/20 bg-sky-400/10 text-sky-200' }
}

function getRealCurrencyName(realCoinId: number) {
  if (realCoinId === 1) return 'USDC'
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
  const copy = useOldPagesCopy()
  const coins: Array<{ key: CurrencyType; label: string; subtitle: string }> = [
    { key: 'USDT', label: 'USDC', subtitle: copy.usdtWithdrawSubtitle },
    { key: 'USDT_MINE', label: copy.usdtMiningLabel, subtitle: copy.usdtMiningWithdrawSubtitle },
  ]
  const recordFilters: Array<{ key: RecordFilter; label: string }> = [
    { key: 'all', label: copy.all },
    { key: 'USDT', label: 'USDC' },
    { key: 'USDT_MINE', label: copy.usdtMiningLabel },
  ]
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
        setNotice(buildNotice(copy.withdrawConfigAndUserLoadFailed, () => setNotice(null)))
        return
      }

      if (withdrawConfigResult.status === 'rejected') {
        setNotice(buildNotice(getErrorMessage(withdrawConfigResult.reason, copy.withdrawConfigLoadFailed), () => setNotice(null)))
      } else if (userResult.status === 'rejected') {
        setNotice(buildNotice(getErrorMessage(userResult.reason, copy.withdrawUserLoadFailed), () => setNotice(null)))
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
      setNotice(buildNotice(getErrorMessage(error, copy.withdrawRecordsLoadFailed), () => setNotice(null)))
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
      setNotice(buildNotice(getErrorMessage(error, copy.withdrawDetailLoadFailed), () => setNotice(null)))
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
  const selectedCoinMeta = coins.find((item) => item.key === selectedCurrency) ?? coins[0]
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
      setNotice(buildNotice(copy.withdrawConfigLoadingRetry, () => setNotice(null)))
      return
    }

    if (Number(selectedConfig.withdraw_enable) !== 1) {
      setNotice(buildNotice(copy.withdrawDisabled, () => setNotice(null)))
      return
    }

    if (!amount.trim() || Number.isNaN(amountNumber) || amountNumber <= 0) {
      setNotice(buildNotice(copy.invalidWithdrawAmount, () => setNotice(null)))
      return
    }

    if (amountNumber < minWithdraw) {
      setNotice(buildNotice(fillTemplate(copy.minWithdrawMessage, { amount: fmt(minWithdraw), coin: selectedCoinMeta.label }), () => setNotice(null)))
      return
    }

    if (maxWithdraw > 0 && amountNumber > maxWithdraw) {
      setNotice(buildNotice(fillTemplate(copy.maxWithdrawMessage, { amount: fmt(maxWithdraw), coin: selectedCoinMeta.label }), () => setNotice(null)))
      return
    }

    if (amountNumber > available) {
      setNotice(buildNotice(copy.withdrawExceedsBalance, () => setNotice(null)))
      return
    }

    if (selectedCurrency === 'USDT_MINE' && !selectedDay) {
      setNotice(buildNotice(copy.selectArrivalDays, () => setNotice(null)))
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
          ? copy.withdrawSubmitted
          : copy.withdrawMiningSubmitted,
        confirmText: copy.viewRecords,
        onConfirm: () => {
          setNotice(null)
          setShowRecords(true)
        },
      })
    } catch (error) {
      setNotice(buildNotice(getErrorMessage(error, copy.withdrawSubmitFailed), () => setNotice(null)))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageContainer bgClass="bg-[#05060a]">
      <PageNavBar title={copy.withdraw} onBack={() => onNavigate('wallet')} />

      <div className="min-h-[calc(100vh-48px)] overflow-hidden bg-[radial-gradient(circle_at_top,rgba(251,208,5,0.14),transparent_30%),linear-gradient(180deg,#08090d_0%,#05060a_100%)] px-4 pb-8 pt-4">
        <div className="flex min-h-full flex-col">
          <section className="relative overflow-hidden rounded-[28px] border border-[#f5d773]/12 bg-[linear-gradient(135deg,rgba(34,28,11,0.95),rgba(14,15,21,0.98))] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#fbd005]/12 blur-3xl" />
            <div className="relative">
              <div className="flex items-center justify-between gap-3">
                <div className="inline-flex items-center rounded-full border border-[#fbd005]/18 bg-[linear-gradient(180deg,rgba(251,208,5,0.14),rgba(251,208,5,0.06))] px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#ffe08a]/84">
                    {copy.withdrawBadge}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRecords(true)}
                  className="inline-flex h-10 shrink-0 items-center rounded-full border border-[#fbd005]/22 bg-[linear-gradient(180deg,rgba(251,208,5,0.1),rgba(251,208,5,0.04))] px-4 text-[12px] font-semibold text-[#ffe08a] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] active:opacity-80"
                >
                  {copy.moneyLog}
                </button>
              </div>

              <div className="mt-4">
                <h2 className="text-[19px] font-black leading-none tracking-[-0.02em] text-white">
                  {copy.withdraw}
                </h2>
                <p className="mt-3 max-w-[280px] text-[11px] leading-5 text-white/55">
                  {copy.withdrawPageDesc}
                </p>
              </div>
            </div>

            <div className="relative mt-5 grid grid-cols-2 gap-3">
              <MetricCard
                label={copy.account}
                value={shortAddress(address)}
                highlight={false}
              />
              <MetricCard
                label={
                  selectedCurrency === 'USDT' ? copy.availableUsdt : copy.availableUsdtMining
                }
                value={fmt(available)}
              />
            </div>
          </section>

          <section className="mt-4 flex-1 rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(26,27,34,0.95),rgba(14,15,21,0.98))] p-4 shadow-[0_18px_42px_rgba(0,0,0,0.2)]">
            {pageLoading ? (
              <div className="flex h-full min-h-[360px] items-center justify-center text-sm text-white/45">
                {copy.loading}
              </div>
            ) : (
              <div className="flex h-full flex-col">
                <div className="space-y-4">
                  <div>
                    <p className="text-[12px] text-white/48">{copy.withdrawToken}</p>
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
                      <span className="text-[11px] text-[#ffe08a]">{copy.switchAction}</span>
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-[12px] text-white/48">{copy.withdrawAmount}</p>
                      <span className="text-[11px] text-white/38">
                        {fillTemplate(copy.withdrawLimit, {
                          min: fmt(minWithdraw),
                          max: fmt(maxWithdraw),
                          coin: selectedCoinMeta.label,
                        })}
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
                              ? copy.enterUsdtAmount
                              : copy.enterUsdtMiningAmount
                          }
                          inputMode="decimal"
                          className="w-full bg-transparent text-[24px] font-black text-white outline-none placeholder:text-white/18"
                        />
                        <button
                          type="button"
                          onClick={() => setAmount(String(available))}
                          className="shrink-0 rounded-full border border-[#fbd005]/28 px-3 py-1 text-[11px] font-semibold text-[#ffe08a]"
                        >
                          {copy.allCaps}
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-[11px] text-white/40">
                        <span>
                          {fillTemplate(copy.availableAmount, {
                            amount: fmt(available),
                            coin: selectedCoinMeta.label,
                          })}
                        </span>
                        <span>
                          {fillTemplate(copy.dailyLimit, {
                            count: String(selectedConfig?.daily_max_withdraw ?? '--'),
                            unit: copy.timesUnit,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedCurrency === 'USDT_MINE' ? (
                    <div>
                      <p className="text-[12px] text-white/48">{copy.releaseDays}</p>
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
                                  {item.day} {copy.daysUnit}
                                </span>
                                <span className="mt-1 block text-[11px] text-inherit/75">
                                  {copy.feeLabel} {item.fee_rate}%
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
                          ? copy.estimatedUsdt
                          : copy.estimatedAusTotal
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
                          ? copy.feeLabel
                          : copy.estimatedDailyAus
                      }
                      value={fmt(
                        selectedCurrency === 'USDT' ? feeAmount : dailyAusAmount
                      )}
                      highlight={selectedCurrency === 'USDT_MINE'}
                    />
                  </div>

                  <div className="rounded-[22px] border border-[#fbd005]/12 bg-[#0f1118] px-4 py-3">
                    {selectedCurrency === 'USDT_MINE' ? (
                      <div className="flex items-center justify-between text-[12px] text-white/62">
                        <span>{copy.priceLabel}</span>
                        <span>1 USDC = {fmt(coinPrice)} AUS</span>
                      </div>
                    ) : null}
                    <div className="mt-2 flex items-center justify-between text-[12px] text-white/45">
                      <span>{copy.feeRateLabel}</span>
                      <span>{(feeRate * 100).toFixed(2)}%</span>
                    </div>
                    {selectedCurrency === 'USDT_MINE' ? (
                      <div className="mt-2 flex items-center justify-between text-[12px] text-white/45">
                        <span>{copy.convertedAus}</span>
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
                      ? copy.submitting
                      : selectedCurrency === 'USDT'
                        ? copy.submitUsdtWithdraw
                        : copy.submitUsdtMiningWithdraw}
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
        title={copy.selectWithdrawToken}
      >
        <div className="space-y-2">
          {coins.map((coin) => {
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
        title={copy.moneyLog}
      >
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {recordFilters.map((filter) => {
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
                {copy.noWithdrawRecords}
              </div>
            ) : null}

            {displayRecords.map((item) => (
              <RecordCard
                key={item.id}
                item={item}
                copy={copy}
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
                {recordLoading ? copy.loading : copy.loadMore}
              </button>
            ) : null}
          </div>
        </div>
      </BottomPopup>

      <BottomPopup
        visible={selectedRecord !== null}
        onClose={() => setSelectedRecord(null)}
        title={selectedRecord?.coin_type === 2 ? copy.ausReleaseDetails : copy.withdrawDetails}
      >
        {!selectedRecord ? null : selectedRecord.coin_type !== 2 ? (
          <div className="space-y-3">
            <MetricCard
              label={copy.orderNo}
              value={selectedRecord.no}
              highlight={false}
            />
            <MetricCard
              label={copy.actualReceived}
              value={`${fmt(selectedRecord.real_ac_amount)} ${getRealCurrencyName(selectedRecord.real_coin_id)}`}
            />
            <MetricCard
              label={copy.createdAt}
              value={selectedRecord.created_at}
              highlight={false}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                label={copy.usdtMiningLabel}
                value={fmt(selectedRecord.num)}
              />
              <MetricCard
                label={copy.ausTotal}
                value={fmt(selectedRecord.real_ac_amount)}
                highlight
              />
            </div>

            <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
              {detailLoading ? (
                <div className="rounded-2xl border border-white/8 bg-white/4 py-12 text-center text-sm text-white/45">
                  {copy.loading}
                </div>
              ) : detailList.length === 0 ? (
                <div className="rounded-2xl border border-white/8 bg-white/4 py-12 text-center text-sm text-white/45">
                  {copy.noReleaseDetails}
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
                          {fillTemplate(copy.autoReleaseLabel, { index: String(index + 1) })}
                        </p>
                        <p className="mt-1 text-[11px] text-white/42">
                          {item.push_time || '--'}
                        </p>
                      </div>
                      <span
                        className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-semibold ${getRecordStatusMeta(item.status, copy).className}`}
                      >
                        {getRecordStatusMeta(item.status, copy).label}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <DetailValue label={copy.usdcAmount} value={fmt(item.num)} />
                      <DetailValue
                        label={copy.ausReceived}
                        value={fmt(item.real_ac_amount)}
                      />
                      <DetailValue
                        label={copy.ausFee}
                        value={fmt(item.real_fee_amount)}
                      />
                      <DetailValue label={copy.orderNo} value={item.ordernum} />
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
  copy,
  onViewDetail,
}: {
  item: WithdrawRecordItem
  copy: ReturnType<typeof useOldPagesCopy>
  onViewDetail: () => void
}) {
  const status = getRecordStatusMeta(item.status, copy)
  const realCurrency = getRealCurrencyName(item.real_coin_id)

  return (
    <div className="rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/8 px-2.5 py-1 text-[10px] font-semibold text-white/78">
              {getRecordTypeLabel(item.coin_type, copy.usdtMiningLabel)}
            </span>
            <span className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-semibold ${status.className}`}>
              {status.label}
            </span>
          </div>
          <p className="mt-2 truncate text-[13px] font-semibold text-white">{item.no}</p>
          <p className="mt-1 text-[11px] text-white/42">{item.created_at}</p>
        </div>

        <div className="text-right">
          <p className="text-[11px] text-white/42">{copy.requested}</p>
          <p className="mt-1 text-[18px] font-black text-white">{fmt(item.num)}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <DetailValue label={copy.receivedToken} value={realCurrency} />
        <DetailValue label={copy.actualReceived} value={fmt(item.real_ac_amount)} />
        <DetailValue label={copy.feeLabel} value={fmt(item.fee_amount)} />
        {item.coin_type === 2 ? (
          <DetailValue label={copy.remainingDays} value={String(item.wait_day)} />
        ) : null}
      </div>

      {item.coin_type === 2 ? (
        <button
          type="button"
          onClick={onViewDetail}
          className="mt-3 w-full rounded-2xl border border-[#fbd005]/25 bg-[#fbd005]/10 py-2.5 text-sm font-semibold text-[#ffe08a]"
        >
          {copy.viewAusDetails}
        </button>
      ) : null}
    </div>
  )
}
