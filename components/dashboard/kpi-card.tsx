'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ModuleType, getModuleColor } from '@/lib/design-system'
import { useEffect, useRef, useState } from 'react'

interface KPICardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
  module?: ModuleType
  delay?: number
}

export function KPICard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
  module,
  delay = 0,
}: KPICardProps) {
  const [isVisible, setIsVisible] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
        }
      },
      { threshold: 0.1 }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => observer.disconnect()
  }, [delay])

  const moduleColor = module ? getModuleColor(module, 'primary') : undefined
  const moduleGradient = module
    ? `linear-gradient(135deg, ${getModuleColor(module, 'primary')}15 0%, ${getModuleColor(module, 'secondary')}10 100%)`
    : undefined

  return (
    <Card
      ref={cardRef}
      className={cn(
        'group relative overflow-hidden transition-all duration-300',
        'hover:shadow-medium hover:-translate-y-1',
        'border-0 shadow-soft',
        isVisible ? 'animate-fade-in opacity-100' : 'opacity-0',
        className
      )}
      style={{
        borderRadius: '22px',
        background: moduleGradient || undefined,
      }}
    >
      {/* Efeito de brilho no hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: module
            ? `linear-gradient(135deg, ${getModuleColor(module, 'primary')}08 0%, transparent 100%)`
            : undefined,
        }}
      />

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div
          className={cn(
            'p-2 rounded-xl transition-all duration-300',
            'group-hover:scale-110 group-hover:rotate-3'
          )}
          style={{
            backgroundColor: moduleColor ? `${moduleColor}15` : undefined,
            color: moduleColor || undefined,
          }}
        >
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div
          className={cn(
            'text-3xl font-bold transition-all duration-300',
            'group-hover:scale-105'
          )}
          style={{ color: moduleColor || undefined }}
        >
          {value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-medium mt-2',
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            )}
          >
            <span>{trend.isPositive ? '↑' : '↓'}</span>
            <span>
              {trend.isPositive ? '+' : ''}
              {trend.value}%
            </span>
            <span className="text-muted-foreground text-[10px]">
              vs período anterior
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
