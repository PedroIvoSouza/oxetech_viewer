'use client'

import { Alert } from '@/lib/core/alerts'
import { Card } from '@/components/ui/card'
import { AlertCircle, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { getAlertColor, getAlertIcon } from '@/lib/core/alerts'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface AlertBannerProps {
  alert: Alert
  onDismiss?: (alertId: string) => void
  className?: string
}

export function AlertBanner({ alert, onDismiss, className }: AlertBannerProps) {
  const color = getAlertColor(alert.nivel)
  const icon = getAlertIcon(alert.nivel)

  const icons = {
    verde: CheckCircle,
    amarelo: AlertTriangle,
    vermelho: AlertCircle,
    critico: XCircle,
  }

  const Icon = icons[alert.nivel]

  const bgColors = {
    verde: 'bg-green-50 border-green-200',
    amarelo: 'bg-yellow-50 border-yellow-200',
    vermelho: 'bg-red-50 border-red-200',
    critico: 'bg-red-100 border-red-300',
  }

  const textColors = {
    verde: 'text-green-800',
    amarelo: 'text-yellow-800',
    vermelho: 'text-red-800',
    critico: 'text-red-900',
  }

  const content = (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'rounded-xl border-2 p-4 shadow-soft',
        bgColors[alert.nivel],
        className
      )}
      style={{ borderRadius: '22px' }}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', textColors[alert.nivel])} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className={cn('font-bold text-sm', textColors[alert.nivel])}>
              {alert.titulo}
            </h4>
            <span
              className={cn(
                'px-2 py-1 rounded-full text-xs font-semibold uppercase',
                textColors[alert.nivel]
              )}
              style={{
                backgroundColor: `${color}20`,
              }}
            >
              {alert.nivel}
            </span>
          </div>
          <p className={cn('text-sm mb-2', textColors[alert.nivel])}>
            {alert.descricao}
          </p>
          {alert.acaoRecomendada && (
            <p className={cn('text-xs font-medium italic', textColors[alert.nivel])}>
              💡 {alert.acaoRecomendada}
            </p>
          )}
          {alert.link && (
            <Link
              href={alert.link}
              className={cn(
                'text-xs font-semibold mt-2 inline-block hover:underline',
                textColors[alert.nivel]
              )}
            >
              Ver detalhes →
            </Link>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={() => onDismiss(alert.id)}
            className={cn(
              'flex-shrink-0 rounded-lg p-1 hover:bg-white/50 transition-colors',
              textColors[alert.nivel]
            )}
            aria-label="Dispensar alerta"
          >
            <XCircle className="h-4 w-4" />
          </button>
        )}
      </div>
    </motion.div>
  )

  return content
}

interface AlertListProps {
  alertas: Alert[]
  maxItems?: number
  onDismiss?: (alertId: string) => void
  className?: string
}

export function AlertList({ alertas, maxItems = 10, onDismiss, className }: AlertListProps) {
  const alertasExibidos = alertas.slice(0, maxItems)

  if (alertasExibidos.length === 0) {
    return (
      <Card
        className="border-0 shadow-soft rounded-xl p-6 text-center"
        style={{ borderRadius: '22px' }}
      >
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
        <p className="text-muted-foreground">Nenhum alerta no momento</p>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      {alertasExibidos.map((alert, index) => (
        <AlertBanner
          key={alert.id}
          alert={alert}
          onDismiss={onDismiss}
          style={{ animationDelay: `${index * 50}ms` }}
        />
      ))}
      {alertas.length > maxItems && (
        <p className="text-sm text-muted-foreground text-center">
          +{alertas.length - maxItems} alerta(s) adicional(is)
        </p>
      )}
    </div>
  )
}

