'use client'

import { usePathname } from 'next/navigation'
import { Separator } from '@/components/ui/separator'
import { ModuleType, getModuleColor } from '@/lib/design-system'
import { cn } from '@/lib/utils'

const pathMap: Record<string, { title: string; module?: ModuleType }> = {
  '/': { title: 'Dashboard OxeTech' },
  '/work': { title: 'OxeTech Work', module: 'work' },
  '/edu': { title: 'OxeTech Edu', module: 'edu' },
  '/trilhas': { title: 'Trilhas de Conhecimento', module: 'trilhas' },
  '/lab': { title: 'OxeTech Lab', module: 'lab' },
  '/alunos': { title: 'Alunos' },
}

export function Header() {
  const pathname = usePathname()
  const pageInfo = pathMap[pathname] || { title: 'Dashboard' }
  const moduleColor = pageInfo.module ? getModuleColor(pageInfo.module, 'primary') : undefined

  return (
    <header
      className="flex h-20 items-center border-b bg-card/50 backdrop-blur-sm px-8"
      style={{ borderRadius: '0 0 24px 24px' }}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'h-12 w-1 rounded-r-full transition-all duration-300',
            moduleColor && 'animate-pulse-slow'
          )}
          style={{ backgroundColor: moduleColor || 'transparent' }}
        />
        <div>
          <h2
            className="text-2xl font-bold"
            style={{ color: moduleColor || undefined }}
          >
            {pageInfo.title}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Dashboard Analítico do Ecossistema OxeTech
          </p>
        </div>
      </div>
      <Separator orientation="vertical" className="mx-6 h-8" />
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium">Tempo real</p>
          <p className="text-xs text-muted-foreground">Atualizado há instantes</p>
        </div>
      </div>
    </header>
  )
}
