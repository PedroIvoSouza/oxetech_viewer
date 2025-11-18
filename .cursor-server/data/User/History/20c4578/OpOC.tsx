'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Briefcase,
  GraduationCap,
  BookOpen,
  FlaskConical,
  Users,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ModuleType, getModuleColor, getModuleGradient } from '@/lib/design-system'
import Image from 'next/image'
import { useState } from 'react'

interface MenuItem {
  title: string
  href: string
  icon: typeof LayoutDashboard
  module?: ModuleType
  logo?: string
}

const menuItems: MenuItem[] = [
  {
    title: 'Home',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Work',
    href: '/work',
    icon: Briefcase,
    module: 'work',
    logo: '/logos/WhatsApp Image 2025-11-14 at 12.09.20 (5).jpeg',
  },
  {
    title: 'Edu',
    href: '/edu',
    icon: GraduationCap,
    module: 'edu',
    logo: '/logos/WhatsApp Image 2025-11-14 at 12.09.20 (6).jpeg',
  },
  {
    title: 'Trilhas',
    href: '/trilhas',
    icon: BookOpen,
    module: 'trilhas',
    logo: '/logos/WhatsApp Image 2025-11-14 at 12.09.24.jpeg',
  },
  {
    title: 'Lab',
    href: '/lab',
    icon: FlaskConical,
    module: 'lab',
    logo: '/logos/WhatsApp Image 2025-11-14 at 12.09.25.jpeg',
  },
  {
    title: 'Alunos',
    href: '/alunos',
    icon: Users,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div
      className={cn(
        'flex h-full flex-col border-r bg-card transition-all duration-300',
        isCollapsed ? 'w-20' : 'w-72'
      )}
      style={{ borderRadius: '0 24px 24px 0' }}
    >
      {/* Header */}
      <div className="flex h-20 items-center justify-between border-b px-6">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <LayoutDashboard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold">OxeTech</h1>
              <p className="text-xs text-muted-foreground">Dashboard</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 mx-auto">
            <LayoutDashboard className="h-6 w-6 text-primary" />
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto rounded-lg p-2 hover:bg-accent transition-colors"
          aria-label="Toggle sidebar"
        >
          <ChevronRight
            className={cn(
              'h-4 w-4 text-muted-foreground transition-transform',
              isCollapsed && 'rotate-180'
            )}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          const moduleColor = item.module ? getModuleColor(item.module, 'primary') : undefined

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                'hover:shadow-soft',
                isActive
                  ? 'text-white shadow-medium'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
              style={
                isActive && item.module
                  ? {
                      background: getModuleGradient(item.module),
                      borderRadius: '16px',
                    }
                  : { borderRadius: '16px' }
              }
            >
              {item.logo && !isCollapsed ? (
                <div className="relative h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden bg-white/10 p-1">
                  <Image
                    src={item.logo}
                    alt={item.title}
                    fill
                    className="object-contain p-1"
                    sizes="40px"
                  />
                </div>
              ) : (
                <Icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110',
                    isActive && !item.module && 'text-primary'
                  )}
                />
              )}
              {!isCollapsed && (
                <>
                  <span className="flex-1">{item.title}</span>
                  {isActive && (
                    <ChevronRight className="h-4 w-4 opacity-70" />
                  )}
                </>
              )}
              {/* Indicador de página ativa */}
              {isActive && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full"
                  style={{
                    backgroundColor: item.module ? 'white' : moduleColor,
                  }}
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="border-t p-4">
          <p className="text-xs text-muted-foreground text-center">
            © 2025 OxeTech Dashboard
          </p>
        </div>
      )}
    </div>
  )
}
