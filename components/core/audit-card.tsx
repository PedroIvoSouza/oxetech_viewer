'use client'

import { AuditFinding } from '@/lib/core/audit'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileWarning, AlertTriangle, XCircle, Info } from 'lucide-react'
import { getSeverityColor } from '@/lib/core/audit'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface AuditCardProps {
  finding: AuditFinding
  onResolve?: (findingId: string) => void
  className?: string
}

export function AuditCard({ finding, onResolve, className }: AuditCardProps) {
  const color = getSeverityColor(finding.severidade)

  const icons = {
    baixa: Info,
    media: AlertTriangle,
    alta: FileWarning,
    critica: XCircle,
  }

  const Icon = icons[finding.severidade]

  const bgColors = {
    baixa: 'bg-gray-50 border-gray-200',
    media: 'bg-yellow-50 border-yellow-200',
    alta: 'bg-orange-50 border-orange-200',
    critica: 'bg-red-50 border-red-300',
  }

  const textColors = {
    baixa: 'text-gray-700',
    media: 'text-yellow-800',
    alta: 'text-orange-800',
    critica: 'text-red-900',
  }

  const statusColors = {
    pendente: 'bg-yellow-100 text-yellow-800',
    em_analise: 'bg-blue-100 text-blue-800',
    resolvido: 'bg-green-100 text-green-800',
    falso_positivo: 'bg-gray-100 text-gray-800',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('rounded-xl border-2 shadow-soft overflow-hidden', bgColors[finding.severidade], className)}
      style={{ borderRadius: '22px' }}
    >
      <Card className="border-0 shadow-none">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', textColors[finding.severidade])} />
              <div className="flex-1 min-w-0">
                <CardTitle className={cn('text-base mb-1', textColors[finding.severidade])}>
                  {finding.titulo}
                </CardTitle>
                <CardDescription className={cn('text-sm', textColors[finding.severidade])}>
                  {finding.descricao}
                </CardDescription>
              </div>
            </div>
            <Badge
              className={cn(
                'px-2 py-1 text-xs font-semibold uppercase',
                textColors[finding.severidade]
              )}
              style={{
                backgroundColor: `${color}20`,
              }}
            >
              {finding.severidade}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Evidências */}
          {finding.evidencia.length > 0 && (
            <div>
              <p className={cn('text-xs font-semibold mb-1', textColors[finding.severidade])}>
                Evidências:
              </p>
              <ul className="space-y-1">
                {finding.evidencia.map((evidencia, index) => (
                  <li key={index} className={cn('text-xs flex items-start gap-2', textColors[finding.severidade])}>
                    <span className="mt-1">•</span>
                    <span>{evidencia}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recomendação */}
          <div>
            <p className={cn('text-xs font-semibold mb-1', textColors[finding.severidade])}>
              Recomendação:
            </p>
            <p className={cn('text-xs', textColors[finding.severidade])}>
              {finding.recomendacao}
            </p>
          </div>

          {/* Status e ações */}
          <div className="flex items-center justify-between pt-2 border-t">
            <Badge className={statusColors[finding.status]}>
              {finding.status.replace('_', ' ').toUpperCase()}
            </Badge>
            <div className="flex gap-2">
              {finding.entidade.id && (
                <Link
                  href={`/${finding.modulo}/${finding.entidade.tipo}s/${finding.entidade.id}`}
                  className={cn('text-xs font-semibold hover:underline', textColors[finding.severidade])}
                >
                  Ver entidade →
                </Link>
              )}
              {onResolve && finding.status === 'pendente' && (
                <button
                  onClick={() => onResolve(finding.id)}
                  className={cn('text-xs font-semibold hover:underline', textColors[finding.severidade])}
                >
                  Marcar como resolvido
                </button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface AuditListProps {
  findings: AuditFinding[]
  maxItems?: number
  onResolve?: (findingId: string) => void
  className?: string
}

export function AuditList({ findings, maxItems = 20, onResolve, className }: AuditListProps) {
  const findingsExibidos = findings.slice(0, maxItems)

  if (findingsExibidos.length === 0) {
    return (
      <Card
        className="border-0 shadow-soft rounded-xl p-6 text-center"
        style={{ borderRadius: '22px' }}
      >
        <Info className="h-12 w-12 text-green-500 mx-auto mb-2" />
        <p className="text-muted-foreground">Nenhuma irregularidade detectada</p>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {findingsExibidos.map((finding, index) => (
        <AuditCard
          key={finding.id}
          finding={finding}
          onResolve={onResolve}
        />
      ))}
      {findings.length > maxItems && (
        <p className="text-sm text-muted-foreground text-center">
          +{findings.length - maxItems} irregularidade(s) adicional(is)
        </p>
      )}
    </div>
  )
}

