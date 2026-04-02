import type { RefObject } from 'react'

import {
  contacts,
  heroBackgroundUrl,
  heroMainUrl,
  partners,
} from '../data'
import type { NoticeItem } from '../services/api'
import type { CopyText, LanguageOption } from '../types'
import { NoticeBar, NoticeDetailSheet, TopNavigation } from '../components/shared'


const visionPillars = [
  {
    title: '鏈上透明',
    en: 'On-chain Transparency',
    desc: '核心操作上鏈，以鏈上結果為唯一憑證；用戶可隨時審計所有關鍵交易。',
  },
  {
    title: '資產自主',
    en: 'Self-custodial Assets',
    desc: '中心化不碰錢——用戶資產（U / MCG）始終在個人錢包，平台僅做撮合與結算。',
  },
  {
    title: '長期生態',
    en: 'Sustainable Ecosystem',
    desc: '非短期收益模型，而是一套通縮銷毀 + 算力復利 + DAO 共治的可持續數字經濟系統。',
  },
]

const ecosystemPillars = [
  {
    label: '算力挖礦',
    en: 'Computing Power Mining',
    desc: '分級認購角色獲得對應算力，靜態產出穩定收益，時間加成帶來復利效果。',
    highlight: '穩定產出',
  },
  {
    label: '通縮銷毀',
    en: 'Deflationary Burn',
    desc: '交易 / 提現 / Swap 產生的稅費自動歸集，觸發回購並永久銷毀，持續減少流通量。',
    highlight: '供應遞減',
  },
  {
    label: '鏈上經濟',
    en: 'On-chain Economy',
    desc: '認購、Swap、分紅等關鍵動作必須上鏈；中心化結算完成後才發起鏈上確認，雙重保障。',
    highlight: '可審計',
  },
]

const techFeatures = [
  { title: '智能合約', en: 'Smart Contracts', desc: '認購 / Swap / 銷毀等核心規則以合約鎖定，不可篡改' },
  { title: 'DePIN 融合', en: 'DePIN Integration', desc: '算力資源轉化為鏈上可驗證憑證，真實算力可度量' },
  { title: '多鏈兼容', en: 'Multi-chain Ready', desc: '兼容 EVM 生態，支持主流瀏覽器錢包與移動端錢包' },
  { title: 'DAO 治理', en: 'DAO Governance', desc: '社區投票參與關鍵決策，MCG 持有者享有治理權' },
  { title: '安全審計', en: 'Security Audit', desc: '合約代碼經第三方審計，關鍵操作設置多簽與時間鎖' },
  { title: '開放 API', en: 'Open API', desc: '面向開發者提供鏈上數據查詢與集成接口，生態可擴展' },
]

const economicHighlights = [
  { label: '通縮機制', value: '交易稅自動回購銷毀', accent: true },
  { label: '收益來源', value: '靜態挖礦 + 動態級差 + 全球分紅', accent: false },
  { label: '結算方式', value: '中心化撮合 → 鏈上確認', accent: false },
  { label: '資產託管', value: '用戶自持錢包，非託管', accent: true },
]

const roadmapPhases = [
  {
    phase: 'Phase 1',
    title: '基礎建設',
    period: '2026 Q1 – Q2',
    items: ['核心合約部署與審計', '認購系統上線', 'DApp 移動端適配', '首批節點認購開放'],
  },
  {
    phase: 'Phase 2',
    title: '生態拓展',
    period: '2026 Q3',
    items: ['Swap 交易模塊上線', '多鏈橋接部署', '社區 DAO 治理啟動', '合作夥伴生態接入'],
  },
  {
    phase: 'Phase 3',
    title: '算力網絡',
    period: '2026 Q4',
    items: ['DePIN 算力驗證機制上線', '算力市場開放交易', '跨鏈資產結算協議', 'MCG Staking 模塊'],
  },
  {
    phase: 'Phase 4',
    title: '全球化',
    period: '2027+',
    items: ['多語言社區運營', '線下節點合作拓展', 'CEX 上線流通', '長期通縮達成目標'],
  },
]

