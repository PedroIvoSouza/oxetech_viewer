'use client'

import { useWorkData } from '@/lib/queries/work'
import { KPICard } from '@/components/dashboard/kpi-card'
import { BarChart } from '@/components/charts/bar-chart'
import { PieChart } from '@/components/charts/pie-chart'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase, Building2, FileText, CheckCircle } from 'lucide-react'
import { formatNumber } from '@/lib/formatters'

export default function WorkPage() {
  const { data, isLoading, error } = useWorkData()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
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

  const { stats, funilPorEdital, empresas, vagasPorStatus } = data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">OxeTech Work</h1>
        <p className="text-muted-foreground">
          Dashboard do programa OxeTech Work
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <KPICard
          title="Vagas"
          value={formatNumber(stats.vagas)}
          icon={Briefcase}
        />
        <KPICard
          title="Empresas"
          value={formatNumber(stats.empresas)}
          icon={Building2}
        />
        <KPICard
          title="Candidaturas"
          value={formatNumber(stats.candidaturas)}
          icon={FileText}
        />
        <KPICard
          title="Contratações"
          value={formatNumber(stats.contratacoes)}
          icon={CheckCircle}
        />
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        {vagasPorStatus.length > 0 && (
          <PieChart
            title="Vagas por Status"
            description="Distribuição de vagas por status"
            data={vagasPorStatus.map((item) => ({
              name: item.status,
              value: item.total,
            }))}
          />
        )}
        {funilPorEdital.length > 0 && (
          <BarChart
            title="Funil por Edital"
            description="Inscrições, candidaturas e contratações por edital"
            data={funilPorEdital}
            xKey="edital"
            yKeys={[
              { key: 'inscricoes', name: 'Inscrições', color: '#8884d8' },
              { key: 'candidaturas', name: 'Candidaturas', color: '#82ca9d' },
              { key: 'contratacoes', name: 'Contratações', color: '#ffc658' },
            ]}
          />
        )}
      </div>

      {/* Tabela de Empresas */}
      <Card>
        <CardHeader>
          <CardTitle>Empresas com KPIs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Empresa</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-right p-2">Vagas</th>
                  <th className="text-right p-2">Candidaturas</th>
                  <th className="text-right p-2">Inscrições</th>
                </tr>
              </thead>
              <tbody>
                {empresas.slice(0, 20).map((empresa) => (
                  <tr key={empresa.id} className="border-b">
                    <td className="p-2">{empresa.razao_social}</td>
                    <td className="p-2 text-muted-foreground">
                      {empresa.email}
                    </td>
                    <td className="p-2 text-right">{empresa.totalVagas}</td>
                    <td className="p-2 text-right">
                      {empresa.totalCandidaturas}
                    </td>
                    <td className="p-2 text-right">
                      {empresa.totalInscricoes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

