import { useEffect, useMemo, useState } from 'react'

import { QRCodeCanvas } from 'qrcode.react'

import type { AppPage, PageParams } from '../../../figma/types'
import { NoticePopup } from '../../components/NoticePopup'
import { PageContainer } from '../../components/PageContainer'
import { PageNavBar } from '../../components/PageNavBar'
import { useOldPagesCopy } from '../../i18n'
import { fetchRechargeAddress } from '../../services/api'
import type { RechargeAddressData } from '../../services/types'

import walletBackground from '../../../../assets/wallet/wallet-bg-index.png'

type RechargePageProps = {
  onNavigate: (page: AppPage, params?: PageParams) => void
}

type NoticeState = {
  title?: string
  message: string
}

function shortAddress(addr: string) {
  if (!addr) return '--'
  if (addr.length <= 18) return addr
  return `${addr.slice(0, 8)}...${addr.slice(-8)}`
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message
  return fallback
}

function getChainMeta(chain: string) {
  const upperChain = chain.toUpperCase()
  if (upperChain === 'TRON') {
    return {
      badge: 'TRC20',
      accentClass: 'from-emerald-300 to-lime-200',
      panelClass: 'border-emerald-300/25 bg-emerald-300/10 text-emerald-100',
      textClass: 'text-emerald-100',
    }
  }

  return {
    badge: upperChain,
    accentClass: 'from-amber-200 to-yellow-50',
    panelClass: 'border-amber-200/25 bg-white/8 text-white',
    textClass: 'text-white',
  }
}

export function RechargePage({ onNavigate }: RechargePageProps) {
  const copy = useOldPagesCopy()
  const [loading, setLoading] = useState(true)
  const [addressData, setAddressData] = useState<RechargeAddressData | null>(null)
  const [selectedChain, setSelectedChain] = useState('')
  const [notice, setNotice] = useState<NoticeState | null>(null)

  useEffect(() => {
    let cancelled = false

    fetchRechargeAddress()
      .then((res) => {
        if (cancelled) return
        setAddressData(res)
        const firstChain = Object.keys(res.USDT ?? {})[0] ?? ''
        setSelectedChain(firstChain)
      })
      .catch((error) => {
        if (cancelled) return
        setNotice({
          title: copy.rechargeAddressLoadFailed,
          message: getErrorMessage(error, copy.rechargeAddressFetchFailed),
        })
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const chainEntries = useMemo(() => Object.entries(addressData?.USDT ?? {}), [addressData])

  const resolvedChain = useMemo(() => {
    if (!selectedChain && chainEntries.length > 0) return chainEntries[0][0]
    return selectedChain
  }, [chainEntries, selectedChain])

  const currentAddress = useMemo(() => {
    if (!resolvedChain) return ''
    return addressData?.USDT?.[resolvedChain] ?? ''
  }, [addressData, resolvedChain])

  const chainMeta = getChainMeta(resolvedChain)

  const handleCopy = async () => {
    if (!currentAddress) return
    try {
      await navigator.clipboard.writeText(currentAddress)
      setNotice({
        title: copy.copySuccess,
        message: `${resolvedChain} ${copy.copyAddress}`,
      })
    } catch {
      setNotice({
        title: copy.copyFailed,
        message: copy.copyAddressUnsupported,
      })
    }
  }

  return (
    <PageContainer bgClass="bg-[#05060a]">
      <PageNavBar title={copy.recharge} onBack={() => onNavigate('wallet')} />

      <div
        className="min-h-[calc(100vh-48px)] bg-top bg-no-repeat px-4 pb-24 pt-3"
        style={{
          backgroundImage: `url(${walletBackground})`,
          backgroundSize: '100% 100%',
        }}
      >
  

        <section className="mt-4 rounded-[24px] border border-white/8 bg-[#151821]/92 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[12px] text-white/56">{copy.availableNetworks}</p>
              <p className="mt-1 text-[18px] font-semibold text-white">USDT / {resolvedChain || '--'}</p>
            </div>
            <div className={`rounded-full bg-gradient-to-r px-3 py-1 text-[11px] font-semibold text-[#10223f] ${chainMeta.accentClass}`}>
              {chainMeta.badge || '--'}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {chainEntries.map(([chain]) => {
              const active = chain === resolvedChain
              return (
                <button
                  key={chain}
                  type="button"
                  onClick={() => setSelectedChain(chain)}
                  className={`cursor-pointer rounded-full border px-3.5 py-2 text-[12px] font-semibold transition duration-200 ${
                    active
                      ? 'border-amber-300 bg-gradient-to-r from-amber-300 to-yellow-100 text-[#10223f] shadow-[0_8px_20px_rgba(251,191,36,0.18)]'
                      : 'border-white/10 bg-white/[0.03] text-white/70 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {chain}
                </button>
              )
            })}
          </div>

          <div className="mt-5 rounded-[22px] border border-amber-200/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))] p-4">
            {loading ? (
              <div className="flex h-[260px] items-center justify-center text-sm text-white/52">{copy.rechargeAddressLoading}</div>
            ) : currentAddress ? (
              <>
                <div className="flex flex-col items-center">
                  <div className="rounded-[28px] bg-white p-4 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
                    <QRCodeCanvas
                      value={currentAddress}
                      size={188}
                      marginSize={2}
                      fgColor="#0f172a"
                      bgColor="#ffffff"
                    />
                  </div>
                  <p className="mt-4 text-[13px] font-medium text-white/78">{copy.scanRechargeHint}</p>
                </div>

                <div className={`mt-5 rounded-[18px] border px-4 py-3 ${chainMeta.panelClass}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.12em] text-white/48">Deposit Address</p>
                      <p className={`mt-1 text-[15px] font-semibold ${chainMeta.textClass}`}>{shortAddress(currentAddress)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopy}
                      aria-label={copy.copyAddress}
                      title={copy.copyAddress}
                      className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-amber-200/45 bg-white text-[#111827] shadow-[0_8px_18px_rgba(0,0,0,0.18)] transition duration-200 hover:bg-amber-50 active:scale-[0.96]"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    </button>
                  </div>
                  <p className="mt-3 break-all text-[12px] leading-5 text-white/68">{currentAddress}</p>
                </div>
              </>
            ) : (
              <div className="flex h-[260px] flex-col items-center justify-center gap-2 text-center">
                <p className="text-sm font-medium text-white/72">{copy.noRechargeAddress}</p>
                <p className="text-[12px] leading-5 text-white/45">{copy.noRechargeAddressHint}</p>
              </div>
            )}
          </div>
        </section>

        <section className="mt-4 rounded-[22px] bg-[#171922]/90 p-4">
          <p className="text-[14px] font-semibold text-white">{copy.rechargeInstructions}</p>
          <div className="mt-3 space-y-2 text-[12px] leading-5 text-white/62">
            <p>{copy.rechargeInstruction1}</p>
            <p>{copy.rechargeInstruction2}</p>
            <p>{copy.rechargeInstruction3}</p>
            <p>{copy.rechargeInstruction4}</p>
          </div>
        </section>
      </div>

      <NoticePopup
        visible={notice !== null}
        title={notice?.title}
        message={notice?.message ?? ''}
        onClose={() => setNotice(null)}
      />
    </PageContainer>
  )
}
