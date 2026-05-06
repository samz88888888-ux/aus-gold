import { useEffect, useMemo, useState } from 'react'

import { QRCodeCanvas } from 'qrcode.react'

import type { AppPage, PageParams } from '../../../figma/types'
import { NoticePopup } from '../../components/NoticePopup'
import { PageContainer } from '../../components/PageContainer'
import { PageNavBar } from '../../components/PageNavBar'
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
          title: '地址加载失败',
          message: getErrorMessage(error, '充值地址获取失败'),
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
        title: '复制成功',
        message: `${resolvedChain} 充值地址已复制`,
      })
    } catch {
      setNotice({
        title: '复制失败',
        message: '当前环境不支持复制，请手动复制地址',
      })
    }
  }

  return (
    <PageContainer bgClass="bg-[#05060a]">
      <PageNavBar title="充值" onBack={() => onNavigate('wallet')} />

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
              <p className="text-[12px] text-white/56">可用网络</p>
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
              <div className="flex h-[260px] items-center justify-center text-sm text-white/52">充值地址加载中...</div>
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
                  <p className="mt-4 text-[13px] font-medium text-white/78">使用钱包或交易所扫码，向该地址充值</p>
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
                      className="cursor-pointer rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-[#111827] transition duration-200 hover:bg-amber-50 active:scale-[0.98]"
                    >
                      复制地址
                    </button>
                  </div>
                  <p className="mt-3 break-all text-[12px] leading-5 text-white/68">{currentAddress}</p>
                </div>
              </>
            ) : (
              <div className="flex h-[260px] flex-col items-center justify-center gap-2 text-center">
                <p className="text-sm font-medium text-white/72">暂无可用充值地址</p>
                <p className="text-[12px] leading-5 text-white/45">接口未返回 USDT 链地址时，这里不会展示二维码与地址信息。</p>
              </div>
            )}
          </div>
        </section>

        <section className="mt-4 rounded-[22px] bg-[#171922]/90 p-4">
          <p className="text-[14px] font-semibold text-white">充值说明</p>
          <div className="mt-3 space-y-2 text-[12px] leading-5 text-white/62">
            <p>1. 仅支持向当前选中链的 USDT 地址充值。</p>
            <p>2. 转账前请核对链类型与地址，避免因链不一致造成资产损失。</p>
            <p>3. 到账时间以链上确认速度为准，充值成功后资产会自动更新。</p>
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
