/**
 * Layout Shell - Governamental
 * Inspirado em USAspending.gov com Bento Grid
 * 
 * Estrutura:
 * - Topbar fixo com Dark Mode switch
 * - Sidebar retrátil lateral
 * - Grid de conteúdo principal
 */

'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import {
  LayoutDashboard,
  Menu,
  X,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Users,
  TrendingUp,
  Award,
  Activity,
  LineChart,
  Settings,
  HelpCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface ShellProps {
  children: React.ReactNode
}

export function Shell({ children }: ShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mounted, setMounted] = useState(false)
  const themeData = useTheme()
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  const theme = themeData?.theme || 'light'
  const setTheme = themeData?.setTheme || (() => {})

  // Fallback para garantir renderização mesmo sem theme
  if (!mounted) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-foreground">Carregando...</p>
          </div>
        </div>
      </div>
    )
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const menuItems = [
    {
      title: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
    },
    {
      title: 'Work',
      href: '/work',
      icon: Users,
    },
    {
      title: 'Edu',
      href: '/edu',
      icon: Award,
    },
    {
      title: 'Lab',
      href: '/lab',
      icon: Activity,
    },
    {
      title: 'BI Completo',
      href: '/bi',
      icon: TrendingUp,
    },
    {
      title: 'Tendências',
      href: '/tendencias',
      icon: LineChart,
    },
    {
      title: 'Reports',
      href: '/reports',
      icon: TrendingUp,
    },
    {
      title: 'Configurações',
      href: '/configuracoes',
      icon: Settings,
    },
    {
      title: 'Ajuda',
      href: '/ajuda',
      icon: HelpCircle,
    },
  ]

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar - Retrátil */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-full bg-card border-r border-border transition-all duration-300 ease-in-out flex flex-col',
          sidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              {/* Logo placeholder - NÃO usar logo existente */}
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">S</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground font-heading">
                  SECTI/OxeTech
                </span>
                <span className="text-xs text-muted-foreground">Painel Governamental</span>
              </div>
            </div>
          )}
          {!sidebarOpen && (
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center mx-auto">
              <span className="text-primary-foreground font-bold text-lg">S</span>
            </div>
          )}
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-gov px-3 py-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group',
                      'hover:bg-muted/50',
                      isActive
                        ? 'bg-primary/10 text-primary-vivid font-semibold border-l-2 border-primary-vivid dark:border-primary-vivid'
                        : 'text-foreground/70 hover:text-foreground'
                    )}
                  >
                    <Icon className={cn(
                      'h-5 w-5 flex-shrink-0 transition-colors',
                      isActive 
                        ? 'text-primary-vivid dark:text-primary-vivid' 
                        : 'text-foreground/70 group-hover:text-foreground'
                    )} />
                    {sidebarOpen && (
                      <span className="text-sm font-medium font-body">{item.title}</span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Sidebar Toggle Button */}
        <div className="p-3 border-t border-border">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={sidebarOpen ? 'Recolher sidebar' : 'Expandir sidebar'}
          >
            {sidebarOpen ? (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span className="text-xs font-medium">Recolher</span>
              </>
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={cn(
          'flex-1 flex flex-col transition-all duration-300 ease-in-out',
          sidebarOpen ? 'ml-64' : 'ml-20'
        )}
      >
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-16 bg-card/95 backdrop-blur-md border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-muted/50 transition-colors md:hidden"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold font-heading text-foreground">
              Painel SECTI/OxeTech
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="relative p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                aria-label="Alternar tema"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-foreground" />
                <Moon className="absolute top-2 left-2 h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-foreground" />
              </button>
            )}
          </div>
        </header>

        {/* Main Content - Bento Grid Container */}
        <main className="flex-1 overflow-y-auto scrollbar-gov bg-background">
          {children}
        </main>
      </div>
    </div>
  )
}

