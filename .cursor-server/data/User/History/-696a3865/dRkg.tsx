'use client'

import { useLabData } from '@/lib/queries/lab'
import { KPICard } from '@/components/dashboard/kpi-card'
import { LineChart } from '@/components/charts/line-chart'
import { BarChart } from '@/components/charts/bar-chart'
import { PieChart } from '@/components/charts/pie-chart'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FlaskConical,
  Users,
  TrendingUp,
  CheckCircle,
  XCircle,
  Calendar,
  MapPin,
} from 'lucide-react'
import { formatNumber, formatPercent, formatDate } from '@/lib/formatters'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function LabPage() {
  const { data, isLoading, error } = useLabData()

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid gap-6 md:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
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
    distribuicaoPorCurso,
    cursosNormalizados,
    cursosPorCategoria,
    inscricoesPorCursoNormalizado,
    analisePorCurso,
    evolucaoTemporal,
    evolucaoSemanal,
    inscricoesPorLaboratorio,
    inscricoes,
  } = data.data

  const taxaOcupacao =
    stats.totalVagas > 0
      ? (stats.vagasOcupadas / stats.totalVagas) * 100
      : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2" style={{ color: '#FF6A00' }}>
          OxeTech Lab
        </h1>
        <p className="text-lg text-muted-foreground">
          Dashboard completo do programa OxeTech Lab
        </p>
      </motion.div>

      {/* KPIs */}
      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-6">
        <KPICard
          title="Total de Inscrições"
          value={formatNumber(stats.totalInscricoes)}
          icon={FlaskConical}
          module="lab"
          delay={0}
        />
        <KPICard
          title="Inscrições Ativas"
          value={formatNumber(stats.inscricoesAtivas)}
          icon={CheckCircle}
          module="lab"
          delay={50}
        />
        <KPICard
          title="Inscrições Finalizadas"
          value={formatNumber(stats.inscricoesFinalizadas)}
          icon={XCircle}
          module="lab"
          delay={100}
        />
        <KPICard
          title="Distribuição por Curso"
          value={formatNumber(distribuicaoPorCurso.length)}
          icon={TrendingUp}
          module="lab"
          delay={150}
        />
        <KPICard
          title="Média por Laboratório"
          value={formatNumber(stats.mediaPorLaboratorio)}
          icon={Users}
          module="lab"
          delay={200}
        />
        <KPICard
          title="Taxa de Ocupação"
          value={formatPercent(taxaOcupacao)}
          icon={TrendingUp}
          module="lab"
          delay={250}
        />
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card
          className="border-0 shadow-soft"
          style={{ borderRadius: '22px' }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-lab-primary" />
              Slots de Vagas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Ocupadas</span>
              <span className="text-xl font-bold text-lab-primary">
                {stats.vagasOcupadas}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Livres</span>
              <span className="text-xl font-bold text-green-600">
                {stats.vagasLivres}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-2xl font-bold text-lab-primary">
                {stats.totalVagas}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-0 shadow-soft"
          style={{ borderRadius: '22px' }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-lab-primary" />
              Status das Inscrições
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Ativas</span>
              <span className="text-xl font-bold text-lab-primary">
                {stats.inscricoesAtivas}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Finalizadas</span>
              <span className="text-xl font-bold text-green-600">
                {stats.inscricoesFinalizadas}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-0 shadow-soft"
          style={{ borderRadius: '22px' }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-lab-primary" />
              Laboratórios Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-lab-primary mb-2">
              {inscricoesPorLaboratorio.length}
            </div>
            <p className="text-sm text-muted-foreground">
              Laboratórios com inscrições
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        {evolucaoSemanal.length > 0 && (
          <LineChart
            title="Evolução Semanal (Últimas 8 Semanas)"
            description="Crescimento das inscrições por semana"
            data={evolucaoSemanal}
            xKey="semana"
            yKeys={[
              {
                key: 'inscricoes',
                name: 'Inscrições',
                color: '#FF6A00',
              },
            ]}
            module="lab"
            height={350}
          />
        )}
        {distribuicaoPorCurso.length > 0 && (
          <PieChart
            title="Distribuição por Curso"
            description="Inscrições distribuídas por curso"
            data={distribuicaoPorCurso.slice(0, 10).map((item) => ({
              name: item.curso,
              value: item.total,
            }))}
            module="lab"
            height={350}
          />
        )}
        {inscricoesPorLaboratorio.length > 0 && (
          <BarChart
            title="Inscrições por Laboratório"
            description="Distribuição de inscrições por laboratório"
            data={inscricoesPorLaboratorio.slice(0, 15)}
            xKey="laboratorio"
            yKeys={[
              {
                key: 'totalInscricoes',
                name: 'Inscrições',
                color: '#FF6A00',
              },
            ]}
            module="lab"
            height={350}
          />
        )}
        {evolucaoTemporal.length > 0 && (
          <LineChart
            title="Evolução Temporal (Últimos 12 Meses)"
            description="Crescimento das inscrições ao longo do tempo"
            data={evolucaoTemporal}
            xKey="mes"
            yKeys={[
              {
                key: 'inscricoes',
                name: 'Inscrições',
                color: '#B30000',
              },
            ]}
            module="lab"
            height={350}
          />
        )}
      </div>

      {/* Comparativo: Ocupados vs Livres */}
      <div className="grid gap-6 md:grid-cols-2">
        <BarChart
          title="Slots Ocupados vs Livres"
          description="Comparativo de vagas ocupadas e livres"
          data={[
            { tipo: 'Ocupados', quantidade: stats.vagasOcupadas },
            { tipo: 'Livres', quantidade: stats.vagasLivres },
          ]}
          xKey="tipo"
          yKeys={[
            {
              key: 'quantidade',
              name: 'Quantidade',
              color: '#FF6A00',
            },
          ]}
          module="lab"
          height={300}
        />
        {stats.inscricoesPorStatus.length > 0 && (
          <PieChart
            title="Inscrições por Status"
            description="Distribuição de inscrições por status"
            data={stats.inscricoesPorStatus.map((item) => ({
              name: item.status,
              value: item.total,
            }))}
            module="lab"
            height={300}
          />
        )}
      </div>

      {/* Tabela de Inscrições */}
      <Card
        className="border-0 shadow-soft overflow-hidden"
        style={{ borderRadius: '22px' }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-lab-primary" />
            Lista de Inscrições
          </CardTitle>
          <CardDescription>
            Últimas 100 inscrições no OxeTech Lab
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
                    Curso
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
                    Laboratório
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
                    Município
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
                    Data Inscrição
                  </th>
                  <th className="text-center p-3 text-sm font-semibold text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {inscricoes.slice(0, 100).map((insc, index) => (
                  <motion.tr
                    key={insc.id}
                    className="border-b hover:bg-muted/50 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <td className="p-3 font-medium">{insc.aluno}</td>
                    <td className="p-3 text-muted-foreground">{insc.email}</td>
                    <td className="p-3">{insc.curso}</td>
                    <td className="p-3">{insc.laboratorio}</td>
                    <td className="p-3 text-muted-foreground">
                      {insc.municipio}
                    </td>
                    <td className="p-3 text-muted-foreground text-sm">
                      {formatDate(insc.dataInscricao)}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={cn(
                          'rounded-full px-3 py-1 text-xs font-medium',
                          insc.status === 'FINALIZADO'
                            ? 'bg-green-100 text-green-800'
                            : insc.status === 'ATIVO'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        )}
                      >
                        {insc.status}
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
