import type { ReactNode } from 'react'

type PageContainerProps = {
  children: ReactNode
  className?: string
  bgClass?: string
}

export function PageContainer({ children, className = '', bgClass = 'bg-[#0a0a1a]' }: PageContainerProps) {
  return (
    <main className={`min-h-screen ${bgClass} text-white`}>
      <div className={`mx-auto min-h-screen max-w-[430px] shadow-[0_0_0_1px_rgba(255,255,255,0.06)] ${className}`}>
        {children}
      </div>
    </main>
  )
}
