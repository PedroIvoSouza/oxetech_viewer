'use client'

import { useAnaliseCompleta } from '@/lib/queries/bi'
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
  Building2, 
  Target,
  AlertTriangle,
  Lightbulb,
  DollarSign
} from 'lucide-react'
import { motion } from 'framer-motion'
import { formatNumber } from '@/lib/formatters'

export default function BIPage() {
  const { data, isLoading, error } = useAnaliseCompleta()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando análise de BI...</p>
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
                {isUnauthorized ? 'Erro de Autenticação' : 'Erro ao carregar dados de BI'}
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
    impactoSocial,
    eficaciaProgramas,
    tendenciasProjecoes,
    desempenhoTerritorial,
    oportunidadesGaps,
    roiEficiencia,
    resumoExecutivo,
  } = data

  // Preparar dados para gráficos
  const distribuicaoEixos = [
    { name: 'Work', value: impactoSocial.distribuicaoPorEixo?.work?.total || 0 },
    { name: 'Edu', value: impactoSocial.distribuicaoPorEixo?.edu?.total || 0 },
    { name: 'Trilhas', value: impactoSocial.distribuicaoPorEixo?.trilhas?.total || 0 },
    { name: 'Lab', value: impactoSocial.distribuicaoPorEixo?.lab?.total || 0 },
  ].filter((item) => item.value > 0) // Filtrar eixos vazios

  const certificadosPorEixo = [
    { name: 'Work', value: impactoSocial.distribuicaoPorEixo?.work?.certificados || 0 },
    { name: 'Edu', value: impactoSocial.distribuicaoPorEixo?.edu?.certificados || 0 },
    { name: 'Trilhas', value: impactoSocial.distribuicaoPorEixo?.trilhas?.certificados || 0 },
    { name: 'Lab', value: impactoSocial.distribuicaoPorEixo?.lab?.certificados || 0 },
  ].filter((item) => item.value > 0) // Filtrar eixos vazios

  const crescimentoMensalData = (tendenciasProjecoes.crescimentoMensal || []).map((mes) => ({
    mes: mes.mes?.split(' ')[0] || mes.mes || 'N/A', // Apenas o mês
    inscricoes: mes.inscricoes || 0,
    certificados: mes.certificados || 0,
  }))

  const topMunicipios = (desempenhoTerritorial.municipiosRanking || []).slice(0, 10).map((m) => ({
    municipio: m.municipio || 'Não informado',
    alunos: m.totalAlunos || 0,
    certificados: m.totalCertificados || 0,
  }))

  const eficienciaEixos = (roiEficiencia.comparacaoEixos || []).map((e) => ({
    eixo: e.eixo || 'N/A',
    eficiencia: e.eficiencia || 0,
  }))

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Business Intelligence</h1>
        <p className="text-muted-foreground">
          Análises estratégicas e insights para tomada de decisão
        </p>
      </div>

      {/* Alertas Críticos */}
      {resumoExecutivo.alertasCriticos.length > 0 && (
        <Card className="border-destructive border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Alertas Críticos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {resumoExecutivo.alertasCriticos.map((alerta, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-destructive mt-1">•</span>
                  <span>{alerta}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total de Alunos Impactados"
          value={formatNumber(impactoSocial.totalAlunosImpactados)}
          icon={Users}
        />
        <KPICard
          title="Total de Certificados"
          value={formatNumber(impactoSocial.totalCertificados)}
          icon={Award}
        />
        <KPICard
          title="Taxa de Empregabilidade"
          value={`${(impactoSocial.taxaEmpregabilidade || 0).toFixed(1)}%`}
          icon={TrendingUp}
        />
        <KPICard
          title="Municípios Atendidos"
          value={formatNumber(impactoSocial.totalMunicipiosAtendidos)}
          icon={MapPin}
        />
      </div>

      {/* Resumo Executivo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-soft" style={{ borderRadius: '22px' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Principais Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {(resumoExecutivo.principaisInsights || []).map((insight, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-2"
                >
                  <span className="text-primary mt-1">•</span>
                  <span className="text-sm">{insight}</span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-soft" style={{ borderRadius: '22px' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Recomendações Prioritárias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {(resumoExecutivo.recomendacoesPrioritarias || []).slice(0, 5).map((rec, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-2"
                >
                  <Badge variant="outline" className="mt-0.5">
                    {index + 1}
                  </Badge>
                  <span className="text-sm">{rec}</span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart
          data={crescimentoMensalData}
          xKey="mes"
          yKeys={[
            { key: 'inscricoes', name: 'Inscrições' },
            { key: 'certificados', name: 'Certificados' },
          ]}
          title="Crescimento Mensal"
          description="Últimos 12 meses"
          height={350}
        />

        <PieChart
          data={distribuicaoEixos}
          title="Distribuição por Eixo"
          description="Total de participantes"
          height={350}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart
          data={topMunicipios}
          xKey="municipio"
          yKeys={[
            { key: 'alunos', name: 'Alunos' },
            { key: 'certificados', name: 'Certificados' },
          ]}
          title="Top 10 Municípios"
          description="Por número de alunos"
          height={400}
        />

        <BarChart
          data={eficienciaEixos}
          xKey="eixo"
          yKeys={[{ key: 'eficiencia', name: 'Eficiência (certificados/R$ 1000)' }]}
          title="Eficiência por Eixo"
          description="Certificados por R$ 1000 investido"
          height={350}
        />
      </div>

      {/* Eficácia dos Programas */}
      <Card className="border-0 shadow-soft" style={{ borderRadius: '22px' }}>
        <CardHeader>
          <CardTitle>Eficácia dos Programas</CardTitle>
          <CardDescription>Métricas de desempenho por eixo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-work-primary/10 border border-work-primary/20">
              <h4 className="font-semibold mb-2 text-work-primary">Work</h4>
              <div className="space-y-1 text-sm">
                <p>Conversão: <span className="font-bold">{eficaciaProgramas.work.taxaConversao.toFixed(1)}%</span></p>
                <p>Retenção 12M: <span className="font-bold">{eficaciaProgramas.work.taxaRetencao12Meses.toFixed(1)}%</span></p>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-edu-primary/10 border border-edu-primary/20">
              <h4 className="font-semibold mb-2 text-edu-primary">Edu</h4>
              <div className="space-y-1 text-sm">
                <p>Frequência: <span className="font-bold">{eficaciaProgramas.edu.taxaFrequencia.toFixed(1)}%</span></p>
                <p>Certificação: <span className="font-bold">{eficaciaProgramas.edu.taxaCertificacao.toFixed(1)}%</span></p>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-trilhas-primary/10 border border-trilhas-primary/20">
              <h4 className="font-semibold mb-2 text-trilhas-primary">Trilhas</h4>
              <div className="space-y-1 text-sm">
                <p>Conclusão: <span className="font-bold">{eficaciaProgramas.trilhas.taxaConclusao.toFixed(1)}%</span></p>
                <p>Tempo Médio: <span className="font-bold">{eficaciaProgramas.trilhas.tempoMedioConclusao.toFixed(0)} dias</span></p>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-lab-primary/10 border border-lab-primary/20">
              <h4 className="font-semibold mb-2 text-lab-primary">Lab</h4>
              <div className="space-y-1 text-sm">
                <p>Ocupação: <span className="font-bold">{eficaciaProgramas.lab.taxaOcupacao.toFixed(1)}%</span></p>
                <p>Certificação: <span className="font-bold">{eficaciaProgramas.lab.taxaCertificacao.toFixed(1)}%</span></p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Oportunidades */}
      {oportunidadesGaps.oportunidades.length > 0 && (
        <Card className="border-0 shadow-soft" style={{ borderRadius: '22px' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Oportunidades Identificadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(oportunidadesGaps.oportunidades || []).slice(0, 5).map((op, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-lg border"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{op.titulo}</h4>
                    <Badge variant={op.impacto === 'alto' ? 'default' : 'secondary'}>
                      {op.impacto}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{op.descricao}</p>
                  {op.municipiosAlvos.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground">
                        Municípios: {op.municipiosAlvos.join(', ')}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ROI */}
      <Card className="border-0 shadow-soft" style={{ borderRadius: '22px' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            ROI e Eficiência Orçamentária
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground mb-1">Orçamento Usado</p>
              <p className="text-2xl font-bold">{(roiEficiencia.eficienciaOrcamentaria?.orcamentoUsado || 0).toFixed(1)}%</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground mb-1">Orçamento Restante</p>
              <p className="text-2xl font-bold">{(roiEficiencia.eficienciaOrcamentaria?.orcamentoRestante || 0).toFixed(1)}%</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground mb-1">Custo Médio por Certificado</p>
              <p className="text-2xl font-bold">R$ {formatNumber(roiEficiencia.custoPorCertificado?.media || 0)}</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground mb-1">Meses Restantes</p>
              <p className="text-2xl font-bold">{roiEficiencia.eficienciaOrcamentaria?.mesesRestantes || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

