'use client'

import { useLabDetalhado } from '@/lib/queries/bi-lab'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { KPICard } from '@/components/dashboard/kpi-card'
import { BarChart } from '@/components/charts/bar-chart'
import { LineChart } from '@/components/charts/line-chart'
import { PieChart } from '@/components/charts/pie-chart'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  Users, 
  Award, 
  MapPin, 
  AlertTriangle,
  Building2,
  BookOpen,
  Target,
  TrendingDown,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { formatNumber, formatPercent, formatDate } from '@/lib/formatters'

export default function BILabPage() {
  const { data, isLoading, error } = useLabDetalhado()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lab-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando análise detalhada do Lab...</p>
        </div>
      </div>
    )
  }

  if (error) {
    const isUnauthorized = error.message?.includes('Unauthorized') || error.message?.includes('401')
    
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-destructive font-semibold">
                {isUnauthorized ? 'Erro de Autenticação' : 'Erro ao carregar dados'}
              </p>
              <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
              {isUnauthorized && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Você precisa estar logado para acessar esta página.
                  </p>
                  <a 
                    href="/login" 
                    className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
                  >
                    Fazer Login
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Nenhum dado disponível</p>
      </div>
    )
  }

  const {
    resumo,
    porLaboratorio,
    porCurso,
    alunosCertificados,
    evasao,
    desempenho,
    tendencias,
    alertas,
  } = data

  // Preparar dados para gráficos
  const top10Laboratorios = porLaboratorio.slice(0, 10).map((lab) => ({
    laboratorio: lab.nome,
    certificacao: lab.taxaCertificacao,
    evasao: lab.taxaEvasao,
    ocupacao: lab.taxaOcupacao,
  }))

  const top10Cursos = porCurso.slice(0, 10).map((curso) => ({
    curso: curso.cursoNormalizado,
    inscricoes: curso.totalInscricoes,
    certificados: curso.totalCertificados,
    evasao: curso.taxaEvasao,
  }))

  const evasaoPorLab = evasao.porLaboratorio.slice(0, 10).map((e) => ({
    laboratorio: e.laboratorio,
    taxa: e.taxaEvasao,
    total: e.totalEvasao,
  }))

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2" style={{ color: '#FF6A00' }}>
          Análise Detalhada - OxeTech Lab
        </h1>
        <p className="text-muted-foreground">
          Métricas avançadas e insights estratégicos do programa Lab
        </p>
      </div>

      {/* Alertas Críticos */}
      {alertas.length > 0 && (
        <Card className="border-destructive border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Alertas Críticos ({alertas.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {alertas.map((alerta, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-3 rounded-lg border ${
                    alerta.severidade === 'alta' 
                      ? 'bg-destructive/10 border-destructive/30' 
                      : alerta.severidade === 'media'
                      ? 'bg-yellow-500/10 border-yellow-500/30'
                      : 'bg-blue-500/10 border-blue-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-semibold text-sm">{alerta.titulo}</p>
                    <Badge 
                      variant={alerta.severidade === 'alta' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {alerta.severidade}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{alerta.descricao}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total de Certificados"
          value={formatNumber(resumo.totalCertificados)}
          icon={Award}
          delay={0}
          description="Alunos certificados de fato (status TWO)"
          module="lab"
        />
        <KPICard
          title="Taxa de Certificação"
          value={`${resumo.taxaCertificacaoGeral.toFixed(1)}%`}
          icon={TrendingUp}
          delay={100}
          description="Taxa geral de certificação"
          module="lab"
        />
        <KPICard
          title="Taxa de Evasão"
          value={`${resumo.taxaEvasaoGeral.toFixed(1)}%`}
          icon={TrendingDown}
          delay={200}
          description="Taxa geral de evasão"
          module="lab"
        />
        <KPICard
          title="Taxa de Ocupação"
          value={`${resumo.taxaOcupacaoGeral.toFixed(1)}%`}
          icon={Building2}
          delay={300}
          description="Vagas ocupadas / vagas total"
          module="lab"
        />
      </div>

      {/* Desempenho por Laboratório */}
      <Card className="border-0 shadow-soft" style={{ borderRadius: '22px' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-lab-primary" />
            Desempenho por Laboratório
          </CardTitle>
          <CardDescription>
            Ranking dos laboratórios por performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-sm font-semibold">Rank</th>
                  <th className="text-left p-3 text-sm font-semibold">Laboratório</th>
                  <th className="text-left p-3 text-sm font-semibold">Município</th>
                  <th className="text-right p-3 text-sm font-semibold">Certificados</th>
                  <th className="text-right p-3 text-sm font-semibold">Taxa Certificação</th>
                  <th className="text-right p-3 text-sm font-semibold">Taxa Evasão</th>
                  <th className="text-right p-3 text-sm font-semibold">Taxa Ocupação</th>
                  <th className="text-right p-3 text-sm font-semibold">Cursos</th>
                </tr>
              </thead>
              <tbody>
                {porLaboratorio.slice(0, 20).map((lab, index) => (
                  <motion.tr
                    key={lab.laboratorioId}
                    className="border-b hover:bg-muted/50 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <td className="p-3">
                      <Badge variant={lab.ranking <= 3 ? 'default' : 'outline'}>
                        {lab.ranking}º
                      </Badge>
                    </td>
                    <td className="p-3 font-medium">{lab.nome}</td>
                    <td className="p-3 text-muted-foreground">{lab.municipio}</td>
                    <td className="p-3 text-right font-semibold text-lab-primary">
                      {formatNumber(lab.totalCertificados)}
                    </td>
                    <td className="p-3 text-right">
                      <span className={lab.taxaCertificacao >= 50 ? 'text-green-600' : lab.taxaCertificacao >= 30 ? 'text-yellow-600' : 'text-red-600'}>
                        {lab.taxaCertificacao.toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span className={lab.taxaEvasao <= 15 ? 'text-green-600' : lab.taxaEvasao <= 30 ? 'text-yellow-600' : 'text-red-600'}>
                        {lab.taxaEvasao.toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span className={lab.taxaOcupacao >= 70 ? 'text-green-600' : lab.taxaOcupacao >= 50 ? 'text-yellow-600' : 'text-red-600'}>
                        {lab.taxaOcupacao.toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-3 text-right">{formatNumber(lab.cursosOferecidos)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {top10Laboratorios.length > 0 && (
          <BarChart
            data={top10Laboratorios}
            xKey="laboratorio"
            yKeys={[
              { key: 'certificacao', name: 'Taxa Certificação (%)' },
              { key: 'evasao', name: 'Taxa Evasão (%)' },
            ]}
            title="Top 10 Laboratórios - Certificação vs Evasão"
            description="Comparativo de performance"
            height={400}
          />
        )}

        {evasaoPorLab.length > 0 && (
          <BarChart
            data={evasaoPorLab}
            xKey="laboratorio"
            yKeys={[{ key: 'taxa', name: 'Taxa de Evasão (%)' }]}
            title="Top 10 Laboratórios com Maior Evasão"
            description="Requerem atenção imediata"
            height={400}
          />
        )}
      </div>

      {/* Análise por Curso */}
      <Card className="border-0 shadow-soft" style={{ borderRadius: '22px' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-lab-primary" />
            Desempenho por Curso
          </CardTitle>
          <CardDescription>
            Métricas detalhadas por curso normalizado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-sm font-semibold">Curso</th>
                  <th className="text-left p-3 text-sm font-semibold">Categoria</th>
                  <th className="text-right p-3 text-sm font-semibold">Turmas</th>
                  <th className="text-right p-3 text-sm font-semibold">Inscrições</th>
                  <th className="text-right p-3 text-sm font-semibold">Certificados</th>
                  <th className="text-right p-3 text-sm font-semibold">Taxa Certificação</th>
                  <th className="text-right p-3 text-sm font-semibold">Taxa Evasão</th>
                </tr>
              </thead>
              <tbody>
                {porCurso.slice(0, 20).map((curso, index) => (
                  <motion.tr
                    key={curso.cursoNormalizado}
                    className="border-b hover:bg-muted/50 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <td className="p-3 font-medium">{curso.cursoNormalizado}</td>
                    <td className="p-3 text-muted-foreground">
                      <Badge variant="outline">{curso.categoria}</Badge>
                    </td>
                    <td className="p-3 text-right">{formatNumber(curso.totalTurmas)}</td>
                    <td className="p-3 text-right">{formatNumber(curso.totalInscricoes)}</td>
                    <td className="p-3 text-right font-semibold text-lab-primary">
                      {formatNumber(curso.totalCertificados)}
                    </td>
                    <td className="p-3 text-right">
                      <span className={curso.taxaCertificacao >= 50 ? 'text-green-600' : curso.taxaCertificacao >= 30 ? 'text-yellow-600' : 'text-red-600'}>
                        {curso.taxaCertificacao.toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span className={curso.taxaEvasao <= 15 ? 'text-green-600' : curso.taxaEvasao <= 30 ? 'text-yellow-600' : 'text-red-600'}>
                        {curso.taxaEvasao.toFixed(1)}%
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Alunos Certificados de Fato */}
      <Card className="border-0 shadow-soft" style={{ borderRadius: '22px' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-lab-primary" />
            Alunos Certificados de Fato ({formatNumber(alunosCertificados.length)})
          </CardTitle>
          <CardDescription>
            Lista completa de alunos que concluíram os cursos (status TWO)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-sm font-semibold">Aluno</th>
                  <th className="text-left p-3 text-sm font-semibold">Email</th>
                  <th className="text-left p-3 text-sm font-semibold">Telefone</th>
                  <th className="text-left p-3 text-sm font-semibold">Município</th>
                  <th className="text-left p-3 text-sm font-semibold">Curso</th>
                  <th className="text-left p-3 text-sm font-semibold">Laboratório</th>
                  <th className="text-left p-3 text-sm font-semibold">Data Conclusão</th>
                  <th className="text-right p-3 text-sm font-semibold">Tempo (dias)</th>
                </tr>
              </thead>
              <tbody>
                {alunosCertificados.slice(0, 50).map((aluno, index) => (
                  <motion.tr
                    key={aluno.alunoId || `aluno-${index}`}
                    className="border-b hover:bg-muted/50 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.01 }}
                  >
                    <td className="p-3 font-medium">{aluno.nome}</td>
                    <td className="p-3 text-muted-foreground">
                      {aluno.email ? (
                        <a href={`mailto:${aluno.email}`} className="hover:underline text-blue-600">
                          {aluno.email}
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {aluno.telefone ? (
                        <a href={`tel:${aluno.telefone}`} className="hover:underline text-blue-600">
                          {aluno.telefone}
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="p-3 text-muted-foreground">{aluno.municipio}</td>
                    <td className="p-3">{aluno.cursoNormalizado}</td>
                    <td className="p-3 text-muted-foreground">{aluno.laboratorio}</td>
                    <td className="p-3 text-muted-foreground text-sm">
                      {formatDate(aluno.dataConclusao)}
                    </td>
                    <td className="p-3 text-right text-sm">{formatNumber(aluno.tempoConclusao)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {alunosCertificados.length > 50 && (
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Mostrando 50 de {formatNumber(alunosCertificados.length)} alunos certificados
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top 10 Laboratórios */}
      {desempenho.laboratoriosTop10.length > 0 && (
        <Card className="border-0 shadow-soft" style={{ borderRadius: '22px' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-lab-primary" />
              Top 10 Laboratórios - Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {desempenho.laboratoriosTop10.map((lab, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-lg border bg-gradient-to-br from-lab-primary/5 to-transparent"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="default" className="text-xs">
                      {index + 1}º
                    </Badge>
                    <span className="text-xs font-semibold">Score: {lab.score.toFixed(0)}</span>
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{lab.laboratorio}</h4>
                  <p className="text-xs text-muted-foreground mb-3">{lab.municipio}</p>
                  <div className="space-y-1 text-xs">
                    <p>Certificação: <span className="font-bold">{lab.criterios.taxaCertificacao.toFixed(1)}%</span></p>
                    <p>Ocupação: <span className="font-bold">{lab.criterios.taxaOcupacao.toFixed(1)}%</span></p>
                    <p>Certificados: <span className="font-bold">{formatNumber(lab.criterios.totalCertificados)}</span></p>
                    <p>Cursos: <span className="font-bold">{formatNumber(lab.criterios.diversidadeCursos)}</span></p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

