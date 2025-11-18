'use client'

import { useHomeData } from '@/lib/queries/home'
import { KPICard } from '@/components/dashboard/kpi-card'
import { LineChart } from '@/components/charts/line-chart'
import { BarChart } from '@/components/charts/bar-chart'
import { AreaChart } from '@/components/charts/area-chart'
import { PieChart } from '@/components/charts/pie-chart'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Users,
  Building2,
  GraduationCap,
  Briefcase,
  BookOpen,
  CheckCircle,
  Calendar,
  UserCheck,
  UserCog,
} from 'lucide-react'
import { formatNumber } from '@/lib/formatters'

export default function HomePage() {
  const { data, isLoading, error } = useHomeData()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-destructive">Erro ao carregar dados: {error.message}</p>
      </div>
    )
  }

  if (!data) {
    return null
  }

  const { kpis, evolucaoAlunos, evolucaoWork, funilWork, conclusaoTrilhas } =
    data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard OxeTech</h1>
        <p className="text-muted-foreground">
          Visão geral do ecossistema OxeTech
        </p>
      </div>

      {/* KPIs Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total de Alunos"
          value={formatNumber(kpis.totalAlunos)}
          icon={Users}
        />
        <KPICard
          title="Total de Empresas"
          value={formatNumber(kpis.totalEmpresas)}
          icon={Building2}
        />
        <KPICard
          title="Matrículas Edu"
          value={formatNumber(kpis.totalMatriculasEdu)}
          icon={GraduationCap}
        />
        <KPICard
          title="Inscrições Work"
          value={formatNumber(kpis.totalInscricoesWork)}
          icon={Briefcase}
        />
        <KPICard
          title="Vagas Work"
          value={formatNumber(kpis.totalVagasWork)}
          icon={Briefcase}
        />
        <KPICard
          title="Candidaturas Work"
          value={formatNumber(kpis.totalCandidaturasWork)}
          icon={Briefcase}
        />
        <KPICard
          title="Contratações Work"
          value={formatNumber(kpis.totalContratacoesWork)}
          icon={CheckCircle}
        />
        <KPICard
          title="Total de Trilhas"
          value={formatNumber(kpis.totalTrilhas)}
          icon={BookOpen}
        />
        <KPICard
          title="Atividades Concluídas"
          value={formatNumber(kpis.totalAtividadesConcluidas)}
          icon={CheckCircle}
        />
        <KPICard
          title="Frequências Registradas"
          value={formatNumber(kpis.totalFrequencias)}
          icon={Calendar}
        />
        <KPICard
          title="Total de Instrutores"
          value={formatNumber(kpis.totalInstrutores)}
          icon={UserCheck}
        />
        <KPICard
          title="Total de Agentes"
          value={formatNumber(kpis.totalAgentes)}
          icon={UserCog}
        />
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        <LineChart
          title="Evolução Mensal de Alunos"
          description="Crescimento do número de alunos ao longo do tempo"
          data={evolucaoAlunos}
          xKey="mes"
          yKeys={[{ key: 'total', name: 'Alunos', color: '#8884d8' }]}
        />
        <LineChart
          title="Evolução Work"
          description="Crescimento das inscrições no OxeTech Work"
          data={evolucaoWork}
          xKey="mes"
          yKeys={[{ key: 'inscricoes', name: 'Inscrições', color: '#82ca9d' }]}
        />
        <AreaChart
          title="Funil Work"
          description="Processo de inscrição → seleção → contratação"
          data={[
            { etapa: 'Inscrições', valor: funilWork.inscricoes },
            { etapa: 'Candidaturas', valor: funilWork.candidaturas },
            { etapa: 'Contratações', valor: funilWork.contratacoes },
          ]}
          xKey="etapa"
          yKeys={[{ key: 'valor', name: 'Quantidade', color: '#ffc658' }]}
        />
        {conclusaoTrilhas.length > 0 && (
          <PieChart
            title="Conclusão de Trilhas"
            description="Distribuição de conclusões por trilha"
            data={conclusaoTrilhas.map((item) => ({
              name: item.trilha,
              value: item.total,
            }))}
          />
        )}
      </div>
    </div>
  )
}

