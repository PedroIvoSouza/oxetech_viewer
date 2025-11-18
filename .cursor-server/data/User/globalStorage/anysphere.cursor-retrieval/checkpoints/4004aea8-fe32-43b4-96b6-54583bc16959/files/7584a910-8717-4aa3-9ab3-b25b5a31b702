'use client'

import { useLabData } from '@/lib/queries/lab'
import { KPICard } from '@/components/dashboard/kpi-card'
import { LineChart } from '@/components/charts/line-chart'
import { BarChart } from '@/components/charts/bar-chart'
import { PieChart } from '@/components/charts/pie-chart'
import { Skeleton } from '@/components/ui/skeleton'
import { FlaskConical, Users, TrendingUp } from 'lucide-react'
import { formatNumber } from '@/lib/formatters'

export default function LabPage() {
  const { data, isLoading, error } = useLabData()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-destructive">Erro ao carregar dados: {error.message}</p>
      </div>
    )
  }

  if (!data) {
    return null
  }

  const {
    stats,
    distribuicaoPorCurso,
    evolucaoTemporal,
    inscricoesPorLaboratorio,
  } = data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">OxeTech Lab</h1>
        <p className="text-muted-foreground">
          Dashboard do programa OxeTech Lab
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <KPICard
          title="Total de Inscrições"
          value={formatNumber(stats.totalInscricoes)}
          icon={FlaskConical}
        />
        <KPICard
          title="Inscrições por Status"
          value={formatNumber(stats.inscricoesPorStatus.length)}
          icon={Users}
        />
        <KPICard
          title="Laboratórios"
          value={formatNumber(inscricoesPorLaboratorio.length)}
          icon={TrendingUp}
        />
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        {evolucaoTemporal.length > 0 && (
          <LineChart
            title="Evolução Temporal"
            description="Crescimento das inscrições ao longo do tempo"
            data={evolucaoTemporal}
            xKey="mes"
            yKeys={[
              { key: 'inscricoes', name: 'Inscrições', color: '#8884d8' },
            ]}
          />
        )}
        {distribuicaoPorCurso.length > 0 && (
          <PieChart
            title="Distribuição por Curso"
            description="Inscrições distribuídas por curso"
            data={distribuicaoPorCurso.map((item) => ({
              name: item.curso,
              value: item.total,
            }))}
          />
        )}
        {inscricoesPorLaboratorio.length > 0 && (
          <BarChart
            title="Inscrições por Laboratório"
            description="Distribuição de inscrições por laboratório"
            data={inscricoesPorLaboratorio}
            xKey="laboratorio"
            yKeys={[
              {
                key: 'total',
                name: 'Inscrições',
                color: '#82ca9d',
              },
            ]}
          />
        )}
        {stats.inscricoesPorStatus.length > 0 && (
          <PieChart
            title="Inscrições por Status"
            description="Distribuição de inscrições por status"
            data={stats.inscricoesPorStatus.map((item) => ({
              name: item.status,
              value: item.total,
            }))}
          />
        )}
      </div>
    </div>
  )
}

