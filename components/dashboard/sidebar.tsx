'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Briefcase, GraduationCap, Route, FlaskConical, Users, ChevronLeft, ChevronRight, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'OxeTech Work', href: '/work', icon: Briefcase },
  { name: 'OxeTech Lab', href: '/lab', icon: FlaskConical },
  { name: 'OxeTech Edu', href: '/edu', icon: GraduationCap },
  { name: 'Trilhas', href: '/trilhas', icon: Route },
  { name: 'Alunos', href: '/alunos', icon: Users },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  return (
    <aside
      className={cn(
        'flex flex-col border-r bg-[var(--card)] transition-all duration-300 shadow-sm',
        collapsed ? 'w-16' : 'w-64'
      )}
      style={{ borderColor: 'var(--border)' }}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b" style={{ borderColor: 'var(--border)' }}>
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div 
              className="h-10 w-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <span className="text-lg font-bold text-white">OX</span>
            </div>
            <div className="flex flex-col">
              <span 
                className="font-bold text-base leading-tight"
                style={{ color: 'var(--primary-dark)' }}
              >
                OxeTech
              </span>
              <span className="text-xs opacity-60">SECTI-AL</span>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                !isActive && 'opacity-70 hover:opacity-100 hover:bg-[var(--muted)]'
              )}
              style={isActive ? {
                backgroundColor: 'var(--primary)',
                color: 'white'
              } : {}}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
              {!collapsed && isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Theme Toggle */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <Button
          variant="ghost"
          size={collapsed ? 'icon' : 'default'}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className={cn(
            "w-full justify-start",
            collapsed && "justify-center"
          )}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
          {!collapsed && <span className="ml-2">Alternar tema</span>}
        </Button>
      </div>
    </aside>
  )
}
