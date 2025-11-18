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
  ChevronDown,
  MapPin,
  Award,
  Activity,
  Monitor,
  TrendingUp,
  ShieldCheck,
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

interface MenuGroup {
  title: string
  icon: typeof LayoutDashboard
  module?: ModuleType
  logo?: string
  items: MenuItem[]
}

const menuGroups: MenuGroup[] = [
  {
    title: 'Home',
    icon: LayoutDashboard,
    items: [
      {
        title: 'Home',
        href: '/',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: 'Work',
    icon: Briefcase,
    module: 'work',
    logo: '/logos/WhatsApp Image 2025-11-14 at 12.09.20 (5).jpeg',
    items: [
      {
        title: 'Work',
        href: '/work',
        icon: Briefcase,
        module: 'work',
        logo: '/logos/WhatsApp Image 2025-11-14 at 12.09.20 (5).jpeg',
      },
      {
        title: 'Monitoramento',
        href: '/gestao/work',
        icon: Monitor,
        module: 'work',
      },
    ],
  },
  {
    title: 'Edu',
    icon: GraduationCap,
    module: 'edu',
    logo: '/logos/WhatsApp Image 2025-11-14 at 12.09.20 (6).jpeg',
    items: [
      {
        title: 'Edu',
        href: '/edu',
        icon: GraduationCap,
        module: 'edu',
        logo: '/logos/WhatsApp Image 2025-11-14 at 12.09.20 (6).jpeg',
      },
      {
        title: 'Monitoramento',
        href: '/gestao/edu',
        icon: GraduationCap,
        module: 'edu',
      },
    ],
  },
  {
    title: 'Trilhas',
    icon: BookOpen,
    module: 'trilhas',
    logo: '/logos/WhatsApp Image 2025-11-14 at 12.09.24.jpeg',
    items: [
      {
        title: 'Trilhas',
        href: '/trilhas',
        icon: BookOpen,
        module: 'trilhas',
        logo: '/logos/WhatsApp Image 2025-11-14 at 12.09.24.jpeg',
      },
      {
        title: 'Monitoramento',
        href: '/gestao/trilhas',
        icon: BookOpen,
        module: 'trilhas',
      },
    ],
  },
  {
    title: 'Lab',
    icon: FlaskConical,
    module: 'lab',
    logo: '/logos/WhatsApp Image 2025-11-14 at 12.09.25.jpeg',
    items: [
      {
        title: 'Lab',
        href: '/lab',
        icon: FlaskConical,
        module: 'lab',
        logo: '/logos/WhatsApp Image 2025-11-14 at 12.09.25.jpeg',
      },
      {
        title: 'Monitoramento',
        href: '/gestao/lab',
        icon: Activity,
        module: 'lab',
      },
      {
        title: 'BI Detalhado',
        href: '/bi/lab',
        icon: TrendingUp,
        module: 'lab',
      },
    ],
  },
  {
    title: 'Geral',
    icon: Users,
    items: [
      {
        title: 'Alunos',
        href: '/alunos',
        icon: Users,
      },
      {
        title: 'Mapa',
        href: '/mapa',
        icon: MapPin,
      },
      {
        title: 'Certificados',
        href: '/certificados',
        icon: Award,
      },
    ],
  },
  {
    title: 'Gestão & Análises',
    icon: TrendingUp,
    items: [
      {
        title: 'Business Intelligence',
        href: '/bi',
        icon: TrendingUp,
      },
      {
        title: 'Painel Executivo',
        href: '/gestao/executivo',
        icon: TrendingUp,
      },
      {
        title: 'Auditoria de Dados',
        href: '/audit',
        icon: ShieldCheck,
      },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  const toggleGroup = (groupTitle: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupTitle)) {
      newExpanded.delete(groupTitle)
    } else {
      newExpanded.add(groupTitle)
    }
    setExpandedGroups(newExpanded)
  }

  // Auto-expand groups if any item is active
  const checkAutoExpand = (group: MenuGroup) => {
    const hasActiveItem = group.items.some(item => pathname === item.href || pathname.startsWith(item.href + '/'))
    if (hasActiveItem && !expandedGroups.has(group.title)) {
      setExpandedGroups(prev => new Set([...prev, group.title]))
    }
  }

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
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {menuGroups.map((group) => {
          const GroupIcon = group.icon
          const moduleColor = group.module ? getModuleColor(group.module, 'primary') : undefined
          const isGroupActive = group.items.some(item => pathname === item.href || pathname.startsWith(item.href + '/'))
          const isExpanded = expandedGroups.has(group.title) || isCollapsed
          
          // Auto-expand on mount if active
          if (isGroupActive && !isCollapsed) {
            checkAutoExpand(group)
          }

          // Se collapsed, mostrar apenas o ícone do grupo principal
          if (isCollapsed) {
            if (group.items.length === 1) {
              const item = group.items[0]
              const ItemIcon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={group.title}
                  href={item.href}
                  className={cn(
                    'group relative flex items-center justify-center rounded-xl p-3 transition-all duration-200',
                    'hover:shadow-soft',
                    isActive && 'text-white shadow-medium'
                  )}
                  style={
                    isActive && item.module
                      ? {
                          background: getModuleGradient(item.module),
                          borderRadius: '16px',
                        }
                      : { borderRadius: '16px' }
                  }
                  title={item.title}
                >
                  {item.logo ? (
                    <div className="relative h-10 w-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center p-1 overflow-hidden">
                      <Image
                        src={item.logo}
                        alt={item.title}
                        width={48}
                        height={40}
                        className="object-contain w-full h-full"
                        style={{ objectFit: 'contain' }}
                      />
                    </div>
                  ) : (
                    <ItemIcon className="h-5 w-5" />
                  )}
                </Link>
              )
            }
            return null
          }

          // Se não collapsed e tem apenas 1 item, renderizar diretamente
          if (group.items.length === 1) {
            const item = group.items[0]
            const ItemIcon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={group.title}
                href={item.href}
                className={cn(
                  'group relative flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-200 min-h-[56px]',
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
                {item.logo ? (
                  <div className="relative h-12 w-16 flex-shrink-0 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center p-1.5 overflow-hidden">
                    <Image
                      src={item.logo}
                      alt={item.title}
                      width={64}
                      height={48}
                      className="object-contain w-full h-full"
                      style={{ objectFit: 'contain' }}
                      priority={isActive}
                    />
                  </div>
                ) : (
                  <ItemIcon
                    className={cn(
                      'h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110',
                      isActive && !item.module && 'text-primary'
                    )}
                  />
                )}
                <span className="flex-1">{item.title}</span>
                {isActive && <ChevronRight className="h-4 w-4 opacity-70" />}
              </Link>
            )
          }

          // Se tem múltiplos itens, renderizar como grupo com dropdown
          return (
            <div key={group.title} className="space-y-1">
              <button
                onClick={() => toggleGroup(group.title)}
                className={cn(
                  'w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200',
                  'hover:bg-accent hover:text-accent-foreground',
                  isGroupActive && group.module && 'text-white',
                  !isGroupActive && 'text-muted-foreground'
                )}
                style={
                  isGroupActive && group.module
                    ? {
                        background: getModuleGradient(group.module),
                        borderRadius: '16px',
                      }
                    : { borderRadius: '16px' }
                }
              >
                {group.logo ? (
                  <div className="relative h-10 w-12 flex-shrink-0 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center p-1 overflow-hidden">
                    <Image
                      src={group.logo}
                      alt={group.title}
                      width={48}
                      height={40}
                      className="object-contain w-full h-full"
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                ) : (
                  <GroupIcon className="h-5 w-5 flex-shrink-0" />
                )}
                <span className="flex-1 text-left">{group.title}</span>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              
              {isExpanded && (
                <div className="ml-4 space-y-1 border-l-2 border-muted pl-4">
                  {group.items.map((item) => {
                    const ItemIcon = item.icon
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200',
                          'hover:bg-accent hover:text-accent-foreground',
                          isActive
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-muted-foreground'
                        )}
                      >
                        <ItemIcon className="h-4 w-4 flex-shrink-0" />
                        <span>{item.title}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
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

