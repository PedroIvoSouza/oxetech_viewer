/**
 * Dashboard Principal - Bento Grid Style
 * Inspirado em USAspending.gov
 */

'use client'

import { GovCard } from '@/components/ui/gov-card'
import { GovKPI } from '@/components/dashboard/gov-kpi'
import { BentoGridSkeleton } from '@/components/ui/bento-skeleton'
import { Users, TrendingUp, Award, Activity, Target, Zap } from 'lucide-react'
import { useHomeData } from '@/lib/queries/home'
import { formatNumber } from '@/lib/formatters'

export default function DashboardPage() {
  const { data, isLoading, error } = useHomeData()

  if (isLoading) {
    return <BentoGridSkeleton count={8} />
  }

  if (error) {
    return (
      <div className="bento-grid">
        <GovCard span={4} className="border-error">
          <div className="flex items-center justify-center h-64">
            <p className="text-error font-semibold">
              Erro ao carregar dados: {error.message}
            </p>
          </div>
        </GovCard>
      </div>
    )
  }

  const stats = data?.data?.stats || {}

  return (
    <div className="bento-grid">
      {/* Big Number Ribbon - KPIs Principais */}
      <GovKPI
        label="Total de Alunos"
        value={stats.totalAlunos || 0}
        icon={Users}
        description="Alunos registrados no sistema"
        delay={0}
      />
      <GovKPI
        label="Total de Inscrições"
        value={stats.totalInscricoes || 0}
        icon={TrendingUp}
        description="Inscrições realizadas"
        delay={100}
      />
      <GovKPI
        label="Certificados"
        value={stats.totalCertificados || 0}
        icon={Award}
        description="Alunos certificados"
        delay={200}
      />
      <GovKPI
        label="Taxa de Conclusão"
        value={`${stats.taxaConclusao?.toFixed(1) || 0}%`}
        icon={Target}
        description="Percentual de conclusão"
        delay={300}
      />

      {/* Cards de Destaque */}
      <GovCard title="Programas Ativos" span={2}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold font-mono-numeric text-foreground">
                {stats.totalProgramas || 0}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Programas em execução
              </p>
            </div>
            <Activity className="h-12 w-12 text-primary-vivid opacity-20" />
          </div>
        </div>
      </GovCard>

      <GovCard title="Performance Geral" span={2}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold font-mono-numeric text-primary-vivid">
                {formatNumber(stats.totalInscricoes || 0)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Inscrições totais
              </p>
            </div>
            <Zap className="h-12 w-12 text-accent-cool opacity-20" />
          </div>
        </div>
      </GovCard>

      {/* Cards Informativos */}
      <GovCard title="Métricas Rápidas" span={4}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold font-mono-numeric text-foreground">
              {stats.totalLab || 0}
            </p>
            <p className="text-xs uppercase tracking-wide text-muted-foreground mt-2">
              Lab
            </p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold font-mono-numeric text-foreground">
              {stats.totalWork || 0}
            </p>
            <p className="text-xs uppercase tracking-wide text-muted-foreground mt-2">
              Work
            </p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold font-mono-numeric text-foreground">
              {stats.totalEdu || 0}
            </p>
            <p className="text-xs uppercase tracking-wide text-muted-foreground mt-2">
              Edu
            </p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold font-mono-numeric text-foreground">
              {stats.totalTrilhas || 0}
            </p>
            <p className="text-xs uppercase tracking-wide text-muted-foreground mt-2">
              Trilhas
            </p>
          </div>
        </div>
      </GovCard>
    </div>
  )
}
