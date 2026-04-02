import type { ReactNode } from 'react'

export type IconProps = {
  className?: string
}

export function HomeIcon({ className }: IconProps): ReactNode {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.9">
      <path d="M4.5 10.5 12 4l7.5 6.5" />
      <path d="M7 10v9h10v-9" />
    </svg>
  )
}

export function DiamondIcon({ className }: IconProps): ReactNode {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.9">
      <path d="M4 9.5 8 5h8l4 4.5-8 9-8-9Z" />
      <path d="M8 5 12 9.5 16 5" />
    </svg>
  )
}

export function MiningIcon({ className }: IconProps): ReactNode {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8">
      <path d="M4 4h7v7H4z" />
      <path d="M13 13h7v7h-7z" />
      <path d="M7.5 7.5h9v9" />
      <path d="m13.5 7.5 3-3" />
      <path d="m7.5 13.5-3 3" />
    </svg>
  )
}

export function BriefcaseIcon({ className }: IconProps): ReactNode {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8">
      <path d="M4 8.5h16v10H4z" />
      <path d="M9 8V6h6v2" />
      <path d="M10.5 13h3" />
    </svg>
  )
}

export function SwapIcon({ className }: IconProps): ReactNode {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8">
      <path d="M7 7h10" />
      <path d="m14 4 3 3-3 3" />
      <path d="M17 17H7" />
      <path d="m10 14-3 3 3 3" />
      <circle cx="12" cy="12" r="6" />
    </svg>
  )
}

export function AtomIcon({ className }: IconProps): ReactNode {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8">
      <ellipse cx="12" cy="12" rx="8" ry="3.5" />
      <ellipse cx="12" cy="12" rx="3.5" ry="8" transform="rotate(35 12 12)" />
      <ellipse cx="12" cy="12" rx="3.5" ry="8" transform="rotate(-35 12 12)" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function CommunityIcon({ className }: IconProps): ReactNode {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.7">
      <path d="M4 17c0-2.2 1.8-4 4-4s4 1.8 4 4" />
      <path d="M12 17c0-1.9 1.6-3.5 3.5-3.5S19 15.1 19 17" />
      <circle cx="8" cy="9" r="2.5" />
      <circle cx="16" cy="9.5" r="2" />
    </svg>
  )
}

export function UserPlusIcon({ className }: IconProps): ReactNode {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8">
      <circle cx="10" cy="8" r="3.5" />
      <path d="M4.5 18c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
      <path d="M18 8v6" />
      <path d="M15 11h6" />
    </svg>
  )
}

export function CloseIcon({ className }: IconProps): ReactNode {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2.2">
      <path d="M7 12h10" />
      <path d="m12 7 5 5-5 5" />
    </svg>
  )
}

export function ChevronRight({ className }: IconProps): ReactNode {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="m8 5 9 7-9 7V5Z" />
    </svg>
  )
}
