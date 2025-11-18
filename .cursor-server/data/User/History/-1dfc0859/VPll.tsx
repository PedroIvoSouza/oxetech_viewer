'use client'

import { usePathname } from 'next/navigation'
import { Separator } from '@/components/ui/separator'

const pathMap: Record<string, string> = {
  '/': 'Home',
  '/work': 'OxeTech Work',
  '/edu': 'OxeTech Edu',
  '/trilhas': 'Trilhas de Conhecimento',
  '/lab': 'OxeTech Lab',
  '/alunos': 'Alunos',
}

export function Header() {
  const pathname = usePathname()
  const title = pathMap[pathname] || 'Dashboard'

  return (
    <header className="flex h-16 items-center border-b bg-card px-6">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <Separator orientation="vertical" className="mx-4 h-6" />
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">
          Dashboard Analítico do Ecossistema OxeTech
        </p>
      </div>
    </header>
  )
}

