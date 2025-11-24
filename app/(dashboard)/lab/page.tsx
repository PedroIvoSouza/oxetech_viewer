/**
 * Dashboard OxeTech Lab - Bento Grid Style
 * Inspirado em USAspending.gov
 */

'use client'

import { useLabData } from '@/lib/queries/lab'
import { GovCard } from '@/components/ui/gov-card'
import { GovKPI } from '@/components/dashboard/gov-kpi'
import { BentoGridSkeleton } from '@/components/ui/bento-skeleton'
import { LineChart } from '@/components/charts/line-chart'
import { BarChart } from '@/components/charts/bar-chart'
import { PieChart } from '@/components/charts/pie-chart'
import {
  FlaskConical,
  Users,
  TrendingUp,
  CheckCircle,
  XCircle,
  Calendar,
  MapPin,
  Award,
} from 'lucide-react'
import { formatNumber, formatPercent, formatDate } from '@/lib/formatters'
import { cn } from '@/lib/utils'

export default function LabPage() {
  const { data, isLoading, error } = useLabData()

  if (isLoading) {
    return <BentoGridSkeleton count={8} />
  }

  if (error) {
    console.error('Error loading lab data:', error)
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
    distribuicaoPorCurso,
    cursosNormalizados,
    cursosPorCategoria,
    inscricoesPorCursoNormalizado,
    analisePorCurso,
    evolucaoTemporal,
    evolucaoSemanal,
    inscricoesPorLaboratorio,
    inscricoes,
    alunosCertificadosLab = [],
    totalCertificadosLab = 0,
  } = data.data

  const taxaOcupacao =
    stats.totalVagas > 0
      ? (stats.vagasOcupadas / stats.totalVagas) * 100
      : 0

  return (
    <div className="bento-grid">
      {/* Big Number Ribbon - KPIs Principais */}
      <GovKPI
        label="Total de Inscrições"
        value={stats.totalInscricoes || 0}
        icon={FlaskConical}
        description="Inscrições realizadas"
        delay={0}
      />
      <GovKPI
        label="Inscrições Ativas"
        value={stats.inscricoesAtivas || 0}
        icon={CheckCircle}
        description="Inscrições em andamento"
        delay={100}
      />
      <GovKPI
        label="Alunos Certificados"
        value={totalCertificadosLab || 0}
        icon={Award}
        description="Alunos que concluíram cursos"
        delay={200}
      />
      <GovKPI
        label="Taxa de Ocupação"
        value={`${taxaOcupacao.toFixed(1)}%`}
        icon={TrendingUp}
        description="Percentual de vagas ocupadas"
        delay={300}
      />

      {/* Card de Explicação dos Dados */}
      <GovCard title="Explicação dos Dados" span={4} className="bg-primary/5 border-l-4 border-primary-vivid">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-1">
              📊 Cálculo de Vagas:
            </p>
            <p className="text-sm text-foreground">
              {stats.explicacao?.vagasCalculo || 'As vagas são calculadas usando TURMAS ÚNICAS, não por inscrição.'}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-1">
              👥 Cálculo de Inscrições:
            </p>
            <p className="text-sm text-foreground">
              {stats.explicacao?.inscricoesCalculo || 'As inscrições são contadas individualmente. Um aluno pode se inscrever em múltiplas turmas.'}
            </p>
          </div>
          <div className="pt-2 border-t">
            <p className="text-sm font-semibold text-muted-foreground mb-1">
              ℹ️ Observação:
            </p>
            <p className="text-sm text-foreground">
              {stats.explicacao?.diferenca || 'Número de inscrições e turmas balanceados'}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Total de Turmas: {formatNumber(stats.totalTurmas || 0)} | Total de Inscrições: {formatNumber(stats.totalInscricoes)}
            </p>
          </div>
        </div>
      </GovCard>

      {/* Cards de Resumo */}
      <GovCard title="Slots de Vagas" span={2}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Ocupadas</span>
            <span className="text-xl font-bold kpi-number-primary">
              {stats.vagasOcupadas}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Livres</span>
            <span className="text-xl font-bold text-success">
              {stats.vagasLivres}
            </span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-2xl font-bold kpi-number-primary">
              {stats.totalVagas}
            </span>
          </div>
        </div>
      </GovCard>

      <GovCard title="Status das Inscrições" span={2}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Ativas</span>
            <span className="text-xl font-bold kpi-number-primary">
              {stats.inscricoesAtivas}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Finalizadas</span>
            <span className="text-xl font-bold text-success">
              {stats.inscricoesFinalizadas}
            </span>
          </div>
        </div>
      </GovCard>

      <GovCard title="Laboratórios Ativos" span={2}>
        <div className="space-y-2">
          <div className="text-4xl font-bold kpi-number-primary mb-2">
            {inscricoesPorLaboratorio.length}
          </div>
          <p className="text-sm text-muted-foreground">
            Laboratórios com inscrições
          </p>
        </div>
      </GovCard>

      {/* Gráficos */}
      {evolucaoSemanal.length > 0 && (
        <GovCard title="Evolução Semanal" span={2}>
          <LineChart
            title=""
            description="Crescimento das inscrições por semana (últimas 8 semanas)"
            data={evolucaoSemanal}
            xKey="semana"
            yKeys={[
              {
                key: 'inscricoes',
                name: 'Inscrições',
                color: '#005ea2',
              },
            ]}
            module="lab"
            height={300}
          />
        </GovCard>
      )}
      {distribuicaoPorCurso.length > 0 && (
        <GovCard title="Distribuição por Curso" span={2}>
          <PieChart
            title=""
            description="Inscrições distribuídas por curso (top 10)"
            data={distribuicaoPorCurso.slice(0, 10).map((item) => ({
              name: item.curso,
              value: item.total,
            }))}
            module="lab"
            height={300}
          />
        </GovCard>
      )}
      {inscricoesPorLaboratorio.length > 0 && (
        <GovCard title="Inscrições por Laboratório" span={2}>
          <BarChart
            title=""
            description="Distribuição de inscrições por laboratório (top 15)"
            data={inscricoesPorLaboratorio.slice(0, 15)}
            xKey="laboratorio"
            yKeys={[
              {
                key: 'totalInscricoes',
                name: 'Inscrições',
                color: '#005ea2',
              },
            ]}
            module="lab"
            height={300}
          />
        </GovCard>
      )}
      {evolucaoTemporal.length > 0 && (
        <GovCard title="Evolução Temporal" span={2}>
          <LineChart
            title=""
            description="Crescimento das inscrições ao longo do tempo (últimos 12 meses)"
            data={evolucaoTemporal}
            xKey="mes"
            yKeys={[
              {
                key: 'inscricoes',
                name: 'Inscrições',
                color: '#1a4480',
              },
            ]}
            module="lab"
            height={300}
          />
        </GovCard>
      )}

      {/* Análise por Curso Normalizado */}
      {inscricoesPorCursoNormalizado.length > 0 && (
        <GovCard title="Análise por Curso Normalizado (Inscrições)" span={4}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
                    Curso Normalizado
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
                    Categoria
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
                    Subcategoria
                  </th>
                  <th className="text-right p-3 text-sm font-semibold text-muted-foreground">
                    Inscrições
                  </th>
                </tr>
              </thead>
              <tbody>
                {inscricoesPorCursoNormalizado.slice(0, 30).map((curso) => (
                  <tr
                    key={curso.nomeOriginal}
                    className="border-b hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-3 font-medium">{curso.nomeNormalizado}</td>
                    <td className="p-3 text-muted-foreground">{curso.categoria}</td>
                    <td className="p-3 text-muted-foreground">
                      {curso.subcategoria || '-'}
                    </td>
                    <td className="p-3 text-right font-bold">{curso.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GovCard>
      )}

      {/* Análise Detalhada por Curso (com Vagas) */}
      {analisePorCurso.length > 0 && (
        <GovCard title="Análise Detalhada por Curso (Vagas e Inscrições)" span={4}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
                    Curso Normalizado
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
                    Categoria
                  </th>
                  <th className="text-right p-3 text-sm font-semibold text-muted-foreground">
                    Turmas
                  </th>
                  <th className="text-right p-3 text-sm font-semibold text-muted-foreground">
                    Inscrições
                  </th>
                  <th className="text-right p-3 text-sm font-semibold text-muted-foreground">
                    Vagas Total
                  </th>
                  <th className="text-right p-3 text-sm font-semibold text-muted-foreground">
                    Vagas Ocupadas
                  </th>
                  <th className="text-right p-3 text-sm font-semibold text-muted-foreground">
                    Vagas Livres
                  </th>
                  <th className="text-right p-3 text-sm font-semibold text-muted-foreground">
                    Taxa Ocupação
                  </th>
                </tr>
              </thead>
              <tbody>
                {analisePorCurso.slice(0, 50).map((curso) => (
                  <tr
                    key={curso.nomeOriginal}
                    className="border-b hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-3 font-medium">{curso.nomeNormalizado}</td>
                    <td className="p-3 text-muted-foreground text-sm">
                      {curso.categoria}
                    </td>
                    <td className="p-3 text-right">{curso.totalTurmas}</td>
                    <td className="p-3 text-right font-bold">
                      {formatNumber(curso.totalInscricoes)}
                    </td>
                    <td className="p-3 text-right">{formatNumber(curso.totalVagas)}</td>
                    <td className="p-3 text-right font-medium kpi-number-primary">
                      {formatNumber(curso.vagasOcupadas)}
                    </td>
                    <td className="p-3 text-right text-success">
                      {formatNumber(curso.vagasLivres)}
                    </td>
                    <td className="p-3 text-right">
                      <span
                        className={cn(
                          'font-bold',
                          curso.taxaOcupacao >= 80
                            ? 'text-error'
                            : curso.taxaOcupacao >= 50
                            ? 'text-accent-cool'
                            : 'text-success'
                        )}
                      >
                        {formatPercent(curso.taxaOcupacao)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GovCard>
      )}

      {/* Distribuição por Categoria */}
      {Object.keys(cursosPorCategoria).length > 0 && (
        <>
          <GovCard title="Distribuição por Categoria (Turmas)" span={2}>
            <BarChart
              title=""
              description="Número de turmas por categoria de curso (top 15)"
              data={Object.entries(cursosPorCategoria)
                .map(([categoria, dados]) => ({
                  categoria,
                  total: dados.total,
                }))
                .sort((a, b) => b.total - a.total)
                .slice(0, 15)}
              xKey="categoria"
              yKeys={[
                {
                  key: 'total',
                  name: 'Turmas',
                  color: '#005ea2',
                },
              ]}
              module="lab"
              height={300}
            />
          </GovCard>
          <GovCard title="Distribuição por Categoria (Inscrições)" span={2}>
            <PieChart
              title=""
              description="Inscrições distribuídas por categoria"
              data={inscricoesPorCursoNormalizado.reduce((acc, curso) => {
                const existing = acc.find((c) => c.name === curso.categoria)
                if (existing) {
                  existing.value += curso.total
                } else {
                  acc.push({ name: curso.categoria, value: curso.total })
                }
                return acc
              }, [] as Array<{ name: string; value: number }>)
                .sort((a, b) => b.value - a.value)}
              module="lab"
              height={300}
            />
          </GovCard>
        </>
      )}

      {/* Comparativo: Ocupados vs Livres */}
      <GovCard title="Slots Ocupados vs Livres" span={2}>
        <BarChart
          title=""
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
              color: '#005ea2',
            },
          ]}
          module="lab"
          height={280}
        />
      </GovCard>
      {stats.inscricoesPorStatus.length > 0 && (
        <GovCard title="Inscrições por Status" span={2}>
          <PieChart
            title=""
            description="Distribuição de inscrições por status"
            data={stats.inscricoesPorStatus.map((item) => ({
              name: item.status,
              value: item.total,
            }))}
            module="lab"
            height={280}
          />
        </GovCard>
      )}

      {/* Alunos Certificados do Lab - DADO MAIS VALIOSO */}
      {alunosCertificadosLab && alunosCertificadosLab.length > 0 && (
        <GovCard title="Alunos Certificados do Lab (Dado mais valioso)" span={4} className="border-l-4 border-primary-vivid">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
                    Aluno
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
                    Contatos
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
                    Curso Normalizado
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
                    Laboratório
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
                    Município
                  </th>
                  <th className="text-right p-3 text-sm font-semibold text-muted-foreground">
                    Data de Conclusão
                  </th>
                </tr>
              </thead>
              <tbody>
                {alunosCertificadosLab.map((aluno) => (
                  <tr
                    key={aluno.id || `certificado-${aluno.aluno}`}
                    className="border-b hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-3 font-medium">{aluno.aluno}</td>
                    <td className="p-3 text-sm">
                      <div className="space-y-1">
                        {aluno.email && (
                          <a
                            href={`mailto:${aluno.email}`}
                            className="text-blue-600 hover:underline flex items-center gap-1"
                            title={aluno.email}
                          >
                            📧 {aluno.email.length > 25 ? `${aluno.email.substring(0, 25)}...` : aluno.email}
                          </a>
                        )}
                        {aluno.telefone && (
                          <a
                            href={`tel:${aluno.telefone.replace(/\D/g, '')}`}
                            className="text-green-600 hover:underline flex items-center gap-1"
                            title={aluno.telefone}
                          >
                            📱 {aluno.telefone}
                          </a>
                        )}
                        {!aluno.email && !aluno.telefone && (
                          <span className="text-xs text-muted-foreground">Sem contato</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div>
                        <span className="font-medium">{aluno.cursoNormalizado}</span>
                        {aluno.curso !== aluno.cursoNormalizado && (
                          <span className="text-xs text-muted-foreground block">
                            ({aluno.curso})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">{aluno.laboratorio}</td>
                    <td className="p-3 text-muted-foreground">{aluno.municipio}</td>
                    <td className="p-3 text-right text-sm">
                      {formatDate(new Date(aluno.dataConclusao))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Total: <span className="font-bold kpi-number-primary">{alunosCertificadosLab.length}</span> aluno(s) certificado(s)
            </p>
          </div>
        </GovCard>
      )}

      {/* Tabela de Inscrições */}
      <GovCard title="Lista de Inscrições" span={4}>
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
              {inscricoes.slice(0, 100).map((insc) => (
                <tr
                  key={insc.id}
                  className="border-b hover:bg-muted/50 transition-colors"
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GovCard>
    </div>
  )
}
