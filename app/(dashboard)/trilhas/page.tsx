/**
 * Dashboard Trilhas de Conhecimento - Bento Grid Style
 * Inspirado em USAspending.gov
 */

'use client'

import { useState, useMemo } from 'react'
import { useTrilhasData } from '@/lib/queries/trilhas'
import { GovCard } from '@/components/ui/gov-card'
import { GovKPI } from '@/components/dashboard/gov-kpi'
import { BentoGridSkeleton } from '@/components/ui/bento-skeleton'
import { BarChart } from '@/components/charts/bar-chart'
import { PieChart } from '@/components/charts/pie-chart'
import { LineChart } from '@/components/charts/line-chart'
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
    return <BentoGridSkeleton count={8} />
  }

  if (error) {
    console.error('Error loading trilhas data:', error)
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
    <div className="bento-grid">
      {/* Big Number Ribbon - KPIs Principais */}
      <GovKPI
        label="Total de Trilhas"
        value={stats.totalTrilhas || 0}
        icon={BookOpen}
        description="Trilhas cadastradas"
        delay={0}
      />
      <GovKPI
        label="Total de Inscritos"
        value={stats.totalInscritos || 0}
        icon={Users}
        description="Alunos inscritos"
        delay={100}
      />
      <GovKPI
        label="Total Concluídos"
        value={stats.totalConcluidos || 0}
        icon={CheckCircle}
        description="Trilhas concluídas"
        delay={200}
      />
      <GovKPI
        label="Progresso Médio"
        value={`${stats.progressoMedioGeral.toFixed(1)}%`}
        icon={TrendingUp}
        description="Percentual médio de progresso"
        delay={300}
      />

      {/* Filtros */}
      <GovCard title="Filtros" span={4}>
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
      </GovCard>

      {/* Gráficos */}
      {topTrilhas.length > 0 && (
        <GovCard title="Top 10 Trilhas Mais Acessadas" span={2}>
          <BarChart
            title=""
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
            height={300}
          />
        </GovCard>
      )}
      {evolucaoTemporal.length > 0 && (
        <GovCard title="Evolução Temporal de Inscrições" span={2}>
          <LineChart
            title=""
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
            height={300}
          />
        </GovCard>
      )}
      {progressoPorTrilha.length > 0 && (
        <GovCard title="Progresso Médio por Trilha" span={2}>
          <BarChart
            title=""
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
            height={300}
          />
        </GovCard>
      )}
      {progressoPorTrilha.length > 0 && (
        <GovCard title="Conclusão por Trilha" span={2}>
          <PieChart
            title=""
            description="Distribuição de conclusões"
            data={progressoPorTrilha
              .filter((p) => p.concluidos > 0)
              .slice(0, 8)
              .map((item) => ({
                name: item.trilha,
                value: item.concluidos,
              }))}
            module="trilhas"
            height={300}
          />
        </GovCard>
      )}

      {/* Lista de Trilhas */}
      <GovCard title="Lista de Trilhas" span={4}>
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
                  <tr
                    key={trilha.id}
                    className="border-b hover:bg-muted/50 transition-colors"
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
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </GovCard>

      {/* Tabela de Inscritos */}
      <GovCard title="Inscritos com Progresso" span={4}>
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
              {inscritos.slice(0, 50).map((inscrito) => (
                <tr
                  key={inscrito.id}
                  className="border-b hover:bg-muted/50 transition-colors"
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GovCard>
    </div>
  )
}
