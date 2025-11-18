'use client'

import { useEduData } from '@/lib/queries/edu'
import { KPICard } from '@/components/dashboard/kpi-card'
import { BarChart } from '@/components/charts/bar-chart'
import { PieChart } from '@/components/charts/pie-chart'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, School, BookOpen, Users } from 'lucide-react'
import { formatNumber, formatPercent } from '@/lib/formatters'

export default function EduPage() {
  const { data, isLoading, error } = useEduData()

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
    frequenciaPorEscola,
    matriculasPorCurso,
    stats,
    matriculasPorStatus,
  } = data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">OxeTech Edu</h1>
        <p className="text-muted-foreground">
          Dashboard do programa OxeTech Edu
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <KPICard
          title="Escolas"
          value={formatNumber(stats.totalEscolas)}
          icon={School}
        />
        <KPICard
          title="Matrículas"
          value={formatNumber(stats.totalMatriculas)}
          icon={GraduationCap}
        />
        <KPICard
          title="Turmas"
          value={formatNumber(stats.totalTurmas)}
          icon={BookOpen}
        />
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        {frequenciaPorEscola.length > 0 && (
          <BarChart
            title="Frequência por Escola"
            description="Percentual de frequência por escola"
            data={frequenciaPorEscola}
            xKey="escola"
            yKeys={[
              {
                key: 'frequencia',
                name: 'Frequência (%)',
                color: '#8884d8',
              },
            ]}
          />
        )}
        {matriculasPorStatus.length > 0 && (
          <PieChart
            title="Matrículas por Status"
            description="Distribuição de matrículas por status"
            data={matriculasPorStatus.map((item) => ({
              name: item.status,
              value: item.total,
            }))}
          />
        )}
      </div>

      {/* Tabela de Frequência */}
      {frequenciaPorEscola.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Frequência por Escola</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Escola</th>
                    <th className="text-right p-2">Frequência</th>
                    <th className="text-right p-2">Presenças</th>
                    <th className="text-right p-2">Total de Aulas</th>
                  </tr>
                </thead>
                <tbody>
                  {frequenciaPorEscola.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{item.escola}</td>
                      <td className="p-2 text-right font-medium">
                        {formatPercent(item.frequencia)}
                      </td>
                      <td className="p-2 text-right">{item.totalPresencas}</td>
                      <td className="p-2 text-right">{item.totalAulas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

