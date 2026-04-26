import { useEffect, useRef, type ReactNode } from 'react'

type BottomPopupProps = {
  visible: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export function BottomPopup({ visible, onClose, title, children }: BottomPopupProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (visible) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [visible])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button type="button" className="absolute inset-0 bg-black/60" onClick={onClose} aria-label="关闭" />
      <div ref={contentRef} className="relative w-full max-w-[430px] animate-[slideUp_0.3s_ease] rounded-t-2xl bg-[#1a1a2e] px-4 pb-6 pt-4">
        {title && (
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <button type="button" onClick={onClose} className="text-white/60 hover:text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
