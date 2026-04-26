import { useContext, type ReactNode } from 'react'

import { TopNavigation } from '../../figma/components/shared'
import { OldPageHeaderContext } from './OldPageHeaderContext'

type PageContainerProps = {
  children: ReactNode
  className?: string
  bgClass?: string
}

export function PageContainer({ children, className = '', bgClass = 'bg-[#0a0a1a]' }: PageContainerProps) {
  const header = useContext(OldPageHeaderContext)

  return (
    <main className={`min-h-screen ${bgClass} text-white`}>
      <div className={`relative mx-auto min-h-screen max-w-[430px] shadow-[0_0_0_1px_rgba(255,255,255,0.06)] ${className}`}>
        {header ? (
          <TopNavigation
            copy={header.copy}
            currentLanguage={header.currentLanguage}
            walletButtonLabel={header.walletButtonLabel}
            onMenuToggle={header.onMenuToggle}
            onLanguageToggle={header.onLanguageToggle}
            onWalletConnect={header.onWalletConnect}
            showBackButton={header.showBackButton}
            onBack={header.onBack}
          />
        ) : null}
        <div className={header ? 'min-h-screen pt-[48px]' : 'min-h-screen'}>
          {children}
        </div>
      </div>
    </main>
  )
}
