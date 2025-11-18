'use client'

import { useWorkData } from '@/lib/queries/work'
import { KPICard } from '@/components/dashboard/kpi-card'
import { BarChart } from '@/components/charts/bar-chart'
import { PieChart } from '@/components/charts/pie-chart'
import { FunnelChart } from '@/components/charts/funnel-chart'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Briefcase,
  Building2,
  FileText,
  CheckCircle,
  Clock,
  TrendingUp,
  Award,
} from 'lucide-react'
import { formatNumber, formatDate } from '@/lib/formatters'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function WorkPage() {
  const { data, isLoading, error } = useWorkData()

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid gap-6 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
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
    funilPorEdital,
    empresas,
    vagasPorStatus,
    vagas,
    temposMedios,
  } = data.data

  // Preparar dados para gráficos
  const vagasStatusAbertas = vagasPorStatus.find((v) => v.status === 'ABERTA')
    ?.total || 0
  const vagasStatusFechadas = vagasPorStatus.find((v) => v.status === 'FECHADA')
    ?.total || 0

  const funilWorkData = [
    { name: 'Inscrições', value: stats.inscricoes || 0 },
    { name: 'Candidaturas', value: stats.candidaturas },
    { name: 'Contratações', value: stats.contratacoes },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2" style={{ color: '#0A64C2' }}>
          OxeTech Work
        </h1>
        <p className="text-lg text-muted-foreground">
          Dashboard completo do programa OxeTech Work
        </p>
      </motion.div>

      {/* KPIs */}
      <div className="grid gap-6 md:grid-cols-4">
        <KPICard
          title="Total de Vagas"
          value={formatNumber(stats.vagas)}
          icon={Briefcase}
          module="work"
          delay={0}
          description="Vagas cadastradas"
        />
        <KPICard
          title="Empresas Parceiras"
          value={formatNumber(stats.empresas)}
          icon={Building2}
          module="work"
          delay={50}
          description="Empresas no programa"
        />
        <KPICard
          title="Candidaturas"
          value={formatNumber(stats.candidaturas)}
          icon={FileText}
          module="work"
          delay={100}
        />
        <KPICard
          title="Contratações"
          value={formatNumber(stats.contratacoes)}
          icon={CheckCircle}
          module="work"
          delay={150}
        />
      </div>

      {/* Funil Work */}
      <FunnelChart
        title="Funil OxeTech Work"
        description="Processo completo: Inscrições → Candidaturas → Contratações"
        data={funilWorkData}
        module="work"
        height={350}
      />

      {/* Cards de Status e Tempos */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card
          className="border-0 shadow-soft"
          style={{ borderRadius: '22px' }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-work-primary" />
              Vagas por Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Abertas</span>
              <span className="text-xl font-bold text-green-600">
                {vagasStatusAbertas}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Encerradas</span>
              <span className="text-xl font-bold text-red-600">
                {vagasStatusFechadas}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-2xl font-bold text-work-primary">
                {stats.vagas}
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
              <Clock className="h-5 w-5 text-work-primary" />
              Tempo Médio - Etapas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Inscrição → Candidatura
              </p>
              <p className="text-2xl font-bold text-work-primary">
                {temposMedios.inscricaoCandidatura}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  dias
                </span>
              </p>
            </div>
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground mb-1">
                Candidatura → Contratação
              </p>
              <p className="text-2xl font-bold text-work-primary">
                {temposMedios.candidaturaContratacao}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  dias
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-0 shadow-soft"
          style={{ borderRadius: '22px' }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-work-primary" />
              Taxa de Conversão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-work-primary mb-2">
              {stats.inscricoes > 0
                ? ((stats.contratacoes / stats.inscricoes) * 100).toFixed(1)
                : 0}
              %
            </div>
            <p className="text-sm text-muted-foreground">
              {stats.contratacoes} contratações de {stats.inscricoes}{' '}
              inscrições
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        {vagasPorStatus.length > 0 && (
          <PieChart
            title="Vagas por Status"
            description="Distribuição de vagas por status"
            data={vagasPorStatus.map((item) => ({
              name: item.status,
              value: item.total,
            }))}
            module="work"
            height={350}
          />
        )}
        {funilPorEdital.length > 0 && (
          <BarChart
            title="Funil por Edital"
            description="Inscrições, candidaturas e contratações por edital"
            data={funilPorEdital}
            xKey="edital"
            yKeys={[
              {
                key: 'inscricoes',
                name: 'Inscrições',
                color: '#0A64C2',
              },
              {
                key: 'candidaturas',
                name: 'Candidaturas',
                color: '#2E2A87',
              },
              {
                key: 'contratacoes',
                name: 'Contratações',
                color: '#3B82F6',
              },
            ]}
            module="work"
            height={350}
          />
        )}
      </div>

      {/* Ranking de Empresas */}
      <Card
        className="border-0 shadow-soft overflow-hidden"
        style={{ borderRadius: '22px' }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-work-primary" />
            Ranking de Empresas
          </CardTitle>
          <CardDescription>
            Top 20 empresas com mais contratações no OxeTech Work
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
                    Empresa
                  </th>
                  <th className="text-right p-3 text-sm font-semibold text-muted-foreground">
                    Vagas
                  </th>
                  <th className="text-right p-3 text-sm font-semibold text-muted-foreground">
                    Candidaturas
                  </th>
                  <th className="text-right p-3 text-sm font-semibold text-muted-foreground">
                    Contratações
                  </th>
                  <th className="text-right p-3 text-sm font-semibold text-muted-foreground">
                    Taxa Conversão
                  </th>
                </tr>
              </thead>
              <tbody>
                {empresas.slice(0, 20).map((empresa, index) => (
                  <motion.tr
                    key={empresa.id}
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
                            ? 'bg-work-primary text-white'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {index + 1}
                      </span>
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{empresa.razao_social}</p>
                        <p className="text-xs text-muted-foreground">
                          {empresa.email}
                        </p>
                      </div>
                    </td>
                    <td className="p-3 text-right font-medium">
                      {empresa.totalVagas}
                    </td>
                    <td className="p-3 text-right font-medium">
                      {empresa.totalCandidaturas}
                    </td>
                    <td className="p-3 text-right font-bold text-work-primary">
                      {empresa.totalContratacoes}
                    </td>
                    <td className="p-3 text-right">
                      <span className="font-medium">{empresa.taxaConversao}%</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Vagas */}
      <Card
        className="border-0 shadow-soft overflow-hidden"
        style={{ borderRadius: '22px' }}
      >
        <CardHeader>
          <CardTitle>Vagas Recentes</CardTitle>
          <CardDescription>
            Últimas 30 vagas cadastradas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
                    Vaga
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
                    Empresa
                  </th>
                  <th className="text-center p-3 text-sm font-semibold text-muted-foreground">
                    Status
                  </th>
                  <th className="text-right p-3 text-sm font-semibold text-muted-foreground">
                    Candidaturas
                  </th>
                  <th className="text-right p-3 text-sm font-semibold text-muted-foreground">
                    Quantidade
                  </th>
                </tr>
              </thead>
              <tbody>
                {vagas.slice(0, 30).map((vaga) => (
                  <tr
                    key={vaga.id}
                    className="border-b hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-3">
                      <p className="font-medium">{vaga.titulo}</p>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {vaga.empresa}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={cn(
                          'rounded-full px-3 py-1 text-xs font-medium',
                          vaga.status === 'ABERTA'
                            ? 'bg-green-100 text-green-800'
                            : vaga.status === 'FECHADA'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        )}
                      >
                        {vaga.status}
                      </span>
                    </td>
                    <td className="p-3 text-right font-medium">
                      {vaga.totalCandidaturas}
                    </td>
                    <td className="p-3 text-right font-medium">
                      {vaga.quantidade}
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
