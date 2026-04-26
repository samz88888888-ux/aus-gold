import { createContext } from 'react'

import type { CopyText, LanguageOption } from '../../figma/types'

export type OldPageHeaderProps = {
  copy: CopyText
  currentLanguage: LanguageOption
  walletButtonLabel: string
  onMenuToggle: () => void
  onLanguageToggle: () => void
  onWalletConnect: () => void
}

const OldPageHeaderContext = createContext<OldPageHeaderProps | null>(null)
export { OldPageHeaderContext }
