'use client'

import { useQuery } from '@tanstack/react-query'
import { KPICard } from '@/components/dashboard/kpi-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertList } from '@/components/core/alert-banner'
import { AuditList } from '@/components/core/audit-card'
import { BarChart } from '@/components/charts/bar-chart'
import { AreaChart } from '@/components/charts/area-chart'
import { Skeleton } from '@/components/ui/skeleton'
import { formatNumber, formatPercent } from '@/lib/formatters'
import {
  Activity,
  AlertTriangle,
  TrendingUp,
  Users,
  School,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { motion } from 'framer-motion'

interface LabMonitorData {
  data: {
    turmasAbertasHoje: number
    turmasComPresenca: Array<{
      id: number
      titulo: string
      ausenciaPercentual: number
      totalAlunos: number
      presentes: number
      ausentes: number
      frequencia: number
      escola: string
      laboratorio: string
      municipio: string
    }>
    rankingEscolas: Array<{
      escola: string
      totalTurmas: number
      mediaFrequencia: number
      totalAlunos: number
    }>
    heatmapSemanal: Array<{
      dia: string
      presencas: number
      total: number
      percentual: number
    }>
    turmasCriticas: Array<any>
    turmasSemPresenca: Array<any>
    professoresEvasao: Array<{
      professor: string
      evasao: number
      turmas: number
    }>
    alertas: Array<any>
    auditoria: Array<any>
    stats: {
      totalTurmas: number
      totalAlunos: number
      mediaFrequencia: number
      totalAlertas: number
      totalAuditoria: number
    }
  }
  error: string | null
}

async function fetchLabMonitorData(): Promise<LabMonitorData> {
  const response = await fetch('/api/monitor/lab')
  if (!response.ok) {
    throw new Error('Failed to fetch lab monitor data')
  }
  return response.json()
}

export default function MonitorLabPage() {
  const { data, isLoading, error } = useQuery<LabMonitorData, Error>({
    queryKey: ['monitor-lab'],
    queryFn: fetchLabMonitorData,
    staleTime: 1 * 60 * 1000, // 1 minuto (dados em tempo real)
    refetchInterval: 2 * 60 * 1000, // Refetch a cada 2 minutos
  })

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid gap-6 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !data?.data) {
    return (
      <div className="flex h-96 items-center justify-center rounded-2xl bg-destructive/10">
        <div className="text-center">
          <p className="text-lg font-semibold text-destructive">
            Erro ao carregar dados de monitoramento
          </p>
        </div>
      </div>
    )
  }

  const {
    turmasAbertasHoje,
    turmasComPresenca,
    rankingEscolas,
    heatmapSemanal,
    turmasCriticas,
    turmasSemPresenca,
    professoresEvasao,
    alertas,
    auditoria,
    stats,
  } = data.data

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2" style={{ color: '#FF6A00' }}>
          Monitoramento em Tempo Real - OxeTech Lab
        </h1>
        <p className="text-lg text-muted-foreground">
          Acompanhamento em tempo real de turmas, presenças e alertas críticos
        </p>
      </motion.div>

      {/* KPIs */}
      <div className="grid gap-6 md:grid-cols-4">
        <KPICard
          title="Turmas Abertas Hoje"
          value={formatNumber(turmasAbertasHoje)}
          icon={Activity}
          module="lab"
          delay={0}
        />
        <KPICard
          title="Total de Turmas"
          value={formatNumber(stats.totalTurmas)}
          icon={School}
          module="lab"
          delay={50}
        />
        <KPICard
          title="Total de Alunos"
          value={formatNumber(stats.totalAlunos)}
          icon={Users}
          module="lab"
          delay={100}
        />
        <KPICard
          title="Frequência Média"
          value={formatPercent(stats.mediaFrequencia)}
          icon={TrendingUp}
          module="lab"
          delay={150}
        />
        <KPICard
          title="Turmas Críticas"
          value={formatNumber(turmasCriticas.length)}
          icon={AlertTriangle}
          module="lab"
          delay={200}
          description="Ausência > 30%"
        />
        <KPICard
          title="Turmas sem Presença"
          value={formatNumber(turmasSemPresenca.length)}
          icon={XCircle}
          module="lab"
          delay={250}
        />
        <KPICard
          title="Total de Alertas"
          value={formatNumber(stats.totalAlertas)}
          icon={AlertTriangle}
          module="lab"
          delay={300}
        />
        <KPICard
          title="Itens de Auditoria"
          value={formatNumber(stats.totalAuditoria)}
          icon={CheckCircle}
          module="lab"
          delay={350}
        />
      </div>

      {/* Alertas */}
      {alertas.length > 0 && (
        <Card className="border-0 shadow-soft overflow-hidden" style={{ borderRadius: '22px' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-lab-primary" />
              Alertas Ativos
            </CardTitle>
            <CardDescription>
              Alertas gerados automaticamente com base nas regras de gestão
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertList alertas={alertas} maxItems={10} />
          </CardContent>
        </Card>
      )}

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-soft overflow-hidden" style={{ borderRadius: '22px' }}>
          <CardHeader>
            <CardTitle>Ranking de Escolas por Frequência</CardTitle>
            <CardDescription>Escolas ordenadas por frequência média</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              title=""
              description=""
              data={rankingEscolas.slice(0, 10)}
              xKey="escola"
              yKeys={[
                {
                  key: 'mediaFrequencia',
                  name: 'Frequência Média (%)',
                  color: '#FF6A00',
                },
              ]}
              module="lab"
              height={350}
            />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-soft overflow-hidden" style={{ borderRadius: '22px' }}>
          <CardHeader>
            <CardTitle>Heatmap Semanal de Presença</CardTitle>
            <CardDescription>Presença por dia da semana (últimos 7 dias)</CardDescription>
          </CardHeader>
          <CardContent>
            <AreaChart
              title=""
              description=""
              data={heatmapSemanal}
              xKey="dia"
              yKeys={[
                {
                  key: 'percentual',
                  name: 'Presença (%)',
                  color: '#FF6A00',
                },
              ]}
              module="lab"
              height={350}
            />
          </CardContent>
        </Card>
      </div>

      {/* Tabelas */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Turmas Críticas */}
        {turmasCriticas.length > 0 && (
          <Card className="border-0 shadow-soft overflow-hidden" style={{ borderRadius: '22px' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Turmas Críticas (Ausência &gt; 30%)
              </CardTitle>
              <CardDescription>Turmas que precisam de atenção imediata</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 text-sm font-semibold">Turma</th>
                      <th className="text-left p-3 text-sm font-semibold">Escola</th>
                      <th className="text-right p-3 text-sm font-semibold">Ausência</th>
                      <th className="text-right p-3 text-sm font-semibold">Alunos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {turmasCriticas.slice(0, 10).map((turma, index) => (
                      <motion.tr
                        key={turma.id}
                        className="border-b hover:bg-muted/50 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <td className="p-3 font-medium">{turma.titulo}</td>
                        <td className="p-3 text-muted-foreground text-sm">{turma.escola}</td>
                        <td className="p-3 text-right font-bold text-red-600">
                          {formatPercent(turma.ausenciaPercentual)}
                        </td>
                        <td className="p-3 text-right">{turma.totalAlunos}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Professores com Maior Evasão */}
        {professoresEvasao.length > 0 && (
          <Card className="border-0 shadow-soft overflow-hidden" style={{ borderRadius: '22px' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-lab-primary" />
                Professores com Maior Evasão
              </CardTitle>
              <CardDescription>Ranking de professores por taxa de ausência</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 text-sm font-semibold">Professor</th>
                      <th className="text-right p-3 text-sm font-semibold">Evasão (%)</th>
                      <th className="text-right p-3 text-sm font-semibold">Turmas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {professoresEvasao.map((prof, index) => (
                      <motion.tr
                        key={prof.professor}
                        className="border-b hover:bg-muted/50 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <td className="p-3 font-medium">{prof.professor}</td>
                        <td className="p-3 text-right font-bold text-red-600">
                          {formatPercent(prof.evasao)}
                        </td>
                        <td className="p-3 text-right">{prof.turmas}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Auditoria */}
      {auditoria.length > 0 && (
        <Card className="border-0 shadow-soft overflow-hidden" style={{ borderRadius: '22px' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-lab-primary" />
              Auditoria - Irregularidades Detectadas
            </CardTitle>
            <CardDescription>
              Análise automatizada de inconsistências e irregularidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuditList findings={auditoria} maxItems={20} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

