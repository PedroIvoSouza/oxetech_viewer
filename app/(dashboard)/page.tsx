/**
 * Dashboard Principal - Bento Grid Style
 * Inspirado em USAspending.gov
 */

'use client'

import { GovCard } from '@/components/ui/gov-card'
import { GovKPI } from '@/components/dashboard/gov-kpi'
import { BentoGridSkeleton } from '@/components/ui/bento-skeleton'
import { Users, TrendingUp, Award, Activity, Target, Zap } from 'lucide-react'
import { useHomeData } from '@/lib/queries/home'
import { formatNumber } from '@/lib/formatters'

export default function DashboardPage() {
  const { data, isLoading, error } = useHomeData()

  if (isLoading) {
    return <BentoGridSkeleton count={8} />
  }

  if (error) {
    console.error('Error loading home data:', error)
    // Retornar dados vazios em vez de mostrar erro
    return (
      <div className="bento-grid">
        <GovKPI
          label="Total de Alunos"
          value={0}
          icon={Users}
          description="Dados não disponíveis"
          delay={0}
        />
        <GovKPI
          label="Total de Inscrições"
          value={0}
          icon={TrendingUp}
          description="Dados não disponíveis"
          delay={100}
        />
        <GovKPI
          label="Certificados"
          value={0}
          icon={Award}
          description="Dados não disponíveis"
          delay={200}
        />
        <GovKPI
          label="Taxa de Conclusão"
          value="0%"
          icon={Target}
          description="Dados não disponíveis"
          delay={300}
        />
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

  const kpis = data?.data?.kpis || {
    totalAlunos: 0,
    totalInscricoesWork: 0,
    totalMatriculasEdu: 0,
    totalCertificados: 0,
    totalCertificadosWork: 0,
    totalCertificadosEdu: 0,
    totalCertificadosLab: 0,
    totalCertificadosTrilhas: 0,
    totalContratacoesWork: 0,
    totalMunicipios: 0,
  }
  
  const totalInscricoes = (kpis.totalInscricoesWork || 0) + (kpis.totalMatriculasEdu || 0)
  
  // Certificados são apenas Lab + Edu + Trilhas (NÃO inclui Work)
  const totalCertificados = 
    (kpis.totalCertificadosLab || 0) + 
    (kpis.totalCertificadosEdu || 0) + 
    (kpis.totalCertificadosTrilhas || 0)
    
  const taxaConclusao = kpis.totalAlunos > 0 
    ? (totalCertificados / kpis.totalAlunos) * 100 
    : 0

  return (
    <div className="bento-grid">
      {/* Big Number Ribbon - KPIs Principais */}
      <GovKPI
        label="Total de Alunos"
        value={kpis.totalAlunos || 0}
        icon={Users}
        description="Alunos registrados no sistema"
        delay={0}
      />
      <GovKPI
        label="Total de Inscrições"
        value={totalInscricoes}
        icon={TrendingUp}
        description="Inscrições realizadas"
        delay={100}
      />
      <GovKPI
        label="Certificados"
        value={totalCertificados}
        icon={Award}
        description="Alunos certificados (Lab + Edu + Trilhas)"
        delay={200}
      />
      <GovKPI
        label="Contratações Work"
        value={kpis.totalContratacoesWork || 0}
        icon={Users}
        description="Pessoas empregadas via OxeTech Work"
        delay={300}
      />

      {/* Cards de Destaque */}
      <GovCard title="Programas Ativos" span={2}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold font-mono-numeric kpi-number-secondary">
                4
              </p>
              <p className="text-sm text-muted-foreground mt-1 font-body">
                Programas em execução
              </p>
            </div>
            <Activity className="h-12 w-12 text-primary-vivid opacity-20" />
          </div>
        </div>
      </GovCard>

      <GovCard title="Taxa de Conclusão" span={2}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold font-mono-numeric kpi-number-primary">
                {taxaConclusao.toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground mt-1 font-body">
                Percentual de conclusão
              </p>
            </div>
            <Target className="h-12 w-12 text-primary-vivid opacity-20" />
          </div>
        </div>
      </GovCard>

      {/* Certificados por Módulo */}
      <GovCard title="Certificados por Módulo" span={4}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-4xl font-bold font-mono-numeric kpi-number-primary mb-2">
              {kpis.totalCertificadosLab || 0}
            </p>
            <p className="text-sm font-semibold text-foreground mb-1">Lab</p>
            <p className="text-xs text-muted-foreground">Alunos certificados em cursos presenciais</p>
          </div>
          <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-4xl font-bold font-mono-numeric kpi-number-primary mb-2">
              {kpis.totalCertificadosEdu || 0}
            </p>
            <p className="text-sm font-semibold text-foreground mb-1">Edu</p>
            <p className="text-xs text-muted-foreground">Alunos certificados em cursos online</p>
          </div>
          <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-4xl font-bold font-mono-numeric kpi-number-primary mb-2">
              {kpis.totalCertificadosTrilhas || 0}
            </p>
            <p className="text-sm font-semibold text-foreground mb-1">Trilhas</p>
            <p className="text-xs text-muted-foreground">Alunos que concluíram trilhas de conhecimento</p>
          </div>
        </div>
      </GovCard>

      {/* Work - Contratações */}
      <GovCard title="OxeTech Work - Contratações" span={4}>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg border border-success/20">
            <div>
              <p className="text-4xl font-bold font-mono-numeric text-success mb-2">
                {kpis.totalContratacoesWork || 0}
              </p>
              <p className="text-sm font-semibold text-foreground mb-1">Pessoas Empregadas</p>
              <p className="text-xs text-muted-foreground">Contratações realizadas via programa OxeTech Work</p>
            </div>
            <Users className="h-16 w-16 text-success opacity-20" />
          </div>
        </div>
      </GovCard>
    </div>
  )
}
