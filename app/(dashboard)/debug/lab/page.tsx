'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AlertTriangle,
  AlertOctagon,
  RefreshCw,
  Download,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { formatNumber } from '@/lib/formatters'
import { motion } from 'framer-motion'

interface LabDebugInfo {
  turmasComProblemas: Array<{
    id: number
    titulo: string
    laboratorio: string
    vagasTotal: number
    vagasOcupadas: number
    vagasDisponiveis: number
    totalInscricoes: number
    inscricoesPorStatus: Record<string, number>
    inscricoesDetalhadas: Array<{
      id: number
      alunoId: number
      alunoName: string
      status: string
      created_at: Date
    }>
    problema: string
  }>
  inscricoesDuplicadas: Array<{
    alunoId: number
    alunoName: string
    turmaId: number
    turmaTitulo: string
    quantidade: number
    inscricoesIds: number[]
    status: string[]
  }>
  estatisticas: {
    totalTurmas: number
    turmasComVagasInvalidas: number
    turmasComInscricoesExcedentes: number
    totalInscricoes: number
    inscricoesFinalizadas: number
    inscricoesAtivas: number
    inscricoesDuplicadas: number
  }
}

export default function LabDebugPage() {
  const [data, setData] = useState<LabDebugInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDebugInfo = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/debug/lab', {
        credentials: 'include',
      })
      const json = await response.json()
      if (!response.ok || json.error) {
        throw new Error(json.error || 'Erro ao buscar dados')
      }
      setData(json.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    if (!data) return

    const csvRows: string[] = []
    
    // Header
    csvRows.push('Turma ID,Título,Laboratório,Vagas Total,Vagas Ocupadas,Vagas Disponíveis,Total Inscrições,Problema')
    
    // Dados das turmas
    data.turmasComProblemas.forEach(turma => {
      csvRows.push(
        `${turma.id},"${turma.titulo}","${turma.laboratorio}",${turma.vagasTotal},${turma.vagasOcupadas},${turma.vagasDisponiveis},${turma.totalInscricoes},"${turma.problema}"`
      )
    })
    
    const csv = csvRows.join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lab-debug-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!data && !loading && !error) {
    fetchDebugInfo()
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Debug Lab - Análise Detalhada</h1>
            <p className="text-lg text-muted-foreground">
              Investigação detalhada das inconsistências identificadas na auditoria
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={fetchDebugInfo}
              disabled={loading}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            {data && (
              <Button onClick={exportToCSV} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar CSV
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {loading && (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Analisando inconsistências...</p>
          </div>
        </div>
      )}

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-destructive font-semibold">Erro ao carregar dados</p>
              <p className="text-sm text-muted-foreground mt-2">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {data && (
        <>
          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-soft" style={{ borderRadius: '22px' }}>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Turmas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatNumber(data.estatisticas.totalTurmas)}</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-soft border-red-200" style={{ borderRadius: '22px' }}>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <AlertOctagon className="h-4 w-4 text-red-500" />
                  Turmas com Vagas Inválidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-500">
                  {formatNumber(data.estatisticas.turmasComVagasInvalidas)}
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-soft border-orange-200" style={{ borderRadius: '22px' }}>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Turmas com Inscrições Excedentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-500">
                  {formatNumber(data.estatisticas.turmasComInscricoesExcedentes)}
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-soft" style={{ borderRadius: '22px' }}>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Inscrições
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatNumber(data.estatisticas.totalInscricoes)}</div>
                <div className="text-sm text-muted-foreground mt-2">
                  {formatNumber(data.estatisticas.inscricoesAtivas)} ativas • {formatNumber(data.estatisticas.inscricoesFinalizadas)} finalizadas
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Turmas com Problemas */}
          <Card className="border-0 shadow-soft" style={{ borderRadius: '22px' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertOctagon className="h-5 w-5 text-red-500" />
                Turmas com Problemas ({data.turmasComProblemas.length})
              </CardTitle>
              <CardDescription>
                Lista detalhada de todas as turmas com inconsistências
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {data.turmasComProblemas.map((turma, index) => {
                  const temVagasInvalidas = turma.vagasOcupadas > turma.vagasTotal || turma.vagasOcupadas + turma.vagasDisponiveis !== turma.vagasTotal
                  const temInscricoesExcedentes = turma.totalInscricoes > turma.vagasTotal

                  return (
                    <motion.div
                      key={turma.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border rounded-xl p-4 hover:shadow-soft transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">Turma #{turma.id}: {turma.titulo}</h3>
                            <Badge variant="outline">{turma.laboratorio}</Badge>
                            {temVagasInvalidas && (
                              <Badge className="bg-red-500 text-white">
                                <AlertOctagon className="h-3 w-3 mr-1" />
                                Vagas Inválidas
                              </Badge>
                            )}
                            {temInscricoesExcedentes && (
                              <Badge className="bg-orange-500 text-white">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Inscrições Excedentes
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{turma.problema}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Vagas Total</p>
                          <p className="text-lg font-semibold">{turma.vagasTotal}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Vagas Ocupadas</p>
                          <p className={`text-lg font-semibold ${turma.vagasOcupadas > turma.vagasTotal ? 'text-red-500' : ''}`}>
                            {turma.vagasOcupadas}
                            {turma.vagasOcupadas > turma.vagasTotal && <XCircle className="inline h-4 w-4 ml-1" />}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Vagas Disponíveis</p>
                          <p className="text-lg font-semibold">{turma.vagasDisponiveis}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total Inscrições</p>
                          <p className={`text-lg font-semibold ${turma.totalInscricoes > turma.vagasTotal ? 'text-orange-500' : ''}`}>
                            {turma.totalInscricoes}
                            {turma.totalInscricoes > turma.vagasTotal && <AlertTriangle className="inline h-4 w-4 ml-1" />}
                          </p>
                        </div>
                      </div>

                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-xs font-semibold mb-2">Inscrições por Status:</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(turma.inscricoesPorStatus).map(([status, count]) => (
                            <Badge key={status} variant="outline">
                              {status}: {count}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Inscrições Duplicadas */}
          {data.inscricoesDuplicadas.length > 0 && (
            <Card className="border-0 shadow-soft" style={{ borderRadius: '22px' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Inscrições Duplicadas ({data.inscricoesDuplicadas.length})
                </CardTitle>
                <CardDescription>
                  Alunos com múltiplas inscrições na mesma turma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.inscricoesDuplicadas.map((dup, index) => (
                    <motion.div
                      key={`${dup.alunoId}-${dup.turmaId}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{dup.alunoName}</p>
                          <p className="text-sm text-muted-foreground">Turma: {dup.turmaTitulo}</p>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-orange-500 text-white">
                            {dup.quantidade} inscrições
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            IDs: {dup.inscricoesIds.join(', ')}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

