/**
 * Gov KPI - Big Number Ribbon Style
 * Inspirado em USAspending.gov "Big Number" displays
 */

import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatNumber } from '@/lib/formatters'

interface GovKPIProps {
  label: string
  value: string | number
  icon?: LucideIcon
  trend?: {
    value: number
    label: string
  }
  description?: string
  delay?: number
  className?: string
}

export function GovKPI({
  label,
  value,
  icon: Icon,
  trend,
  description,
  delay = 0,
  className,
}: GovKPIProps) {
  const displayValue = typeof value === 'number' ? formatNumber(value) : value

  return (
    <div
      className={cn(
        'bento-card p-6 animate-fade-in',
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        {Icon && (
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary-vivid dark:text-primary-vivid" />
          </div>
        )}
        {trend && (
          <div className={cn(
            'px-2 py-1 rounded text-xs font-semibold font-mono',
            trend.value >= 0 ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
          )}>
            {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <div className="kpi-number kpi-number-primary">{displayValue}</div>
        <div className="big-number-label">{label}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-2 font-body">{description}</p>
        )}
      </div>
    </div>
  )
}

