import type { RefObject } from 'react'

import { contacts, heroMainUrl, partners } from '../data'
import type { NoticeItem } from '../services/api'
import type { CopyText, LanguageOption } from '../types'
import { NoticeBar, NoticeDetailSheet, TopNavigation } from '../components/shared'

const sectionCardClass =
  'rounded-[20px] border border-black/5 bg-white shadow-[0_8px_20px_rgba(200,164,54,0.18)]'

const visionPillars = [
  {
    title: '鏈上透明',
    en: 'On-chain Transparency',
    desc: '核心操作上鏈，以鏈上結果為唯一憑證；用戶可隨時審計所有關鍵交易。',
  },
  {
    title: '資產自主',
    en: 'Self-custodial Assets',
    desc: '中心化不碰錢，用戶資產（U / AUS）始終在個人錢包，平台僅做撮合與結算。',
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
  { title: '智能合約', en: 'Smart Contracts', desc: '認購 / Swap / 銷毀等核心規則以合約鎖定，不可篡改。' },
  { title: 'DePIN 融合', en: 'DePIN Integration', desc: '算力資源轉化為鏈上可驗證憑證，真實算力可度量。' },
  { title: '多鏈兼容', en: 'Multi-chain Ready', desc: '兼容 EVM 生態，支持主流瀏覽器錢包與移動端錢包。' },
  { title: 'DAO 治理', en: 'DAO Governance', desc: '社區投票參與關鍵決策，AUS 持有者享有治理權。' },
  { title: '安全審計', en: 'Security Audit', desc: '合約代碼經第三方審計，關鍵操作設置多簽與時間鎖。' },
  { title: '開放 API', en: 'Open API', desc: '面向開發者提供鏈上數據查詢與集成接口，生態可擴展。' },
]

const economicHighlights = [
  { label: '通縮機制', value: '交易稅自動回購銷毀', accent: true },
  { label: '收益來源', value: '靜態挖礦 + 動態級差 + 全球分紅', accent: false },
  { label: '結算方式', value: '中心化撮合 → 鏈上確認', accent: false },
  { label: '資產託管', value: '用戶自持錢包，非託管', accent: true },
]

const capabilityHighlights = [
  '將真實算力資源轉化為鏈上可驗證資產',
  '用 HPCS 超算協議實現算力的生產、調度與結算',
  '構建 AI、Web3、DePIN 的底層運行土壤',
  '數據的真實資源調度網絡',
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
    items: ['DePIN 算力驗證機制上線', '算力市場開放交易', '跨鏈資產結算協議', 'AUS Staking 模塊'],
  },
  {
    phase: 'Phase 4',
    title: '全球化',
    period: '2027+',
    items: ['多語言社區運營', '線下節點合作拓展', 'CEX 上線流通', '長期通縮達成目標'],
  },
]

const heroTags = ['Digital Gold', 'Computing Power', 'DAO Insurance']

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
      <div className="absolute inset-0 bg-[#f8f8f5]" />
      <div className="absolute inset-x-0 top-0 h-[360px] bg-[radial-gradient(circle_at_top,rgba(250,217,51,0.34),rgba(250,217,51,0.08)_38%,transparent_72%)]" />
      <div className="absolute inset-x-0 top-[170px] h-[260px] bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(248,248,245,1))]" />

      <TopNavigation
        copy={copy}
        currentLanguage={currentLanguage}
        walletButtonLabel={walletButtonLabel}
        onMenuToggle={onMenuToggle}
        onLanguageToggle={onLanguageToggle}
        onWalletConnect={onWalletConnect}
      />

      <div className="relative z-10 px-4 pb-16 pt-[70px] text-[#171717]">
        <NoticeBar notices={notices} onSelect={onNoticeSelect} />

        <NoticeDetailSheet notice={selectedNotice} isOpen={isNoticeDetailOpen} onClose={onNoticeDetailClose} />
        {isNoticeDetailOpen ? (
          <button
            type="button"
            aria-label="close"
            onClick={onNoticeDetailClose}
            className="fixed inset-0 z-40 bg-black/35"
          />
        ) : null}

        <HeroSection copy={copy} sectionRef={heroSectionRef} onOpenSubscription={onOpenSubscription} />
        <BrandDivider />
        <VisionSection />
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

        <footer className="mt-12 flex flex-col items-center gap-3 pb-6">
          <div className="h-px w-20 bg-linear-to-r from-transparent via-[#d8b13a]/70 to-transparent" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-black/30">
            AUS Ecosystem · Built on Chain
          </p>
        </footer>
      </div>
    </>
  )
}

function BrandDivider() {
  return (
    <div className="my-8 flex items-center gap-3">
      <span className="h-px flex-1 bg-linear-to-r from-transparent to-[#d9bd57]/40" />
      <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/30">AUS</span>
      <span className="h-px flex-1 bg-linear-to-l from-transparent to-[#d9bd57]/40" />
    </div>
  )
}