export function HomeScreen({
  copy,
  currentLanguage,
  notices,
  selectedNotice,
  isNoticeDetailOpen,
  walletButtonLabel,
  onMenuToggle,
  onLanguageToggle,
  onNoticeSelect,
  onNoticeDetailClose,
  onWalletConnect,
  onOpenSubscription,
  heroSectionRef,
  advantagesSectionRef,
  modelSectionRef,
  partnersSectionRef,
  contactSectionRef,
}: {
  copy: CopyText
  currentLanguage: LanguageOption
  notices: NoticeItem[]
  selectedNotice: NoticeItem | null
  isNoticeDetailOpen: boolean
  walletButtonLabel: string
  onMenuToggle: () => void
  onLanguageToggle: () => void
  onNoticeSelect: (notice: NoticeItem) => void
  onNoticeDetailClose: () => void
  onWalletConnect: () => void
  onOpenSubscription: () => void
  heroSectionRef: RefObject<HTMLElement | null>
  advantagesSectionRef: RefObject<HTMLElement | null>
  modelSectionRef: RefObject<HTMLElement | null>
  partnersSectionRef: RefObject<HTMLElement | null>
  contactSectionRef: RefObject<HTMLElement | null>
}) {
  return (
    <>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,_#12100a_0%,_#1a1610_30%,_#100e08_100%)]" />
      <div className="absolute inset-x-0 top-0 h-[400px] bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,_rgba(250,217,51,0.15),_transparent)]" />
      <div
        className="absolute inset-x-0 top-[180px] h-[700px] bg-cover bg-top opacity-65"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(18,16,10,0.2), rgba(18,16,10,0.95)), url(${heroBackgroundUrl})`,
        }}
      />

      <TopNavigation
        copy={copy}
        currentLanguage={currentLanguage}
        walletButtonLabel={walletButtonLabel}
        onMenuToggle={onMenuToggle}
        onLanguageToggle={onLanguageToggle}
        onWalletConnect={onWalletConnect}
      />

      <div className="relative z-10 px-4 pb-16 pt-[52px]">
        <div className="mt-3"><NoticeBar notices={notices} onSelect={onNoticeSelect} /></div>

        <NoticeDetailSheet notice={selectedNotice} isOpen={isNoticeDetailOpen} onClose={onNoticeDetailClose} />
        {isNoticeDetailOpen ? (
          <button
            type="button"
            aria-label="close"
            onClick={onNoticeDetailClose}
            className="fixed inset-0 z-40 bg-black/55"
          />
        ) : null}

        <HeroSection copy={copy} sectionRef={heroSectionRef} onOpenSubscription={onOpenSubscription} />
        <BrandDivider />
        <VisionSection sectionRef={heroSectionRef} />
        <BrandDivider />
        <EcosystemSection />
        <BrandDivider />
        <TechSection sectionRef={advantagesSectionRef} />
        <BrandDivider />
        <EconomicModelSection sectionRef={modelSectionRef} />
        <BrandDivider />
        <RoadmapSection />
        <BrandDivider />
        <PartnersSection copy={copy} sectionRef={partnersSectionRef} />
        <BrandDivider />
        <ContactSection copy={copy} sectionRef={contactSectionRef} />

        <footer className="mt-14 flex flex-col items-center gap-3 pb-6">
          <div className="h-px w-20 bg-gradient-to-r from-transparent via-[#fad933]/35 to-transparent" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/30">
            MCG Ecosystem · Built on Chain
          </p>
        </footer>
      </div>
    </>
  )
}

function BrandDivider() {
  return (
    <div className="my-8 flex items-center gap-3">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#fad933]/20" />
      <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#fad933]/30">MCG</span>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#fad933]/20" />
    </div>
  )
}

function SectionHeader({ title, en }: { title: string; en: string }) {
  return (
    <div className="mb-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#fad933]/55">{en}</p>
      <h2 className="mt-1 text-[22px] font-extrabold text-white">{title}</h2>
    </div>
  )
}

function HeroSection({
  copy,
  sectionRef,
  onOpenSubscription,
}: {
  copy: CopyText
  sectionRef: RefObject<HTMLElement | null>
  onOpenSubscription: () => void
}) {
  return (
    <section ref={sectionRef} className="animate-fade-in-up">
      <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-black/30 backdrop-blur-sm">
        <div
          className="h-[240px] w-full bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(10,8,4,0.05) 0%, rgba(10,8,4,0.75) 100%), url(${heroMainUrl})`,
          }}
        />
      </div>

      <div className="mt-6 text-center">
        <h1 className="bg-[linear-gradient(180deg,_#ffe88a_0%,_#f2bf3e_50%,_#c8922a_100%)] bg-clip-text text-[28px] font-extrabold leading-[1.3] tracking-wide text-transparent whitespace-pre-line">
          {copy.heroTitle}
        </h1>

        <p className="mx-auto mt-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/25">
          Decentralized Digital Gold · Computing Power Economic System
        </p>

        <div className="mx-auto mt-5 flex items-center justify-center gap-2">
          {['Digital Gold', 'Computing Power', 'DAO Insurance'].map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[#fad933]/15 bg-[#fad933]/6 px-3 py-1 text-[10px] font-semibold text-[#fad933]/80"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <p className="mx-auto mt-5 text-center text-[14px] font-medium italic tracking-wide text-white/35">
        {copy.heroDescription}
      </p>

      <button
        type="button"
        onClick={onOpenSubscription}
        className="animate-shimmer mt-7 h-[52px] w-full rounded-[14px] bg-[linear-gradient(90deg,_#c8922a,_#f8d23d_30%,_#ffe88a_50%,_#f8d23d_70%,_#c8922a)] bg-[length:200%_100%] text-[16px] font-bold tracking-wide text-[#1a1000] shadow-[0_4px_24px_rgba(250,217,51,0.3)] transition-shadow hover:shadow-[0_6px_32px_rgba(250,217,51,0.45)]"
      >
        {copy.heroButton}
      </button>
    </section>
  )
}

