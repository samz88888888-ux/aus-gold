type PageNavBarProps = {
  title: string
  onBack?: () => void
  rightContent?: React.ReactNode
}

export function PageNavBar({ title, onBack, rightContent }: PageNavBarProps) {
  void title
  void onBack
  void rightContent
  return null
}
