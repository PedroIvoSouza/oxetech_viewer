/**
 * Dashboard OxeTech Work - Bento Grid Style
 * Inspirado em USAspending.gov
 */

'use client'

import { useWorkData } from '@/lib/queries/work'
import { GovCard } from '@/components/ui/gov-card'
import { GovKPI } from '@/components/dashboard/gov-kpi'
import { BentoGridSkeleton } from '@/components/ui/bento-skeleton'
import { BarChart } from '@/components/charts/bar-chart'
import { PieChart } from '@/components/charts/pie-chart'
import { FunnelChart } from '@/components/charts/funnel-chart'
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
import { cn } from '@/lib/utils'

export default function WorkPage() {
  const { data, isLoading, error } = useWorkData()

  if (isLoading) {
    return <BentoGridSkeleton count={8} />
  }

  if (error) {
    console.error('Error loading work data:', error)
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

  const taxaConversao = stats.inscricoes && stats.inscricoes > 0
    ? ((stats.contratacoes / stats.inscricoes) * 100)
    : 0

  return (
    <div className="bento-grid">
      {/* Big Number Ribbon - KPIs Principais */}
      <GovKPI
        label="Total de Vagas"
        value={stats.vagas || 0}
        icon={Briefcase}
        description="Vagas disponíveis no sistema"
        delay={0}
      />
      <GovKPI
        label="Empresas Parceiras"
        value={stats.empresas || 0}
        icon={Building2}
        description="Empresas cadastradas"
        delay={100}
      />
      <GovKPI
        label="Candidaturas"
        value={stats.candidaturas || 0}
        icon={FileText}
        description="Total de candidaturas"
        delay={200}
      />
      <GovKPI
        label="Contratações"
        value={stats.contratacoes || 0}
        icon={CheckCircle}
        description="Contratações realizadas"
        delay={300}
      />

      {/* Funil Work */}
      <GovCard title="Funil OxeTech Work" span={4}>
        <FunnelChart
          title=""
          description="Processo completo: Inscrições → Candidaturas → Contratações"
          data={funilWorkData}
          module="work"
          height={300}
        />
      </GovCard>

      {/* Cards de Status e Tempos */}
      <GovCard title="Vagas por Status" span={2}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Abertas</span>
            <span className="text-xl font-bold text-success">
              {vagasStatusAbertas}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Encerradas</span>
            <span className="text-xl font-bold text-error">
              {vagasStatusFechadas}
            </span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-2xl font-bold kpi-number-primary">
              {stats.vagas}
            </span>
          </div>
        </div>
      </GovCard>

      <GovCard title="Tempo Médio - Etapas" span={2}>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Inscrição → Candidatura
            </p>
            <p className="text-2xl font-bold kpi-number-primary">
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
            <p className="text-2xl font-bold kpi-number-primary">
              {temposMedios.candidaturaContratacao}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                dias
              </span>
            </p>
          </div>
        </div>
      </GovCard>

      <GovCard title="Taxa de Conversão" span={2}>
        <div className="space-y-2">
          <div className="text-4xl font-bold kpi-number-primary mb-2">
            {taxaConversao.toFixed(1)}%
          </div>
          <p className="text-sm text-muted-foreground">
            {stats.contratacoes} contratações de {stats.inscricoes || 0} inscrições
          </p>
        </div>
      </GovCard>

      {/* Gráficos */}
      {vagasPorStatus.length > 0 && (
        <GovCard title="Vagas por Status" span={2}>
          <PieChart
            title=""
            description="Distribuição de vagas por status"
            data={vagasPorStatus.map((item) => ({
              name: item.status,
              value: item.total,
            }))}
            module="work"
            height={300}
          />
        </GovCard>
      )}
      {funilPorEdital.length > 0 && (
        <GovCard title="Funil por Edital" span={2}>
          <BarChart
            title=""
            description="Inscrições, candidaturas e contratações por edital"
            data={funilPorEdital}
            xKey="edital"
            yKeys={[
              {
                key: 'inscricoes',
                name: 'Inscrições',
                color: '#005ea2',
              },
              {
                key: 'candidaturas',
                name: 'Candidaturas',
                color: '#1a4480',
              },
              {
                key: 'contratacoes',
                name: 'Contratações',
                color: '#3B82F6',
              },
            ]}
            module="work"
            height={300}
          />
        </GovCard>
      )}

      {/* Ranking de Empresas */}
      <GovCard title="Ranking de Empresas" span={4}>
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
                <tr
                  key={empresa.id}
                  className="border-b hover:bg-muted/50 transition-colors"
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GovCard>

      {/* Tabela de Vagas */}
      <GovCard title="Vagas Recentes" span={4}>
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
      </GovCard>
    </div>
  )
}
