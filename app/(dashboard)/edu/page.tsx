/**
 * Dashboard OxeTech Edu - Bento Grid Style
 * Inspirado em USAspending.gov
 */

'use client'

import { useEduData } from '@/lib/queries/edu'
import { GovCard } from '@/components/ui/gov-card'
import { GovKPI } from '@/components/dashboard/gov-kpi'
import { BentoGridSkeleton } from '@/components/ui/bento-skeleton'
import { BarChart } from '@/components/charts/bar-chart'
import { PieChart } from '@/components/charts/pie-chart'
import { LineChart } from '@/components/charts/line-chart'
import { AreaChart } from '@/components/charts/area-chart'
import {
  GraduationCap,
  School,
  BookOpen,
  TrendingUp,
  Award,
  Calendar,
} from 'lucide-react'
import { formatNumber, formatPercent } from '@/lib/formatters'
import { cn } from '@/lib/utils'

export default function EduPage() {
  const { data, isLoading, error } = useEduData()

  if (isLoading) {
    return <BentoGridSkeleton count={8} />
  }

  if (error) {
    console.error('Error loading edu data:', error)
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
    <div className="bento-grid">
      {/* Big Number Ribbon - KPIs Principais */}
      <GovKPI
        label="Total de Escolas"
        value={stats.totalEscolas || 0}
        icon={School}
        description="Escolas cadastradas"
        delay={0}
      />
      <GovKPI
        label="Matrículas"
        value={stats.totalMatriculas || 0}
        icon={GraduationCap}
        description="Total de matrículas"
        delay={100}
      />
      <GovKPI
        label="Turmas Ativas"
        value={stats.totalTurmas || 0}
        icon={BookOpen}
        description="Turmas em atividade"
        delay={200}
      />
      <GovKPI
        label="Média de Frequência"
        value={`${mediaFrequencia.toFixed(1)}%`}
        icon={TrendingUp}
        description="Percentual médio de frequência"
        delay={300}
      />

      {/* Gráficos Principais */}
      {comparativoMensal.length > 0 && (
        <GovCard title="Comparativo Mensal de Matrículas" span={2}>
          <AreaChart
            title=""
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
            height={300}
          />
        </GovCard>
      )}
      {frequenciaDiaria.length > 0 && (
        <GovCard title="Frequência Diária" span={2}>
          <LineChart
            title=""
            description="Evolução da frequência diária (últimos 30 dias)"
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
            height={300}
          />
        </GovCard>
      )}

      {/* Rankings e Distribuições */}
      {rankingCursos.length > 0 && (
        <GovCard title="Top 10 Cursos Mais Procurados" span={2}>
          <BarChart
            title=""
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
            height={300}
          />
        </GovCard>
      )}
      {matriculasPorStatus.length > 0 && (
        <GovCard title="Matrículas por Status" span={2}>
          <PieChart
            title=""
            description="Distribuição de matrículas por status"
            data={matriculasPorStatus.map((item) => ({
              name: item.status,
              value: item.total,
            }))}
            module="edu"
            height={300}
          />
        </GovCard>
      )}

      {/* Frequência por Escola */}
      {frequenciaPorEscola.length > 0 && (
        <GovCard title="Frequência por Escola" span={4}>
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
                  .map((item) => (
                    <tr
                      key={item.escola}
                      className="border-b hover:bg-muted/50 transition-colors"
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
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </GovCard>
      )}

      {/* Ranking de Cursos */}
      {rankingCursos.length > 0 && (
        <GovCard title="Ranking de Cursos" span={4}>
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
                  <tr
                    key={index}
                    className="border-b hover:bg-muted/50 transition-colors"
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GovCard>
      )}

      {/* Mapa de Calor por Horário */}
      {mapaCalorHorario.length > 0 && (
        <GovCard title="Mapa de Calor por Horário" span={4}>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {mapaCalorHorario.map((item) => {
              const intensity = Math.min(
                (item.frequencia / mapaCalorHorario[0].frequencia) * 100,
                100
              )
              return (
                <div
                  key={item.horario}
                  className="p-4 rounded-xl text-center transition-all hover:scale-105"
                  style={{
                    backgroundColor: `rgba(247, 166, 0, ${intensity / 100})`,
                    borderRadius: '16px',
                  }}
                >
                  <p className="text-xs font-medium mb-1">{item.horario}</p>
                  <p className="text-xl font-bold">{item.frequencia}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    presenças
                  </p>
                </div>
              )
            })}
          </div>
        </GovCard>
      )}
    </div>
  )
}
