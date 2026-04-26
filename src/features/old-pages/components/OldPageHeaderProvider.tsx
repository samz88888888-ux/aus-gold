import type { ReactNode } from 'react'

import { OldPageHeaderContext, type OldPageHeaderProps } from './OldPageHeaderContext'

export function OldPageHeaderProvider({
  value,
  children,
}: {
  value: OldPageHeaderProps
  children: ReactNode
}) {
  return (
    <OldPageHeaderContext.Provider value={value}>
      {children}
    </OldPageHeaderContext.Provider>
  )
}

