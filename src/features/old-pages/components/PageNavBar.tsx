type PageNavBarProps = {
  title: string
  onBack?: () => void
  rightContent?: React.ReactNode
}

export function PageNavBar({ title, onBack, rightContent }: PageNavBarProps) {
  const handleBack = onBack ?? (() => { window.history.back() })

  return (
    <div className="sticky top-0 z-30 flex h-11 items-center bg-black/90 px-4 backdrop-blur">
      <button type="button" onClick={handleBack} className="mr-3 flex items-center text-white">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
      </button>
      <h1 className="flex-1 truncate text-center text-base font-semibold text-white">{title}</h1>
      <div className="ml-3 w-5">{rightContent}</div>
    </div>
  )
}