function SectionHeader({ title, en, centered = false }: { title: string; en: string; centered?: boolean }) {
  return (
    <div className={`mb-5 ${centered ? 'text-center' : ''}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#e0b72d]">{en}</p>
      <h2 className="mt-1 text-[22px] font-black text-black">{title}</h2>
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
      <div className={`${sectionCardClass} overflow-hidden rounded-[24px] p-1.5`}>
        <img src={heroMainUrl} alt="" className="h-[210px] w-full rounded-[20px] object-cover" />
      </div>

      <div className="mt-5 text-center">
        <h1 className="text-[29px] font-black leading-[1.22] tracking-[0.04em] whitespace-pre-line text-black">
          {copy.heroTitle}
        </h1>
        <p className="mx-auto mt-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-black/65">
          Decentralized Digital Gold · Computing Power Economic System
        </p>

        <div className="mx-auto mt-4 flex flex-wrap items-center justify-center gap-2">
          {heroTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[#fad933]/25 bg-[#fad933] px-3 py-1 text-[10px] font-semibold text-black/80"
            >
              {tag}
            </span>
          ))}
        </div>

        <p className="mx-auto mt-5 text-[14px] font-medium text-[#262f4a]">
          {copy.heroDescription}
        </p>
      </div>

      <button
        type="button"
        onClick={onOpenSubscription}
        className="mt-6 h-[52px] w-full rounded-[14px] bg-[#ffd014] text-[16px] font-bold text-[#1a1000] shadow-[0_6px_24px_rgba(250,217,51,0.35)] transition-transform active:scale-[0.99]"
      >
        {copy.heroButton}
      </button>
    </section>
  )
}

function VisionSection() {
  return (
    <section>
      <SectionHeader title="項目願景" en="PROJECT VISION" />

      <div className={`${sectionCardClass} px-4 py-4`}>
        <p className="text-[13px] leading-[24px] text-black/60">
          在法幣無限增發、資產高度金融化的時代，真正稀缺的不是機會，
          而是<span className="font-semibold text-[#efac40]">可信任的價值錨定</span>。
          AUS 的使命是構建一個像「黃金」一樣，稀缺、可驗證、可跨越週期的數字價值系統。
        </p>
        <p className="mt-3 rounded-[14px] border border-[#fad933]/20 bg-[#fad933]/18 px-3 py-2 text-[12px] leading-[20px] text-[#c58720]">
          ▸ 它不是短期收益模型，而是一套長期運行的數字生產秩序。
        </p>
      </div>

      <div className="mt-4 space-y-3">
        {visionPillars.map((item) => (
          <article key={item.title} className={`${sectionCardClass} p-4`}>
            <div className="flex items-baseline gap-2">
              <h3 className="text-[15px] font-bold text-black">{item.title}</h3>
              <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-black/25">{item.en}</span>
            </div>
            <p className="mt-2 text-[12px] leading-[20px] text-black/60">{item.desc}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function EcosystemSection() {
  return (
    <section>
      <SectionHeader title="生態架構" en="ECOSYSTEM ARCHITECTURE" />

      <div className={`${sectionCardClass} p-4`}>
        <p className="text-center text-[12px] leading-[20px] text-black/55">
          AUS 生態由三個核心模塊協同運轉，形成「生產 → 流通 → 銷毀」的完整閉環
        </p>

        <div className="mt-5 space-y-3">
          {ecosystemPillars.map((pillar, index) => (
            <div key={pillar.label}>
              <article className="rounded-[16px] bg-[#fbf9f4] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#fad933]/16 text-[11px] font-bold text-[#f0be00]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className="text-[15px] font-bold text-black">{pillar.label}</h3>
                      <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-black/25">{pillar.en}</p>
                    </div>
                  </div>
                  <span className="rounded-full border border-[#fad933]/20 bg-[#fad933]/10 px-2.5 py-1 text-[10px] font-semibold text-[#d5a300]">
                    {pillar.highlight}
                  </span>
                </div>
                <p className="mt-3 text-[12px] leading-[20px] text-black/60">{pillar.desc}</p>
              </article>

              {index < ecosystemPillars.length - 1 ? (
                <div className="flex justify-center py-1.5">
                  <div className="h-5 w-px bg-linear-to-b from-[#fad933]/30 to-transparent" />
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-[14px] border border-[#fad933]/20 bg-[#fad933]/20 px-3 py-2.5">
          <p className="text-center text-[11px] font-medium leading-[18px] text-[#c58620]">
            這意味著：AUS DePIN 本身就是「新一代數字資源公鏈」
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

      <div className="grid grid-cols-2 gap-3">
        {techFeatures.map((feat) => (
          <article
            key={feat.title}
            className="rounded-[20px] border border-[#fad933] bg-[linear-gradient(0deg,rgba(255,255,255,0.35)_0%,rgba(251,208,5,0.35)_100%)] p-3.5 shadow-[0_8px_20px_rgba(200,164,54,0.18)]"
          >
            <h3 className="text-[14px] font-bold text-black">{feat.title}</h3>
            <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.08em] text-[#d4a32a]">{feat.en}</p>
            <p className="mt-2 text-[11px] leading-[18px] text-black/58">{feat.desc}</p>
          </article>
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

      <div className={`${sectionCardClass} p-4`}>
        <div className="space-y-2.5">
          {economicHighlights.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between gap-3 rounded-[14px] border border-black/5 bg-[#f8f8f5] px-4 py-3"
            >
              <span className="text-[13px] font-medium text-black/65">{item.label}</span>
              <span className={`text-right text-[13px] font-bold ${item.accent ? 'text-[#d4a32a]' : 'text-black/80'}`}>
                {item.value}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-[14px] border border-[#fad933]/20 bg-[#fad933]/18 px-4 py-3">
          <p className="text-[11px] font-semibold text-[#c58720]">▸ 核心關鍵詞</p>
          <p className="mt-1 text-[12px] leading-[20px] text-[#b97d20]">
            規則自運行 · 算力即資產 · 時間降成本 · 風控可對沖
          </p>
        </div>
      </div>

      <div className={`${sectionCardClass} mt-4 p-4`}>
        <p className="text-[12px] font-bold text-black/60">AUS 的核心能力在於</p>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {capabilityHighlights.map((text) => (
            <InfoBox key={text} text={text} />
          ))}
        </div>
      </div>
    </section>
  )
}

function InfoBox({ text }: { text: string }) {
  return (
    <div className="rounded-[12px] border border-black/5 bg-[#fbf9f4] px-3 py-2.5">
      <p className="text-[11px] leading-[17px] text-black/60">{text}</p>
    </div>
  )
}

function RoadmapSection() {
  return (
    <section>
      <SectionHeader title="發展路線" en="ROADMAP" />

      <div className="relative">
        <div className="absolute bottom-2 left-[15px] top-2 w-px bg-[#fad933]" />

        <div className="space-y-4">
          {roadmapPhases.map((phase, index) => (
            <div key={phase.phase} className="relative pl-10">
              <div className="absolute left-0 top-1 flex h-[30px] w-[30px] items-center justify-center">
                <span
                  className={`h-3.5 w-3.5 rounded-full border-2 ${
                    index === 0
                      ? 'border-[#f5ca00] bg-[#f5ca00] shadow-[0_0_10px_rgba(250,217,51,0.45)]'
                      : 'border-[#f5ca00]/35 bg-white'
                  }`}
                />
              </div>

              <article className={`${sectionCardClass} p-4`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#d4a32a]">{phase.phase}</span>
                    <h3 className="mt-0.5 text-[16px] font-bold text-black">{phase.title}</h3>
                  </div>
                  <span className="text-[11px] font-medium text-black/40">{phase.period}</span>
                </div>
                <ul className="mt-2.5 space-y-1.5">
                  {phase.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[12px] leading-[18px] text-black/60">
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#fad933]/70" />
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
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

      <div className="grid grid-cols-3 gap-3">
        {partners.map((partner) => (
          <div
            key={partner.name}
            className="flex h-[58px] items-center justify-center overflow-hidden rounded-[14px] border border-black/5 bg-white px-2 shadow-[0_6px_18px_rgba(200,164,54,0.12)]"
          >
            <img src={partner.src} alt={partner.name} className="max-h-[30px] w-auto max-w-full object-contain" />
          </div>
        ))}
      </div>
    </section>
  )
}

function ContactIcon({ name }: { name: 'telegram' | 'twitter' }) {
  if (name === 'telegram') {
    return (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] text-white" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.03-1.99 1.27-5.62 3.72-.53.36-1.01.54-1.44.53-.47-.01-1.38-.27-2.06-.49-.83-.27-1.49-.42-1.43-.88.03-.24.37-.49 1.02-.74 3.99-1.74 6.65-2.89 7.99-3.44 3.8-1.6 4.59-1.88 5.1-1.89.11 0 .37.03.54.17.14.12.18.28.2.45-.01.06.01.24 0 .38z" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] text-white" fill="currentColor">
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
      <SectionHeader title={copy.contactTitle} en="Get In Touch" centered />

      <div className="grid grid-cols-2 gap-3">
        {contacts.map((item) => (
          <button
            key={item.label}
            type="button"
            className="group flex h-[52px] items-center justify-center gap-2.5 rounded-[14px] border border-black/8 bg-black text-white shadow-[0_8px_20px_rgba(0,0,0,0.14)] transition-transform active:scale-[0.99]"
          >
            <ContactIcon name={item.icon} />
            <span className="text-[13px] font-medium text-white">{item.label}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
