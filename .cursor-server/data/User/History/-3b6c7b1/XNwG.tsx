'use client'

import { useState, useMemo } from 'react'
import { useTrilhasData } from '@/lib/queries/trilhas'
import { KPICard } from '@/components/dashboard/kpi-card'
import { BarChart } from '@/components/charts/bar-chart'
import { PieChart } from '@/components/charts/pie-chart'
import { LineChart } from '@/components/charts/line-chart'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  BookOpen,
  Users,
  CheckCircle,
  TrendingUp,
  Search,
  Filter,
  Award,
} from 'lucide-react'
import { formatNumber, formatPercent, formatDate } from '@/lib/formatters'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function TrilhasPage() {
  const [busca, setBusca] = useState('')
  const [periodo, setPeriodo] = useState('all')
  const { data, isLoading, error } = useTrilhasData(periodo, busca)

  const trilhasFiltradas = useMemo(() => {
    if (!data?.data?.trilhas) return []
    if (!busca) return data.data.trilhas

    return data.data.trilhas.filter((trilha) =>
      trilha.titulo.toLowerCase().includes(busca.toLowerCase())
    )
  }, [data, busca])

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid gap-6 md:grid-cols-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center rounded-2xl bg-destructive/10">
        <div className="text-center">
          <p className="text-lg font-semibold text-destructive">
            Erro ao carregar dados
          </p>
          <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
        </div>
      </div>
    )
  }

  if (!data?.data) {
    return null
  }

  const {
    stats,
    trilhas,
    progressoPorTrilha,
    topTrilhas,
    evolucaoTemporal,
    inscritos,
  } = data.data

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2" style={{ color: '#C80000' }}>
          Trilhas de Conhecimento
        </h1>
        <p className="text-lg text-muted-foreground">
          Dashboard completo das trilhas de conhecimento
        </p>
      </motion.div>

      {/* KPIs */}
      <div className="grid gap-6 md:grid-cols-5">
        <KPICard
          title="Total de Trilhas"
          value={formatNumber(stats.totalTrilhas)}
          icon={BookOpen}
          module="trilhas"
          delay={0}
        />
        <KPICard
          title="Total de Inscritos"
          value={formatNumber(stats.totalInscritos)}
          icon={Users}
          module="trilhas"
          delay={50}
        />
        <KPICard
          title="Total Concluídos"
          value={formatNumber(stats.totalConcluidos)}
          icon={CheckCircle}
          module="trilhas"
          delay={100}
        />
        <KPICard
          title="Progresso Médio"
          value={formatPercent(stats.progressoMedioGeral)}
          icon={TrendingUp}
          module="trilhas"
          delay={150}
        />
        <KPICard
          title="Conclusão por Módulo"
          value={formatPercent(stats.conclusaoMediaModulo)}
          icon={Award}
          module="trilhas"
          delay={200}
        />
      </div>

      {/* Filtros */}
      <Card
        className="border-0 shadow-soft"
        style={{ borderRadius: '22px' }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-trilhas-primary" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar trilha por nome..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
                style={{ borderRadius: '12px' }}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={periodo === 'all' ? 'default' : 'outline'}
                onClick={() => setPeriodo('all')}
                style={{ borderRadius: '12px' }}
              >
                Todos
              </Button>
              <Button
                variant={periodo === '30d' ? 'default' : 'outline'}
                onClick={() => setPeriodo('30d')}
                style={{ borderRadius: '12px' }}
              >
                30 dias
              </Button>
              <Button
                variant={periodo === '90d' ? 'default' : 'outline'}
                onClick={() => setPeriodo('90d')}
                style={{ borderRadius: '12px' }}
              >
                90 dias
              </Button>
              <Button
                variant={periodo === '1y' ? 'default' : 'outline'}
                onClick={() => setPeriodo('1y')}
                style={{ borderRadius: '12px' }}
              >
                1 ano
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        {topTrilhas.length > 0 && (
          <BarChart
            title="Top 10 Trilhas Mais Acessadas"
            description="Trilhas com mais inscrições"
            data={topTrilhas}
            xKey="trilha"
            yKeys={[
              {
                key: 'totalInscritos',
                name: 'Inscritos',
                color: '#C80000',
              },
            ]}
            module="trilhas"
            height={350}
          />
        )}
        {evolucaoTemporal.length > 0 && (
          <LineChart
            title="Evolução Temporal de Inscrições"
            description="Inscrições nos últimos 12 meses"
            data={evolucaoTemporal}
            xKey="mes"
            yKeys={[
              {
                key: 'inscricoes',
                name: 'Inscrições',
                color: '#C80000',
              },
            ]}
            module="trilhas"
            height={350}
          />
        )}
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
                color: '#C80000',
              },
            ]}
            module="trilhas"
            height={350}
          />
        )}
        {progressoPorTrilha.length > 0 && (
          <PieChart
            title="Conclusão por Trilha"
            description="Distribuição de conclusões"
            data={progressoPorTrilha
              .filter((p) => p.concluidos > 0)
              .slice(0, 8)
              .map((item) => ({
                name: item.trilha,
                value: item.concluidos,
              }))}
            module="trilhas"
            height={350}
          />
        )}
      </div>

      {/* Lista de Trilhas */}
      <Card
        className="border-0 shadow-soft overflow-hidden"
        style={{ borderRadius: '22px' }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-trilhas-primary" />
            Lista de Trilhas
          </CardTitle>
          <CardDescription>
            {trilhasFiltradas.length} trilha(s) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
                    Trilha
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
                    Carga Horária
                  </th>
                  <th className="text-right p-3 text-sm font-semibold text-muted-foreground">
                    Inscritos
                  </th>
                  <th className="text-right p-3 text-sm font-semibold text-muted-foreground">
                    Concluídos
                  </th>
                  <th className="text-right p-3 text-sm font-semibold text-muted-foreground">
                    % Conclusão
                  </th>
                  <th className="text-right p-3 text-sm font-semibold text-muted-foreground">
                    Módulos
                  </th>
                  <th className="text-center p-3 text-sm font-semibold text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {trilhasFiltradas.map((trilha) => {
                  const progresso = progressoPorTrilha.find(
                    (p) => p.id === trilha.id
                  )

                  return (
                    <motion.tr
                      key={trilha.id}
                      className="border-b hover:bg-muted/50 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{trilha.titulo}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {trilha.descricao}
                          </p>
                        </div>
                      </td>
                      <td className="p-3">{trilha.carga_horaria}h</td>
                      <td className="p-3 text-right font-medium">
                        {progresso?.totalInscritos || 0}
                      </td>
                      <td className="p-3 text-right font-medium">
                        {progresso?.concluidos || 0}
                      </td>
                      <td className="p-3 text-right">
                        <span
                          className={cn(
                            'font-bold',
                            (progresso?.percentualConclusao || 0) >= 70
                              ? 'text-green-600'
                              : (progresso?.percentualConclusao || 0) >= 40
                              ? 'text-yellow-600'
                              : 'text-red-600'
                          )}
                        >
                          {formatPercent(progresso?.percentualConclusao || 0)}
                        </span>
                      </td>
                      <td className="p-3 text-right font-medium">
                        {trilha.modulos_trilhas.length}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={cn(
                            'rounded-full px-3 py-1 text-xs font-medium',
                            progresso?.status === 'ativo'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          )}
                        >
                          {progresso?.status === 'ativo' ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Inscritos */}
      <Card
        className="border-0 shadow-soft overflow-hidden"
        style={{ borderRadius: '22px' }}
      >
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
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
                    Aluno
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
                    Email
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
                    Trilha
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
                    Data Inscrição
                  </th>
                  <th className="text-center p-3 text-sm font-semibold text-muted-foreground">
                    Concluído
                  </th>
                  <th className="text-right p-3 text-sm font-semibold text-muted-foreground">
                    Progresso
                  </th>
                </tr>
              </thead>
              <tbody>
                {inscritos.slice(0, 50).map((inscrito, index) => (
                  <motion.tr
                    key={inscrito.id}
                    className="border-b hover:bg-muted/50 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <td className="p-3 font-medium">{inscrito.aluno}</td>
                    <td className="p-3 text-muted-foreground">
                      {inscrito.email}
                    </td>
                    <td className="p-3">{inscrito.trilha}</td>
                    <td className="p-3 text-muted-foreground">
                      {formatDate(inscrito.dataInscricao)}
                    </td>
                    <td className="p-3 text-center">
                      {inscrito.concluido ? (
                        <span className="text-green-600 font-medium">Sim</span>
                      ) : (
                        <span className="text-muted-foreground">Não</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <span
                        className={cn(
                          'font-bold',
                          inscrito.percentualConcluido >= 70
                            ? 'text-green-600'
                            : inscrito.percentualConcluido >= 40
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        )}
                      >
                        {formatPercent(inscrito.percentualConcluido)}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
