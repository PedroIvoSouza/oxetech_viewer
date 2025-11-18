'use client'

import { useHomeData } from '@/lib/queries/home'
import { KPICard } from '@/components/dashboard/kpi-card'
import { LineChart } from '@/components/charts/line-chart'
import { BarChart } from '@/components/charts/bar-chart'
import { AreaChart } from '@/components/charts/area-chart'
import { PieChart } from '@/components/charts/pie-chart'
import { FunnelChart } from '@/components/charts/funnel-chart'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  MapPin,
  TrendingUp,
  Award,
  FlaskConical,
} from 'lucide-react'
import { formatNumber } from '@/lib/formatters'
import { motion } from 'framer-motion'

export default function HomePage() {
  const { data, isLoading, error } = useHomeData()

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
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
    kpis,
    evolucao12Meses,
    evolucaoAlunos,
    evolucaoWork,
    funilWork,
    conclusaoTrilhas,
    distribuicaoPrograma,
  } = data.data

  const funilWorkData = [
    { name: 'Inscrições', value: funilWork.inscricoes },
    { name: 'Candidaturas', value: funilWork.candidaturas },
    { name: 'Contratações', value: funilWork.contratacoes },
  ]

  const distribuicaoProgramaData = [
    { name: 'Work', value: distribuicaoPrograma.work },
    { name: 'Edu', value: distribuicaoPrograma.edu },
    { name: 'Lab', value: distribuicaoPrograma.lab },
    { name: 'Trilhas', value: distribuicaoPrograma.trilhas },
  ]

  return (
    <div className="space-y-8">
      {/* Header do Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2">Painel Executivo</h1>
        <p className="text-lg text-muted-foreground">
          Visão geral do ecossistema OxeTech em tempo real
        </p>
      </motion.div>

      {/* KPIs Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total de Alunos"
          value={formatNumber(kpis.totalAlunos)}
          icon={Users}
          delay={0}
          description="Alunos cadastrados no sistema"
        />
        <KPICard
          title="Total de Empresas"
          value={formatNumber(kpis.totalEmpresas)}
          icon={Building2}
          delay={50}
          description="Empresas parceiras"
        />
        <KPICard
          title="Municípios Atendidos"
          value={formatNumber(kpis.totalMunicipios)}
          icon={MapPin}
          delay={100}
          description="Alcance geográfico"
        />
        <KPICard
          title="Matrículas Edu"
          value={formatNumber(kpis.totalMatriculasEdu)}
          icon={GraduationCap}
          module="edu"
          delay={150}
          description="OxeTech Edu"
        />
        <KPICard
          title="Inscrições Work"
          value={formatNumber(kpis.totalInscricoesWork)}
          icon={Briefcase}
          module="work"
          delay={200}
          description="OxeTech Work"
        />
        <KPICard
          title="Vagas Work"
          value={formatNumber(kpis.totalVagasWork)}
          icon={Briefcase}
          module="work"
          delay={250}
        />
        <KPICard
          title="Candidaturas Work"
          value={formatNumber(kpis.totalCandidaturasWork)}
          icon={CheckCircle}
          module="work"
          delay={300}
        />
        <KPICard
          title="Contratações Work"
          value={formatNumber(kpis.totalContratacoesWork)}
          icon={CheckCircle}
          module="work"
          delay={350}
        />
        <KPICard
          title="Total de Trilhas"
          value={formatNumber(kpis.totalTrilhas)}
          icon={BookOpen}
          module="trilhas"
          delay={400}
        />
        <KPICard
          title="Atividades Concluídas"
          value={formatNumber(kpis.totalAtividadesConcluidas)}
          icon={CheckCircle}
          delay={450}
        />
        <KPICard
          title="Frequências Registradas"
          value={formatNumber(kpis.totalFrequencias)}
          icon={Calendar}
          delay={500}
        />
        <KPICard
          title="Instrutores"
          value={formatNumber(kpis.totalInstrutores)}
          icon={UserCheck}
          delay={550}
        />
        {/* KPIs de Certificados */}
        <KPICard
          title="Total de Certificados"
          value={formatNumber(kpis.totalCertificados || 0)}
          icon={Award}
          delay={600}
          description="Alunos certificados em todos os programas"
        />
        <KPICard
          title="Certificados Work"
          value={formatNumber(kpis.totalCertificadosWork || 0)}
          icon={Briefcase}
          module="work"
          delay={650}
        />
        <KPICard
          title="Certificados Edu"
          value={formatNumber(kpis.totalCertificadosEdu || 0)}
          icon={GraduationCap}
          module="edu"
          delay={700}
        />
        <KPICard
          title="Certificados Trilhas"
          value={formatNumber(kpis.totalCertificadosTrilhas || 0)}
          icon={BookOpen}
          module="trilhas"
          delay={750}
        />
        <KPICard
          title="Certificados Lab"
          value={formatNumber(kpis.totalCertificadosLab || 0)}
          icon={FlaskConical}
          module="lab"
          delay={800}
        />
      </div>

      {/* Gráficos Principais */}
      <div className="grid gap-6 md:grid-cols-2">
        <LineChart
          title="Evolução dos Últimos 12 Meses"
          description="Crescimento mensal de alunos cadastrados"
          data={evolucao12Meses}
          xKey="mes"
          yKeys={[{ key: 'alunos', name: 'Alunos', color: '#3B82F6' }]}
          height={400}
        />
        <PieChart
          title="Distribuição por Programa"
          description="Participação de alunos em cada programa OxeTech"
          data={distribuicaoProgramaData}
          height={400}
        />
      </div>

      {/* Funil Work Premium */}
      <FunnelChart
        title="Funil OxeTech Work"
        description="Processo completo: Inscrições → Candidaturas → Contratações"
        data={funilWorkData}
        module="work"
        height={300}
      />

      {/* Gráficos Secundários */}
      <div className="grid gap-6 md:grid-cols-2">
        <AreaChart
          title="Evolução Work"
          description="Crescimento das inscrições no OxeTech Work ao longo do tempo"
          data={evolucaoWork}
          xKey="mes"
          yKeys={[{ key: 'inscricoes', name: 'Inscrições', color: '#0A64C2' }]}
          module="work"
          height={350}
        />
        {conclusaoTrilhas.length > 0 && (
          <BarChart
            title="Top 10 Trilhas Mais Concluídas"
            description="Trilhas com maior número de conclusões"
            data={conclusaoTrilhas}
            xKey="trilha"
            yKeys={[{ key: 'total', name: 'Conclusões', color: '#C80000' }]}
            module="trilhas"
            height={350}
          />
        )}
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-0 shadow-soft" style={{ borderRadius: '22px' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Taxa de Conversão Work
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {funilWork.inscricoes > 0
                ? ((funilWork.contratacoes / funilWork.inscricoes) * 100).toFixed(1)
                : 0}
              %
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {funilWork.contratacoes} contratações de {funilWork.inscricoes}{' '}
              inscrições
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-soft" style={{ borderRadius: '22px' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Alcance Regional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {kpis.totalMunicipios}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Municípios atendidos em Alagoas
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-soft" style={{ borderRadius: '22px' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-red-600" />
              Engajamento em Trilhas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {kpis.totalAtividadesConcluidas}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Atividades concluídas nas trilhas
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
