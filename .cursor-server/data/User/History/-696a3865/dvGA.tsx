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
  Award,
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
        alunosCertificadosLab = [],
        totalCertificadosLab = 0,
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
        <h1 className="text-4xl font-bold mb-2 text-primary-vivid">
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
            <KPICard
              title="Total de Turmas"
              value={formatNumber(stats.totalTurmas || 0)}
              icon={Calendar}
              module="lab"
              delay={300}
            />
            <KPICard
              title="Alunos Certificados"
              value={formatNumber(totalCertificadosLab)}
              icon={Award}
              module="lab"
              delay={350}
              description="Alunos que concluíram cursos no Lab (dado mais valioso)"
            />
          </div>

      {/* Card de Explicação dos Dados */}
      <Card
        className="border-0 shadow-soft bg-primary/5 border-l-4 border-primary-vivid"
        style={{ borderRadius: '22px' }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary-vivid">
            <TrendingUp className="h-5 w-5" />
            Explicação dos Dados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
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
        </CardContent>
      </Card>

      {/* Cards de Resumo */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card
          className="border-0 shadow-soft"
          style={{ borderRadius: '22px' }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary-vivid" />
              Slots de Vagas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Ocupadas</span>
              <span className="text-xl font-bold text-primary-vivid">
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
              <span className="text-2xl font-bold text-primary-vivid">
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
              <FlaskConical className="h-5 w-5 text-primary-vivid" />
              Status das Inscrições
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Ativas</span>
              <span className="text-xl font-bold text-primary-vivid">
                {stats.inscricoesAtivas}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Finalizadas</span>
              <span className="text-xl font-bold text-success">
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
              <MapPin className="h-5 w-5 text-primary-vivid" />
              Laboratórios Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary-vivid mb-2">
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
                color: '#005ea2', // USWDS Primary
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
                color: '#005ea2', // USWDS Primary
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
                color: '#1a4480', // USWDS Primary Base
              },
            ]}
            module="lab"
            height={350}
          />
        )}
      </div>

      {/* Análise por Curso Normalizado */}
      {inscricoesPorCursoNormalizado.length > 0 && (
        <Card
          className="border-0 shadow-soft overflow-hidden"
          style={{ borderRadius: '22px' }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-lab-primary" />
              Análise por Curso Normalizado (Inscrições)
            </CardTitle>
            <CardDescription>
              Cursos padronizados e categorizados com total de inscrições
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                  {inscricoesPorCursoNormalizado.slice(0, 30).map((curso, index) => (
                    <motion.tr
                      key={curso.nomeOriginal}
                      className="border-b hover:bg-muted/50 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                    >
                      <td className="p-3 font-medium">{curso.nomeNormalizado}</td>
                      <td className="p-3 text-muted-foreground">{curso.categoria}</td>
                      <td className="p-3 text-muted-foreground">
                        {curso.subcategoria || '-'}
                      </td>
                      <td className="p-3 text-right font-bold">{curso.total}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Análise Detalhada por Curso (com Vagas) */}
      {analisePorCurso.length > 0 && (
        <Card
          className="border-0 shadow-soft overflow-hidden"
          style={{ borderRadius: '22px' }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-lab-primary" />
              Análise Detalhada por Curso (Vagas e Inscrições)
            </CardTitle>
            <CardDescription>
              Visão completa dos cursos com turmas, vagas e inscrições
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                  {analisePorCurso.slice(0, 50).map((curso, index) => (
                    <motion.tr
                      key={curso.nomeOriginal}
                      className="border-b hover:bg-muted/50 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.01 }}
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
                      <td className="p-3 text-right font-medium text-lab-primary">
                        {formatNumber(curso.vagasOcupadas)}
                      </td>
                      <td className="p-3 text-right text-green-600">
                        {formatNumber(curso.vagasLivres)}
                      </td>
                      <td className="p-3 text-right">
                        <span
                          className={cn(
                            'font-bold',
                            curso.taxaOcupacao >= 80
                              ? 'text-red-600'
                              : curso.taxaOcupacao >= 50
                              ? 'text-yellow-600'
                              : 'text-green-600'
                          )}
                        >
                          {formatPercent(curso.taxaOcupacao)}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Distribuição por Categoria */}
      {Object.keys(cursosPorCategoria).length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          <BarChart
            title="Distribuição por Categoria (Turmas)"
            description="Número de turmas por categoria de curso"
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
                color: '#FF6A00',
              },
            ]}
            module="lab"
            height={350}
          />
          <PieChart
            title="Distribuição por Categoria (Inscrições)"
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
            height={350}
          />
        </div>
      )}

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

      {/* Alunos Certificados do Lab - DADO MAIS VALIOSO */}
      {alunosCertificadosLab && alunosCertificadosLab.length > 0 && (
        <Card
          className="border-0 shadow-soft overflow-hidden border-l-4"
          style={{ borderRadius: '22px', borderLeftColor: '#FF6A00' }}
        >
          <CardHeader className="bg-gradient-to-r from-lab-primary/10 to-transparent">
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-lab-primary" />
              Alunos Certificados do Lab
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                (Dado mais valioso)
              </span>
            </CardTitle>
            <CardDescription>
              Lista completa dos alunos que concluíram cursos presenciais nos laboratórios
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
                  {alunosCertificadosLab.map((aluno, index) => (
                    <motion.tr
                      key={aluno.id || `certificado-${index}`}
                      className="border-b hover:bg-muted/50 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
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
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Total: <span className="font-bold text-lab-primary">{alunosCertificadosLab.length}</span> aluno(s) certificado(s)
              </p>
            </div>
          </CardContent>
        </Card>
      )}

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
