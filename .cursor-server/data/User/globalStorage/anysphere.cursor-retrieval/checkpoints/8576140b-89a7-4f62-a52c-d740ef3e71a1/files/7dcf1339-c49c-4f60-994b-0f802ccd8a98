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

const menuItems = [
  {
    title: 'Home',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Work',
    href: '/work',
    icon: Briefcase,
  },
  {
    title: 'Edu',
    href: '/edu',
    icon: GraduationCap,
  },
  {
    title: 'Trilhas',
    href: '/trilhas',
    icon: BookOpen,
  },
  {
    title: 'Lab',
    href: '/lab',
    icon: FlaskConical,
  },
  {
    title: 'Alunos',
    href: '/alunos',
    icon: Users,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold text-primary">OxeTech Dashboard</h1>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.title}</span>
              {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

