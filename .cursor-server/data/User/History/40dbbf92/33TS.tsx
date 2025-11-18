'use client'

import { useEduData } from '@/lib/queries/edu'
import { KPICard } from '@/components/dashboard/kpi-card'
import { BarChart } from '@/components/charts/bar-chart'
import { PieChart } from '@/components/charts/pie-chart'
import { LineChart } from '@/components/charts/line-chart'
import { AreaChart } from '@/components/charts/area-chart'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  GraduationCap,
  School,
  BookOpen,
  Users,
  Calendar,
  Award,
  TrendingUp,
} from 'lucide-react'
import { formatNumber, formatPercent } from '@/lib/formatters'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function EduPage() {
  const { data, isLoading, error } = useEduData()

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
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
    frequenciaPorEscola,
    frequenciaDiaria,
    rankingCursos,
    comparativoMensal,
    mapaCalorHorario,
    stats,
    matriculasPorStatus,
  } = data.data

  const mediaFrequencia =
    frequenciaPorEscola.reduce((acc, e) => acc + e.frequencia, 0) /
    (frequenciaPorEscola.length || 1)

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2" style={{ color: '#F7A600' }}>
          OxeTech Edu
        </h1>
        <p className="text-lg text-muted-foreground">
          Dashboard completo do programa OxeTech Edu
        </p>
      </motion.div>

      {/* KPIs */}
      <div className="grid gap-6 md:grid-cols-4">
        <KPICard
          title="Total de Escolas"
          value={formatNumber(stats.totalEscolas)}
          icon={School}
          module="edu"
          delay={0}
          description="Escolas parceiras"
        />
        <KPICard
          title="Matrículas"
          value={formatNumber(stats.totalMatriculas)}
          icon={GraduationCap}
          module="edu"
          delay={50}
        />
        <KPICard
          title="Turmas Ativas"
          value={formatNumber(stats.totalTurmas)}
          icon={BookOpen}
          module="edu"
          delay={100}
        />
        <KPICard
          title="Média de Frequência"
          value={formatPercent(mediaFrequencia)}
          icon={TrendingUp}
          module="edu"
          delay={150}
          description="Frequência média geral"
        />
      </div>

      {/* Gráficos Principais */}
      <div className="grid gap-6 md:grid-cols-2">
        {comparativoMensal.length > 0 && (
          <AreaChart
            title="Comparativo Mensal de Matrículas"
            description="Evolução das matrículas nos últimos 12 meses"
            data={comparativoMensal}
            xKey="mes"
            yKeys={[
              {
                key: 'matriculas',
                name: 'Matrículas',
                color: '#F7A600',
              },
            ]}
            module="edu"
            height={350}
          />
        )}
        {frequenciaDiaria.length > 0 && (
          <LineChart
            title="Frequência Diária (Últimos 30 dias)"
            description="Evolução da frequência diária"
            data={frequenciaDiaria}
            xKey="dia"
            yKeys={[
              {
                key: 'frequencia',
                name: 'Frequência (%)',
                color: '#FFA83E',
              },
            ]}
            module="edu"
            height={350}
          />
        )}
      </div>

      {/* Rankings e Distribuições */}
      <div className="grid gap-6 md:grid-cols-2">
        {rankingCursos.length > 0 && (
          <BarChart
            title="Top 10 Cursos Mais Procurados"
            description="Ranking dos cursos com mais matrículas"
            data={rankingCursos}
            xKey="curso"
            yKeys={[
              {
                key: 'totalMatriculas',
                name: 'Matrículas',
                color: '#F7A600',
              },
            ]}
            module="edu"
            height={350}
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
            module="edu"
            height={350}
          />
        )}
      </div>

      {/* Frequência por Escola */}
      {frequenciaPorEscola.length > 0 && (
        <Card
          className="border-0 shadow-soft overflow-hidden"
          style={{ borderRadius: '22px' }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="h-5 w-5 text-edu-primary" />
              Frequência por Escola
            </CardTitle>
            <CardDescription>
              Percentual de frequência e estatísticas por escola
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
                      Escola
                    </th>
                    <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
                      Município
                    </th>
                    <th className="text-right p-3 text-sm font-semibold text-muted-foreground">
                      Frequência
                    </th>
                    <th className="text-right p-3 text-sm font-semibold text-muted-foreground">
                      Presenças
                    </th>
                    <th className="text-right p-3 text-sm font-semibold text-muted-foreground">
                      Total Aulas
                    </th>
                    <th className="text-right p-3 text-sm font-semibold text-muted-foreground">
                      Matrículas
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {frequenciaPorEscola
                    .sort((a, b) => b.frequencia - a.frequencia)
                    .map((item, index) => (
                      <motion.tr
                        key={index}
                        className="border-b hover:bg-muted/50 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <td className="p-3">
                          <p className="font-medium">{item.escola}</p>
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {item.municipio}
                        </td>
                        <td className="p-3 text-right">
                          <span
                            className={cn(
                              'font-bold',
                              item.frequencia >= 80
                                ? 'text-green-600'
                                : item.frequencia >= 60
                                ? 'text-yellow-600'
                                : 'text-red-600'
                            )}
                          >
                            {formatPercent(item.frequencia)}
                          </span>
                        </td>
                        <td className="p-3 text-right font-medium">
                          {item.totalPresencas}
                        </td>
                        <td className="p-3 text-right font-medium">
                          {item.totalAulas}
                        </td>
                        <td className="p-3 text-right font-medium">
                          {item.totalMatriculas}
                        </td>
                      </motion.tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ranking de Cursos */}
      {rankingCursos.length > 0 && (
        <Card
          className="border-0 shadow-soft overflow-hidden"
          style={{ borderRadius: '22px' }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-edu-primary" />
              Ranking de Cursos
            </CardTitle>
            <CardDescription>
              Top 10 cursos mais procurados no OxeTech Edu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
                      Posição
                    </th>
                    <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
                      Curso
                    </th>
                    <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
                      Escola
                    </th>
                    <th className="text-right p-3 text-sm font-semibold text-muted-foreground">
                      Matrículas
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rankingCursos.map((curso, index) => (
                    <motion.tr
                      key={index}
                      className="border-b hover:bg-muted/50 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <td className="p-3">
                        <span
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-full font-bold text-sm',
                            index < 3
                              ? 'bg-edu-primary text-white'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          {index + 1}
                        </span>
                      </td>
                      <td className="p-3">
                        <p className="font-medium">{curso.curso}</p>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {curso.escola}
                      </td>
                      <td className="p-3 text-right font-bold text-edu-primary">
                        {curso.totalMatriculas}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mapa de Calor por Horário */}
      {mapaCalorHorario.length > 0 && (
        <Card
          className="border-0 shadow-soft overflow-hidden"
          style={{ borderRadius: '22px' }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-edu-primary" />
              Mapa de Calor por Horário
            </CardTitle>
            <CardDescription>
              Horários com maior frequência de presenças
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {mapaCalorHorario.map((item, index) => {
                const intensity = Math.min(
                  (item.frequencia / mapaCalorHorario[0].frequencia) * 100,
                  100
                )
                return (
                  <motion.div
                    key={index}
                    className="p-4 rounded-xl text-center transition-all hover:scale-105"
                    style={{
                      backgroundColor: `rgba(247, 166, 0, ${intensity / 100})`,
                      borderRadius: '16px',
                    }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <p className="text-xs font-medium mb-1">{item.horario}</p>
                    <p className="text-xl font-bold">{item.frequencia}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      presenças
                    </p>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
