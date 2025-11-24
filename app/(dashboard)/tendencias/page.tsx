/**
 * Página de Tendências e Comparações
 * Inspirada em USAspending.gov - Análise temporal e comparativa
 */

'use client'

import { useState } from 'react'
import { GovCard } from '@/components/ui/gov-card'
import { KPICard } from '@/components/dashboard/kpi-card'
import { LineChart } from '@/components/charts/line-chart'
import { BarChart } from '@/components/charts/bar-chart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Users, 
  Award, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  LineChart as LineChartIcon
} from 'lucide-react'
import { formatNumber, formatPercent } from '@/lib/formatters'
import { motion } from 'framer-motion'

// Dados mockados - substituir por query real
const mockTendenciaAlunos = [
  { mes: 'Jan', alunos: 1200, inscricoes: 800, certificados: 450 },
  { mes: 'Fev', alunos: 1350, inscricoes: 920, certificados: 520 },
  { mes: 'Mar', alunos: 1500, inscricoes: 1100, certificados: 680 },
  { mes: 'Abr', alunos: 1680, inscricoes: 1250, certificados: 790 },
  { mes: 'Mai', alunos: 1850, inscricoes: 1400, certificados: 920 },
  { mes: 'Jun', alunos: 2100, inscricoes: 1600, certificados: 1100 },
]

const mockComparacaoModulos = [
  { modulo: 'Work', inscricoes: 3200, certificados: 1850, taxa: 57.8 },
  { modulo: 'Edu', inscricoes: 2800, certificados: 1650, taxa: 58.9 },
  { modulo: 'Lab', inscricoes: 2400, certificados: 1420, taxa: 59.2 },
  { modulo: 'Trilhas', inscricoes: 1800, certificados: 1080, taxa: 60.0 },
]

export default function TendenciasPage() {
  const [periodo, setPeriodo] = useState('6meses')
  const [modulo, setModulo] = useState('todos')

  const crescimentoAlunos = ((mockTendenciaAlunos[5].alunos - mockTendenciaAlunos[0].alunos) / mockTendenciaAlunos[0].alunos) * 100
  const crescimentoInscricoes = ((mockTendenciaAlunos[5].inscricoes - mockTendenciaAlunos[0].inscricoes) / mockTendenciaAlunos[0].inscricoes) * 100
  const crescimentoCertificados = ((mockTendenciaAlunos[5].certificados - mockTendenciaAlunos[0].certificados) / mockTendenciaAlunos[0].certificados) * 100

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading text-foreground">Tendências e Comparações</h1>
          <p className="text-muted-foreground mt-2 font-body">
            Análise temporal e comparativa dos programas OxeTech
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3meses">Últimos 3 meses</SelectItem>
              <SelectItem value="6meses">Últimos 6 meses</SelectItem>
              <SelectItem value="12meses">Últimos 12 meses</SelectItem>
              <SelectItem value="todos">Todo o período</SelectItem>
            </SelectContent>
          </Select>
          <Select value={modulo} onValueChange={setModulo}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Módulo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os módulos</SelectItem>
              <SelectItem value="work">Work</SelectItem>
              <SelectItem value="edu">Edu</SelectItem>
              <SelectItem value="lab">Lab</SelectItem>
              <SelectItem value="trilhas">Trilhas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPIs de Crescimento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <KPICard
            title="Crescimento de Alunos"
            value={formatPercent(crescimentoAlunos)}
            icon={TrendingUp}
            color="work"
            change={Math.abs(crescimentoAlunos)}
            trend="up"
            subtitle={`${formatNumber(mockTendenciaAlunos[5].alunos - mockTendenciaAlunos[0].alunos)} novos alunos`}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <KPICard
            title="Crescimento de Inscrições"
            value={formatPercent(crescimentoInscricoes)}
            icon={Activity}
            color="lab"
            change={Math.abs(crescimentoInscricoes)}
            trend="up"
            subtitle={`${formatNumber(mockTendenciaAlunos[5].inscricoes - mockTendenciaAlunos[0].inscricoes)} novas inscrições`}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <KPICard
            title="Crescimento de Certificados"
            value={formatPercent(crescimentoCertificados)}
            icon={Award}
            color="edu"
            change={Math.abs(crescimentoCertificados)}
            trend="up"
            subtitle={`${formatNumber(mockTendenciaAlunos[5].certificados - mockTendenciaAlunos[0].certificados)} novos certificados`}
          />
        </motion.div>
      </div>

      {/* Gráfico de Tendência Temporal */}
      <GovCard title="Evolução Temporal" span={4}>
        <LineChart
          data={mockTendenciaAlunos}
          xKey="mes"
          yKeys={[
            { key: 'alunos', name: 'Total de Alunos', color: '#005ea2' },
            { key: 'inscricoes', name: 'Inscrições', color: '#28a0cb' },
            { key: 'certificados', name: 'Certificados', color: '#00a91c' },
          ]}
          title="Evolução dos Indicadores"
          description="Crescimento mensal de alunos, inscrições e certificados"
          height={400}
        />
      </GovCard>

      {/* Comparação entre Módulos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GovCard title="Comparação entre Módulos" span={2}>
          <BarChart
            data={mockComparacaoModulos}
            xKey="modulo"
            yKeys={[
              { key: 'inscricoes', name: 'Inscrições', color: '#005ea2' },
              { key: 'certificados', name: 'Certificados', color: '#00a91c' },
            ]}
            title="Inscrições vs Certificados por Módulo"
            height={300}
          />
        </GovCard>

        <GovCard title="Taxa de Certificação por Módulo" span={2}>
          <div className="space-y-4">
            {mockComparacaoModulos.map((item, index) => (
              <motion.div
                key={item.modulo}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{item.modulo}</span>
                  <span className="text-sm font-semibold text-primary">{formatPercent(item.taxa)}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <motion.div
                    className="bg-primary h-2.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${item.taxa}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatNumber(item.certificados)} certificados</span>
                  <span>{formatNumber(item.inscricoes)} inscrições</span>
                </div>
              </motion.div>
            ))}
          </div>
        </GovCard>
      </div>

      {/* Análise de Tendências */}
      <GovCard title="Análise de Tendências" span={4}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpRight className="h-5 w-5 text-primary" />
                Tendências Positivas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="font-medium text-foreground">Crescimento consistente de alunos</p>
                    <p className="text-sm text-muted-foreground">
                      Aumento médio de {formatPercent(crescimentoAlunos / 6)} ao mês
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="font-medium text-foreground">Melhoria na taxa de certificação</p>
                    <p className="text-sm text-muted-foreground">
                      Taxa média de {formatPercent(59.0)}% entre todos os módulos
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="font-medium text-foreground">Expansão geográfica</p>
                    <p className="text-sm text-muted-foreground">
                      Cobertura em múltiplos municípios
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-accent-cool">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-accent-cool" />
                Oportunidades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent-cool mt-2" />
                  <div>
                    <p className="font-medium text-foreground">Otimizar taxa de conclusão</p>
                    <p className="text-sm text-muted-foreground">
                      Potencial de melhoria em {formatPercent(10)}% nos módulos Work e Edu
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent-cool mt-2" />
                  <div>
                    <p className="font-medium text-foreground">Reduzir evasão</p>
                    <p className="text-sm text-muted-foreground">
                      Foco em retenção de alunos nos primeiros 30 dias
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent-cool mt-2" />
                  <div>
                    <p className="font-medium text-foreground">Expandir programas</p>
                    <p className="text-sm text-muted-foreground">
                      Oportunidade de crescimento em novas áreas
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </GovCard>
    </div>
  )
}

