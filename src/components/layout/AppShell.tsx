import type { PropsWithChildren } from 'react'

type AppShellProps = PropsWithChildren<{
  title: string
  description: string
}>

export function AppShell({ title, description, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur">
          <p className="text-sm font-medium uppercase tracking-[0.32em] text-cyan-300">
            dapp-mcg-web
          </p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            {description}
          </p>
        </header>

        <main className="flex-1 py-6">{children}</main>
      </div>
    </div>
  )
}
