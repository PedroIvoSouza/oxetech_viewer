'use client'

import { useAudit } from '@/lib/queries/audit'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { KPICard } from '@/components/dashboard/kpi-card'
import {
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  TrendingDown,
  AlertOctagon,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { formatNumber, formatPercent } from '@/lib/formatters'

export default function AuditPage() {
  const { data, isLoading, error } = useAudit()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Gerando auditoria completa do banco de dados...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-destructive font-semibold">Erro ao carregar auditoria</p>
              <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
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

  const { resumo, findings, estatisticas, alertasCriticos, recomendacoesPrioritarias } = data

  const getSeverityIcon = (severidade: string) => {
    switch (severidade) {
      case 'critica':
        return AlertOctagon
      case 'alta':
        return AlertTriangle
      case 'media':
        return AlertCircle
      case 'baixa':
        return Info
      default:
        return Info
    }
  }

  const getSeverityColor = (severidade: string) => {
    switch (severidade) {
      case 'critica':
        return 'bg-red-500 text-white'
      case 'alta':
        return 'bg-orange-500 text-white'
      case 'media':
        return 'bg-yellow-500 text-white'
      case 'baixa':
        return 'bg-blue-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'inconsistencia':
        return 'bg-red-100 text-red-800'
      case 'anomalia':
        return 'bg-orange-100 text-orange-800'
      case 'duplicacao':
        return 'bg-purple-100 text-purple-800'
      case 'integridade':
        return 'bg-blue-100 text-blue-800'
      case 'qualidade':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2">Auditoria Completa do Banco de Dados</h1>
        <p className="text-lg text-muted-foreground">
          Análise inteligente de inconsistências, anomalias e problemas de qualidade nos dados
        </p>
      </motion.div>

      {/* Alertas Críticos */}
      {alertasCriticos.length > 0 && (
        <Card className="border-red-500 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-500">
              <AlertOctagon className="h-5 w-5" />
              Alertas Críticos ({alertasCriticos.length})
            </CardTitle>
            <CardDescription>
              Problemas críticos que requerem atenção imediata
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {alertasCriticos.map((alerta, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>{alerta}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <KPICard
          title="Total de Problemas"
          value={formatNumber(resumo.totalFindings)}
          icon={ShieldCheck}
          delay={0}
          description="Total de inconsistências encontradas"
        />
        <KPICard
          title="Críticos"
          value={formatNumber(resumo.criticos)}
          icon={AlertOctagon}
          delay={100}
          description="Problemas críticos"
        />
        <KPICard
          title="Alta Severidade"
          value={formatNumber(resumo.altos)}
          icon={AlertTriangle}
          delay={200}
          description="Problemas de alta severidade"
        />
        <KPICard
          title="Média Severidade"
          value={formatNumber(resumo.medios)}
          icon={AlertCircle}
          delay={300}
          description="Problemas de média severidade"
        />
        <KPICard
          title="Baixa Severidade"
          value={formatNumber(resumo.baixos)}
          icon={Info}
          delay={400}
          description="Problemas de baixa severidade"
        />
      </div>

      {/* Estatísticas por Módulo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-soft" style={{ borderRadius: '22px' }}>
          <CardHeader>
            <CardTitle className="text-lg">Lab</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Turmas:</span>
              <span className="font-semibold">{formatNumber(estatisticas.lab.totalTurmas)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Inscrições:</span>
              <span className="font-semibold">{formatNumber(estatisticas.lab.totalInscricoes)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Certificados:</span>
              <span className="font-semibold">{formatNumber(estatisticas.lab.totalCertificados)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Taxa Certificação:</span>
              <span className="font-semibold">{formatPercent(estatisticas.lab.taxaCertificacao)}</span>
            </div>
            {estatisticas.lab.inconsistencias.length > 0 && (
              <div className="mt-2 pt-2 border-t">
                <p className="text-xs text-red-500 font-semibold mb-1">Inconsistências:</p>
                {estatisticas.lab.inconsistencias.map((inc, idx) => (
                  <p key={idx} className="text-xs text-red-500">• {inc}</p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-soft" style={{ borderRadius: '22px' }}>
          <CardHeader>
            <CardTitle className="text-lg">Work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Empresas:</span>
              <span className="font-semibold">{formatNumber(estatisticas.work.totalEmpresas)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Vagas:</span>
              <span className="font-semibold">{formatNumber(estatisticas.work.totalVagas)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Candidaturas:</span>
              <span className="font-semibold">{formatNumber(estatisticas.work.totalCandidaturas)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Contratações:</span>
              <span className="font-semibold">{formatNumber(estatisticas.work.totalContratacoes)}</span>
            </div>
            {estatisticas.work.inconsistencias.length > 0 && (
              <div className="mt-2 pt-2 border-t">
                <p className="text-xs text-red-500 font-semibold mb-1">Inconsistências:</p>
                {estatisticas.work.inconsistencias.map((inc, idx) => (
                  <p key={idx} className="text-xs text-red-500">• {inc}</p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-soft" style={{ borderRadius: '22px' }}>
          <CardHeader>
            <CardTitle className="text-lg">Edu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Escolas:</span>
              <span className="font-semibold">{formatNumber(estatisticas.edu.totalEscolas)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Matrículas:</span>
              <span className="font-semibold">{formatNumber(estatisticas.edu.totalMatriculas)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Turmas:</span>
              <span className="font-semibold">{formatNumber(estatisticas.edu.totalTurmas)}</span>
            </div>
            {estatisticas.edu.inconsistencias.length > 0 && (
              <div className="mt-2 pt-2 border-t">
                <p className="text-xs text-red-500 font-semibold mb-1">Inconsistências:</p>
                {estatisticas.edu.inconsistencias.map((inc, idx) => (
                  <p key={idx} className="text-xs text-red-500">• {inc}</p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-soft" style={{ borderRadius: '22px' }}>
          <CardHeader>
            <CardTitle className="text-lg">Trilhas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Trilhas:</span>
              <span className="font-semibold">{formatNumber(estatisticas.trilhas.totalTrilhas)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Inscrições:</span>
              <span className="font-semibold">{formatNumber(estatisticas.trilhas.totalInscricoes)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Concluídos:</span>
              <span className="font-semibold">{formatNumber(estatisticas.trilhas.totalConcluidos)}</span>
            </div>
            {estatisticas.trilhas.inconsistencias.length > 0 && (
              <div className="mt-2 pt-2 border-t">
                <p className="text-xs text-red-500 font-semibold mb-1">Inconsistências:</p>
                {estatisticas.trilhas.inconsistencias.map((inc, idx) => (
                  <p key={idx} className="text-xs text-red-500">• {inc}</p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recomendações Prioritárias */}
      {recomendacoesPrioritarias.length > 0 && (
        <Card className="border-0 shadow-soft" style={{ borderRadius: '22px' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Recomendações Prioritárias
            </CardTitle>
            <CardDescription>
              Ações recomendadas para corrigir os problemas identificados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {recomendacoesPrioritarias.map((recomendacao, index) => (
                <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <span className="text-green-500 mt-1">{index + 1}.</span>
                  <span>{recomendacao}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Lista de Findings */}
      <Card className="border-0 shadow-soft" style={{ borderRadius: '22px' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Detalhamento dos Problemas Encontrados
          </CardTitle>
          <CardDescription>
            Lista completa de inconsistências, anomalias e problemas de qualidade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {findings.map((finding, index) => {
              const SeverityIcon = getSeverityIcon(finding.severidade)
              
              return (
                <motion.div
                  key={finding.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border rounded-xl p-4 hover:shadow-soft transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <SeverityIcon className={`h-5 w-5 ${getSeverityColor(finding.severidade).split(' ')[0]}`} />
                        <h3 className="font-semibold text-lg">{finding.titulo}</h3>
                        <Badge className={getSeverityColor(finding.severidade)}>
                          {finding.severidade.toUpperCase()}
                        </Badge>
                        <Badge className={getTipoColor(finding.tipo)}>
                          {finding.tipo.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">{finding.modulo}</Badge>
                      </div>
                      <p className="text-muted-foreground mb-2">{finding.descricao}</p>
                      <div className="bg-muted/50 rounded-lg p-3 mb-2">
                        <p className="text-sm font-semibold mb-1">Recomendação:</p>
                        <p className="text-sm">{finding.recomendacao}</p>
                      </div>
                      {finding.ocorrencias > 1 && (
                        <p className="text-xs text-muted-foreground">
                          {finding.ocorrencias} ocorrência(s) encontrada(s)
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

