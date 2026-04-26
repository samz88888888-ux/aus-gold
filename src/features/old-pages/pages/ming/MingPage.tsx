import { useState, useEffect } from 'react'
import { PageContainer } from '../../components/PageContainer'
import { PageNavBar } from '../../components/PageNavBar'
import { BottomPopup } from '../../components/BottomPopup'
import { fetchUserInfoOld, fetchDestoryInfo } from '../../services/api'
import type { UserInfo, DestoryInfo } from '../../services/types'
import type { AppPage, PageParams } from '../../../figma/types'

function formatNumber(value: number | string | undefined) {
  if (!value && value !== 0) return '0.00'
  return Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

type MingPageProps = {
  onNavigate: (page: AppPage, params?: PageParams) => void
}

export function MingPage({ onNavigate }: MingPageProps) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [destoryInfo, setDestoryInfo] = useState<DestoryInfo | null>(null)
  const [showPopup, setShowPopup] = useState(false)

  useEffect(() => {
    fetchUserInfoOld().then(setUserInfo)
    fetchDestoryInfo().then(setDestoryInfo)
  }, [])

  return (
    <PageContainer bgClass="bg-[#050510]">
      <PageNavBar title="算力" onBack={() => onNavigate('home')} />

      <div className="relative flex flex-col items-start px-4 pb-24 pt-4"
        style={{ backgroundImage: "url('/old-pages/ming/ming-list-bg.png')", backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat' }}>

        {/* 算力日志 tag */}
        <button
          type="button"
          onClick={() => onNavigate('mingLog')}
          className="absolute right-0 top-[52px] z-10 flex h-[30px] items-center rounded-l-xl border-2 border-r-0 border-[rgba(251,208,5,0.19)] bg-black px-4"
        >
          <span className="text-xs text-white">算力日志&gt;</span>
        </button>

        {/* 算力数值 */}
        <div className="mt-2 flex w-full flex-col items-start">
          <div className="flex items-center gap-1.5 pl-1">
            <div className="h-[30px] w-[30px] rounded-full bg-gradient-to-br from-amber-300 to-amber-600 opacity-80" />
            <span className="text-lg text-white/80">有效算力</span>
          </div>
          <div className="mt-3.5 text-[42px] font-bold leading-none text-white">
            {formatNumber(userInfo?.valid_user_power)}
          </div>
        </div>

        {/* 锁仓 bar */}
        <div className="mt-5 flex w-full items-center justify-center rounded-none px-5 py-1.5"
          style={{ background: 'linear-gradient(90deg, rgba(251,208,5,0) 0%, #fb0 50%, rgba(251,208,5,0) 100%)' }}>
          <span className="text-sm text-white">锁仓算力：</span>
          <span className="text-sm text-white line-through">{formatNumber(userInfo?.valid_user_power)}</span>
        </div>

        {/* GIF 动画 */}
        <div className="mx-auto mt-4 w-[calc(100%-10px)] overflow-hidden rounded-xl bg-[#01002a] shadow-[0_6px_12px_rgba(255,24,244,0.08)]">
          <img
            src="https://nadiassets-1302761331.cos.ap-hongkong.myqcloud.com/video/ming-new.gif"
            alt="mining animation"
            className="h-[232px] w-full object-cover"
          />
        </div>

        {/* 按钮组 */}
        <div className="mt-4 flex w-full gap-4">
          <GoldButton label="我的矿机" onClick={() => onNavigate('destoryList')} />
          <GoldButton label="销毁挖矿" onClick={() => setShowPopup(true)} />
        </div>
      </div>

      {/* 销毁弹窗 */}
      <BottomPopup visible={showPopup} onClose={() => setShowPopup(false)} title="销毁挖矿">
        <div className="flex flex-col gap-3 text-sm text-white/80">
          <p>最低销毁数量：<span className="font-semibold text-amber-400">{destoryInfo?.min_amount ?? '-'}</span></p>
          <p>当前价格：<span className="font-semibold text-amber-400">{destoryInfo?.price ?? '-'} NADI</span></p>
          <button
            type="button"
            className="mt-2 h-11 w-full rounded-xl font-bold text-black"
            style={{ background: 'linear-gradient(144deg, #fff193 4.57%, #eba500 92.93%)' }}
            onClick={() => setShowPopup(false)}
          >
            确认销毁
          </button>
        </div>
      </BottomPopup>
    </PageContainer>
  )
}

function GoldButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[52px] flex-1 items-center justify-center gap-2.5 rounded-[10px] font-bold text-black shadow-[0_6px_12px_rgba(0,81,255,0.16)]"
      style={{ background: 'linear-gradient(144deg, #fff193 4.57%, #eba500 92.93%)' }}
    >
      <span className="text-sm font-bold">{label}</span>
    </button>
  )
}
