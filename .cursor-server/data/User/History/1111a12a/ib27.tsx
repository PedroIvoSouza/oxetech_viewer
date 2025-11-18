/**
 * Página de Dados Agregados do Lab
 * 
 * Mostra dados do CSV legado + banco de dados agregados,
 * SEM alterar o banco original.
 */

'use client'

import { useLabAgregado } from '@/lib/queries/lab-agregado'
import { formatNumber } from '@/lib/formatters'
import { Award, Users, BookOpen, TrendingDown, Database, FileText, RefreshCw } from 'lucide-react'
import { KPICard } from '@/components/dashboard/kpi-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function LabAgregadoPage() {
  const { data, isLoading, error, refetch } = useLabAgregado(false)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando dados agregados...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive">Erro ao carregar dados: {error.message}</p>
        </div>
      </div>
    )
  }

  const stats = data?.data?.estatisticas
  const turmas = data?.data?.turmas || []
  const porLaboratorio = data?.data?.porLaboratorio || []
  const porCurso = data?.data?.porCurso || []

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lab - Dados Agregados</h1>
          <p className="text-muted-foreground mt-2">
            Dados do CSV legado + banco de dados (banco original não é alterado)
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI
          title="Total de Turmas"
          value={formatNumber(stats?.totalTurmas || 0)}
          icon={BookOpen}
          delay={0}
          description="CSV + Banco agregados"
        />
        <KPI
          title="Total de Matriculados"
          value={formatNumber(stats?.totalInscritos || 0)}
          icon={Users}
          delay={100}
          description="Inscritos agregados"
        />
        <KPI
          title="Total de Formados"
          value={formatNumber(stats?.totalFormados || 0)}
          icon={Award}
          delay={200}
          description="Certificados agregados"
        />
        <KPI
          title="Taxa de Evasão"
          value={`${(stats?.taxaEvasao || 0).toFixed(1)}%`}
          icon={TrendingDown}
          delay={300}
          description="Calculada dos dados agregados"
        />
      </div>

      {/* Estatísticas de Fontes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Fontes de Dados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4 text-blue-500" />
                <span className="font-semibold">Apenas Banco</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(stats?.porFonte?.apenasBanco || 0)}</p>
              <p className="text-sm text-muted-foreground">Turmas existentes no banco</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-green-500" />
                <span className="font-semibold">Apenas CSV</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(stats?.porFonte?.apenasCSV || 0)}</p>
              <p className="text-sm text-muted-foreground">Turmas legadas do CSV</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4 text-purple-500" />
                <FileText className="h-4 w-4 text-purple-500" />
                <span className="font-semibold">Ambas Fontes</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(stats?.porFonte?.ambas || 0)}</p>
              <p className="text-sm text-muted-foreground">Turmas duplicadas (merge aplicado)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Por Laboratório */}
      <Card>
        <CardHeader>
          <CardTitle>Por Laboratório</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {porLaboratorio
              .sort((a, b) => b.totalFormados - a.totalFormados)
              .slice(0, 10)
              .map((lab, idx) => (
                <div key={idx} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{lab.laboratorio}</h3>
                    <span className="text-sm text-muted-foreground">
                      {lab.totalTurmas} turma{lab.totalTurmas !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Matriculados</p>
                      <p className="text-lg font-bold">{formatNumber(lab.totalInscritos)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Formados</p>
                      <p className="text-lg font-bold text-green-600">{formatNumber(lab.totalFormados)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Taxa Evasão</p>
                      <p className="text-lg font-bold">
                        {lab.totalInscritos > 0
                          ? `${(((lab.totalInscritos - lab.totalFormados) / lab.totalInscritos) * 100).toFixed(1)}%`
                          : '0%'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Por Curso */}
      <Card>
        <CardHeader>
          <CardTitle>Por Curso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {porCurso
              .sort((a, b) => b.totalFormados - a.totalFormados)
              .slice(0, 10)
              .map((curso, idx) => (
                <div key={idx} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{curso.curso}</h3>
                    <span className="text-sm text-muted-foreground">
                      {curso.totalTurmas} turma{curso.totalTurmas !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Matriculados</p>
                      <p className="text-lg font-bold">{formatNumber(curso.totalInscritos)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Formados</p>
                      <p className="text-lg font-bold text-green-600">{formatNumber(curso.totalFormados)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Taxa Evasão</p>
                      <p className="text-lg font-bold">
                        {curso.totalInscritos > 0
                          ? `${(((curso.totalInscritos - curso.totalFormados) / curso.totalInscritos) * 100).toFixed(1)}%`
                          : '0%'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Turmas */}
      <Card>
        <CardHeader>
          <CardTitle>Todas as Turmas Agregadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Curso</th>
                  <th className="text-left p-2">Laboratório</th>
                  <th className="text-center p-2">Início</th>
                  <th className="text-center p-2">Matriculados</th>
                  <th className="text-center p-2">Formados</th>
                  <th className="text-center p-2">Fontes</th>
                </tr>
              </thead>
              <tbody>
                {turmas
                  .sort((a, b) => new Date(b.dataInicio).getTime() - new Date(a.dataInicio).getTime())
                  .slice(0, 50)
                  .map((turma, idx) => (
                    <tr key={idx} className="border-b hover:bg-muted/50">
                      <td className="p-2">{turma.titulo}</td>
                      <td className="p-2">{turma.laboratorio}</td>
                      <td className="p-2 text-center">
                        {new Date(turma.dataInicio).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-2 text-center">{formatNumber(turma.qtdVagasPreenchidas)}</td>
                      <td className="p-2 text-center text-green-600 font-semibold">
                        {formatNumber(turma.numFormados)}
                      </td>
                      <td className="p-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {turma.fontes.includes('BANCO') && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Banco</span>
                          )}
                          {turma.fontes.includes('CSV') && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">CSV</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

