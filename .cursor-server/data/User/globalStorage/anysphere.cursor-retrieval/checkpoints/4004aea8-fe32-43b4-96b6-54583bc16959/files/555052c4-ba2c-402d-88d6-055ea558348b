'use client'

import { useTrilhasData } from '@/lib/queries/trilhas'
import { KPICard } from '@/components/dashboard/kpi-card'
import { BarChart } from '@/components/charts/bar-chart'
import { PieChart } from '@/components/charts/pie-chart'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Users, CheckCircle, TrendingUp } from 'lucide-react'
import { formatNumber, formatPercent } from '@/lib/formatters'

export default function TrilhasPage() {
  const { data, isLoading, error } = useTrilhasData()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-96" />
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

  const { trilhas, progressoPorTrilha, inscritos } = data

  const totalTrilhas = trilhas.length
  const totalInscritos = inscritos.length
  const totalConcluidos = inscritos.filter((i) => i.concluido).length
  const progressoMedio =
    progressoPorTrilha.reduce((acc, item) => acc + item.progressoMedio, 0) /
    (progressoPorTrilha.length || 1)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Trilhas de Conhecimento</h1>
        <p className="text-muted-foreground">
          Dashboard das trilhas de conhecimento
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <KPICard
          title="Total de Trilhas"
          value={formatNumber(totalTrilhas)}
          icon={BookOpen}
        />
        <KPICard
          title="Inscritos"
          value={formatNumber(totalInscritos)}
          icon={Users}
        />
        <KPICard
          title="Concluídos"
          value={formatNumber(totalConcluidos)}
          icon={CheckCircle}
        />
        <KPICard
          title="Progresso Médio"
          value={formatPercent(progressoMedio)}
          icon={TrendingUp}
        />
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        {progressoPorTrilha.length > 0 && (
          <BarChart
            title="Progresso Médio por Trilha"
            description="Percentual médio de conclusão por trilha"
            data={progressoPorTrilha}
            xKey="trilha"
            yKeys={[
              {
                key: 'progressoMedio',
                name: 'Progresso (%)',
                color: '#8884d8',
              },
            ]}
          />
        )}
        {progressoPorTrilha.length > 0 && (
          <BarChart
            title="Inscritos e Concluídos por Trilha"
            description="Distribuição de inscritos e concluídos"
            data={progressoPorTrilha}
            xKey="trilha"
            yKeys={[
              { key: 'totalInscritos', name: 'Inscritos', color: '#82ca9d' },
              { key: 'concluidos', name: 'Concluídos', color: '#ffc658' },
            ]}
          />
        )}
      </div>

      {/* Lista de Trilhas */}
      <div className="grid gap-4 md:grid-cols-2">
        {trilhas.slice(0, 10).map((trilha) => (
          <Card key={trilha.id}>
            <CardHeader>
              <CardTitle>{trilha.titulo}</CardTitle>
              <CardDescription>{trilha.descricao}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Carga Horária: </span>
                  {trilha.carga_horaria}h
                </div>
                <div>
                  <span className="font-medium">Módulos: </span>
                  {trilha.modulos_trilhas.length}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabela de Inscritos */}
      <Card>
        <CardHeader>
          <CardTitle>Inscritos com Progresso</CardTitle>
          <CardDescription>
            Lista de alunos inscritos nas trilhas com percentual de conclusão
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Aluno</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Trilha</th>
                  <th className="text-right p-2">Concluído</th>
                  <th className="text-right p-2">Progresso</th>
                </tr>
              </thead>
              <tbody>
                {inscritos.slice(0, 50).map((inscrito) => (
                  <tr key={inscrito.id} className="border-b">
                    <td className="p-2">{inscrito.aluno}</td>
                    <td className="p-2 text-muted-foreground">
                      {inscrito.email}
                    </td>
                    <td className="p-2">{inscrito.trilha}</td>
                    <td className="p-2 text-right">
                      {inscrito.concluido ? (
                        <span className="text-green-600">Sim</span>
                      ) : (
                        <span className="text-muted-foreground">Não</span>
                      )}
                    </td>
                    <td className="p-2 text-right font-medium">
                      {formatPercent(inscrito.percentualConcluido)}
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