function VisionSection({ sectionRef }: { sectionRef: RefObject<HTMLElement | null> }) {
  return (
    <section ref={sectionRef}>
      <SectionHeader title="項目願景" en="PROJECT VISION" />

      <div className="rounded-[20px] border border-white/10 bg-white/[0.05] px-4 py-4 backdrop-blur-sm">
        <p className="text-[13px] leading-[24px] text-white/55">
          在法幣無限增發、資產高度金融化的時代，真正稀缺的不是機會，
          而是<span className="font-semibold text-[#efac40]">可信任的價值錨定</span>。
          MCG 的使命是構建一個像「黃金」一樣——稀缺、可驗證、可跨越週期的數字價值系統。
        </p>
        <p className="mt-3 rounded-xl border border-[#fad933]/10 bg-[#fad933]/5 px-3 py-2 text-[12px] leading-[20px] text-[#efac40]/80">
          ▸ 它不是短期收益模型，而是一套長期運行的數字生產秩序。
        </p>
      </div>

      <div className="mt-4 space-y-3">
        {visionPillars.map((item) => (
          <div
            key={item.title}
            className="rounded-[16px] border border-white/10 bg-white/[0.05] p-4 transition-colors hover:border-[#fad933]/12"
          >
            <div className="flex items-baseline gap-2">
              <h3 className="text-[15px] font-bold text-white">{item.title}</h3>
              <span className="text-[10px] font-medium uppercase tracking-wider text-white/25">{item.en}</span>
            </div>
            <p className="mt-1.5 text-[12px] leading-[20px] text-white/60">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function EcosystemSection() {
  return (
    <section>
      <SectionHeader title="生態架構" en="ECOSYSTEM ARCHITECTURE" />

      <div className="rounded-[20px] border border-white/10 bg-white/[0.05] p-4 backdrop-blur-sm">
        <p className="text-center text-[12px] leading-[20px] text-white/55">
          MCG 生態由三個核心模塊協同運轉，形成「生產 → 流通 → 銷毀」的完整閉環
        </p>

        <div className="mt-5 space-y-3">
          {ecosystemPillars.map((pillar, index) => (
            <div key={pillar.label} className="relative">
              <div className="rounded-[16px] border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-[#fad933]/12">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#fad933]/10 text-[11px] font-bold text-[#fad933]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className="text-[15px] font-bold text-white">{pillar.label}</h3>
                      <p className="text-[9px] font-medium uppercase tracking-wider text-white/25">{pillar.en}</p>
                    </div>
                  </div>
                  <span className="rounded-full border border-[#fad933]/15 bg-[#fad933]/8 px-2.5 py-0.5 text-[10px] font-semibold text-[#fad933]">
                    {pillar.highlight}
                  </span>
                </div>
                <p className="mt-3 text-[12px] leading-[20px] text-white/60">{pillar.desc}</p>
              </div>

              {index < ecosystemPillars.length - 1 && (
                <div className="flex justify-center py-1">
                  <div className="h-4 w-px bg-gradient-to-b from-[#fad933]/20 to-transparent" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-xl border border-[#fad933]/10 bg-[#fad933]/5 px-3 py-2.5">
          <p className="text-center text-[11px] font-medium leading-[18px] text-[#efac40]/70">
            這意味著：MCG DePIN 本身就是「新一代數字資源公鏈」
          </p>
        </div>
      </div>
    </section>
  )
}

function TechSection({ sectionRef }: { sectionRef: RefObject<HTMLElement | null> }) {
  return (
    <section ref={sectionRef}>
      <SectionHeader title="核心技術優勢" en="CORE TECHNOLOGY" />

      <div className="grid grid-cols-2 gap-2.5">
        {techFeatures.map((feat) => (
          <div
            key={feat.title}
            className="rounded-[16px] border border-white/10 bg-white/[0.05] p-3.5 transition-colors hover:border-[#fad933]/12 hover:bg-white/[0.06]"
          >
            <div className="flex items-baseline gap-1.5">
              <h3 className="text-[14px] font-bold text-white">{feat.title}</h3>
            </div>
            <p className="mt-0.5 text-[9px] font-medium uppercase tracking-wider text-[#fad933]/40">{feat.en}</p>
            <p className="mt-2 text-[11px] leading-[18px] text-white/55">{feat.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function EconomicModelSection({
  sectionRef,
}: {
  sectionRef: RefObject<HTMLElement | null>
}) {
  return (
    <section ref={sectionRef}>
      <SectionHeader title="經濟模型" en="ECONOMIC MODEL" />

      <div className="rounded-[20px] border border-white/10 bg-white/[0.05] p-4 backdrop-blur-sm">
        <div className="space-y-2.5">
          {economicHighlights.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-[12px] border border-white/5 bg-white/[0.05] px-4 py-3"
            >
              <span className="text-[13px] font-medium text-white/65">{item.label}</span>
              <span className={`text-[13px] font-bold ${item.accent ? 'text-[#fad933]' : 'text-white/80'}`}>
                {item.value}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-[#fad933]/10 bg-[#fad933]/5 px-4 py-3">
          <p className="text-[11px] font-semibold text-[#efac40]">▸ 核心關鍵詞</p>
          <p className="mt-1 text-[12px] leading-[20px] text-[#efac40]/70">
            規則自運行 · 算力即資產 · 時間降成本 · 風控可對沖
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-[20px] border border-white/10 bg-white/[0.05] p-4">
        <p className="text-[12px] font-bold text-white/60">MCG 的核心能力在於</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <InfoBox text="將真實算力資源轉化為鏈上可驗證資產" />
          <InfoBox text="用 HPCS 超算協議實現算力的生產、調度與結算" />
          <InfoBox text="構建 AI、Web3、DePIN 的底層運行土壤" />
          <InfoBox text="數據的真實資源調度網絡" />
        </div>
      </div>
    </section>
  )
}

function InfoBox({ text }: { text: string }) {
  return (
    <div className="rounded-[10px] border border-white/5 bg-white/[0.03] px-3 py-2.5">
      <p className="text-[11px] leading-[17px] text-white/60">{text}</p>
    </div>
  )
}

function RoadmapSection() {
  return (
    <section>
      <SectionHeader title="發展路線" en="ROADMAP" />

      <div className="relative">
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-[#fad933]/25 via-[#fad933]/10 to-transparent" />

        <div className="space-y-4">
          {roadmapPhases.map((phase, index) => (
            <div key={phase.phase} className="relative pl-10">
              <div className="absolute left-0 top-1 flex h-[30px] w-[30px] items-center justify-center">
                <span
                  className={`h-3 w-3 rounded-full border-2 ${
                    index === 0
                      ? 'border-[#fad933] bg-[#fad933] shadow-[0_0_10px_rgba(250,217,51,0.4)]'
                      : 'border-[#fad933]/30 bg-transparent'
                  }`}
                />
              </div>

              <div className="rounded-[16px] border border-white/10 bg-white/[0.05] p-4 transition-colors hover:border-[#fad933]/12">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#fad933]/50">{phase.phase}</span>
                    <h3 className="mt-0.5 text-[16px] font-bold text-white">{phase.title}</h3>
                  </div>
                  <span className="text-[11px] font-medium text-white/45">{phase.period}</span>
                </div>
                <ul className="mt-2.5 space-y-1.5">
                  {phase.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[12px] leading-[18px] text-white/60">
                      <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#fad933]/30" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PartnersSection({
  copy,
  sectionRef,
}: {
  copy: CopyText
  sectionRef: RefObject<HTMLElement | null>
}) {
  return (
    <section ref={sectionRef}>
      <SectionHeader title={copy.partnersTitle} en="TRUSTED PARTNERS" />

      <div className="grid grid-cols-3 gap-2.5">
        {partners.map((partner) => (
          <div
            key={partner.name}
            className="flex h-[44px] items-center justify-center overflow-hidden rounded-[10px] bg-white px-2"
          >
            <img
              src={partner.src}
              alt={partner.name}
              className="max-h-[28px] w-auto max-w-full object-contain"
            />
          </div>
        ))}
      </div>
    </section>
  )
}

function ContactIcon({ name }: { name: 'telegram' | 'twitter' }) {
  if (name === 'telegram') {
    return (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] text-white/60 group-hover:text-white/90" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.03-1.99 1.27-5.62 3.72-.53.36-1.01.54-1.44.53-.47-.01-1.38-.27-2.06-.49-.83-.27-1.49-.42-1.43-.88.03-.24.37-.49 1.02-.74 3.99-1.74 6.65-2.89 7.99-3.44 3.8-1.6 4.59-1.88 5.1-1.89.11 0 .37.03.54.17.14.12.18.28.2.45-.01.06.01.24 0 .38z" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] text-white/60 group-hover:text-white/90" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function ContactSection({
  copy,
  sectionRef,
}: {
  copy: CopyText
  sectionRef: RefObject<HTMLElement | null>
}) {
  return (
    <section ref={sectionRef}>
      <div className="mb-6 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/25">Get In Touch</p>
        <h2 className="mt-1 text-[22px] font-extrabold text-white">{copy.contactTitle}</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {contacts.map((item) => (
          <button
            key={item.label}
            type="button"
            className="group flex h-[50px] items-center justify-center gap-2.5 rounded-[12px] border border-white/8 bg-white/[0.03] transition-all hover:border-[#fad933]/15 hover:bg-white/[0.05]"
          >
            <ContactIcon name={item.icon} />
            <span className="text-[13px] font-medium text-white/60 group-hover:text-white/85">{item.label}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
