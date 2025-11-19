'use client'

import { Type as type, LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KPICardProps {
  title: string
  value: string | number
  change?: number
  icon: LucideIcon
  trend?: 'up' | 'down'
  color?: 'work' | 'lab' | 'edu' | 'trilhas' | 'din'
  subtitle?: string
}

const colorMap = {
  work: { bg: '#005ea2', light: 'rgba(0, 94, 162, 0.1)' },
  lab: { bg: '#28a0cb', light: 'rgba(40, 160, 203, 0.1)' },
  edu: { bg: '#00a91c', light: 'rgba(0, 169, 28, 0.1)' },
  trilhas: { bg: '#1a4480', light: 'rgba(26, 68, 128, 0.1)' },
  din: { bg: '#8168b3', light: 'rgba(129, 104, 179, 0.1)' },
}

export function KPICard({
  title,
  value,
  change,
  icon: Icon,
  trend,
  color = 'work',
  subtitle
}: KPICardProps) {
  const colors = colorMap[color]

  return (
    <div className="gov-card group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="kpi-label mb-3">{title}</p>
          <p className="kpi-number" style={{ color: colors.bg }}>
            {value}
          </p>
          {subtitle && (
            <p className="kpi-subtitle mt-2">{subtitle}</p>
          )}
        </div>
        
        <div 
          className="h-14 w-14 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110"
          style={{ 
            backgroundColor: colors.light,
            color: colors.bg
          }}
        >
          <Icon className="h-7 w-7" strokeWidth={2} />
        </div>
      </div>
      
      {change !== undefined && (
        <div 
          className="flex items-center gap-2 mt-4 pt-4 border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          {trend === 'up' ? (
            <div className="flex items-center gap-1.5" style={{ color: 'var(--success)' }}>
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-semibold">+{change}%</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5" style={{ color: 'var(--error)' }}>
              <TrendingDown className="h-4 w-4" />
              <span className="text-sm font-semibold">{change}%</span>
            </div>
          )}
          <span className="text-xs opacity-60">vs. mês anterior</span>
        </div>
      )}
    </div>
  )
}
