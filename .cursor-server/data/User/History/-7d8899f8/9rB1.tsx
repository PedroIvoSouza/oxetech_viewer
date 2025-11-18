'use client'

import { useCertificadosData } from '@/lib/queries/certificados'
import { KPICard } from '@/components/dashboard/kpi-card'
import { BarChart } from '@/components/charts/bar-chart'
import { PieChart } from '@/components/charts/pie-chart'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Award,
  Users,
  Briefcase,
  GraduationCap,
  BookOpen,
  FlaskConical,
  MapPin,
  TrendingUp,
  Mail,
  Phone,
} from 'lucide-react'
import { formatNumber, formatDate } from '@/lib/formatters'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function CertificadosPage() {
  const { data, isLoading, error } = useCertificadosData()

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid gap-6 md:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
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
    alunosCertificados,
    distribuicaoMunicipio,
    distribuicaoPrograma,
  } = data.data

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2">Alunos Certificados</h1>
        <p className="text-lg text-muted-foreground">
          Dashboard completo de alunos certificados no ecossistema OxeTech
        </p>
      </motion.div>

      {/* KPIs */}
      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-6">
        <KPICard
          title="Total de Certificados"
          value={formatNumber(stats.totalCertificados)}
          icon={Award}
          delay={0}
        />
        <KPICard
          title="Alunos Certificados"
          value={formatNumber(stats.totalAlunosCertificados)}
          icon={Users}
          delay={50}
        />
        <KPICard
          title="Certificados Work"
          value={formatNumber(stats.totalCertificadosWork)}
          icon={Briefcase}
          module="work"
          delay={100}
        />
        <KPICard
          title="Certificados Edu"
          value={formatNumber(stats.totalCertificadosEdu)}
          icon={GraduationCap}
          module="edu"
          delay={150}
        />
        <KPICard
          title="Certificados Trilhas"
          value={formatNumber(stats.totalCertificadosTrilhas)}
          icon={BookOpen}
          module="trilhas"
          delay={200}
        />
        <KPICard
          title="Certificados Lab"
          value={formatNumber(stats.totalCertificadosLab)}
          icon={FlaskConical}
          module="lab"
          delay={250}
        />
      </div>

      {/* Estatísticas Adicionais */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card
          className="border-0 shadow-soft"
          style={{ borderRadius: '22px' }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Múltiplos Certificados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary mb-2">
              {formatNumber(stats.alunosComMultiplosCertificados)}
            </div>
            <p className="text-sm text-muted-foreground">
              Alunos com mais de um certificado
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalAlunosCertificados > 0
                ? (
                    (stats.alunosComMultiplosCertificados /
                      stats.totalAlunosCertificados) *
                    100
                  ).toFixed(1)
                : 0}
              % dos alunos certificados
            </p>
          </CardContent>
        </Card>

        <Card
          className="border-0 shadow-soft"
          style={{ borderRadius: '22px' }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Municípios com Certificados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary mb-2">
              {formatNumber(distribuicaoMunicipio.length)}
            </div>
            <p className="text-sm text-muted-foreground">
              Municípios que possuem alunos certificados
            </p>
          </CardContent>
        </Card>

        <Card
          className="border-0 shadow-soft"
          style={{ borderRadius: '22px' }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Média de Certificados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary mb-2">
              {stats.totalAlunosCertificados > 0
                ? (stats.totalCertificados / stats.totalAlunosCertificados).toFixed(2)
                : '0'}
            </div>
            <p className="text-sm text-muted-foreground">
              Certificados por aluno
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        <PieChart
          title="Distribuição de Certificados por Programa"
          description="Total de certificados emitidos por programa"
          data={[
            { name: 'Work', value: distribuicaoPrograma.Work },
            { name: 'Edu', value: distribuicaoPrograma.Edu },
            { name: 'Trilhas', value: distribuicaoPrograma.Trilhas },
            { name: 'Lab', value: distribuicaoPrograma.Lab },
          ]}
          height={350}
        />
        {distribuicaoMunicipio.length > 0 && (
          <BarChart
            title="Top 15 Municípios com Mais Certificados"
            description="Municípios com maior número de alunos certificados"
            data={distribuicaoMunicipio.slice(0, 15)}
            xKey="municipio"
            yKeys={[
              {
                key: 'total',
                name: 'Certificados',
                color: '#6366F1',
              },
            ]}
            module="home"
            height={350}
          />
        )}
      </div>

      {/* Lista de Alunos Certificados */}
      <Card
        className="border-0 shadow-soft overflow-hidden"
        style={{ borderRadius: '22px' }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Lista de Alunos Certificados
          </CardTitle>
          <CardDescription>
            {stats.totalAlunosCertificados} aluno(s) certificado(s) no ecossistema OxeTech
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
                    Aluno
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
                    Contatos
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
                    Município
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
                    Programas
                  </th>
                  <th className="text-right p-3 text-sm font-semibold text-muted-foreground">
                    Total Certificados
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
                    Detalhes
                  </th>
                </tr>
              </thead>
              <tbody>
                {alunosCertificados.slice(0, 100).map((aluno, index) => (
                  <motion.tr
                    key={aluno.id || index}
                    className="border-b hover:bg-muted/50 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.01 }}
                  >
                    <td className="p-3 font-medium">{aluno.aluno}</td>
                    <td className="p-3">
                      <div className="space-y-1">
                        {aluno.email && (
                          <a
                            href={`mailto:${aluno.email}`}
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                            title={aluno.email}
                          >
                            <Mail className="h-3 w-3" />
                            {aluno.email.length > 20
                              ? `${aluno.email.substring(0, 20)}...`
                              : aluno.email}
                          </a>
                        )}
                        {aluno.telefone && (
                          <a
                            href={`tel:${aluno.telefone.replace(/\D/g, '')}`}
                            className="text-sm text-green-600 hover:underline flex items-center gap-1"
                            title={aluno.telefone}
                          >
                            <Phone className="h-3 w-3" />
                            {aluno.telefone}
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {aluno.municipio}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {aluno.programas.map((prog, idx) => (
                          <span
                            key={idx}
                            className={cn(
                              'rounded-full px-2 py-1 text-xs font-medium text-white',
                              prog === 'Work' && 'bg-blue-600',
                              prog === 'Edu' && 'bg-yellow-600',
                              prog === 'Trilhas' && 'bg-red-600',
                              prog === 'Lab' && 'bg-orange-600'
                            )}
                          >
                            {prog}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <span className="font-bold text-primary">
                        {formatNumber(aluno.totalCertificados)}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground max-w-xs">
                      <div className="space-y-1">
                        {aluno.certificacoes.slice(0, 2).map((cert, idx) => (
                          <div key={idx} className="text-xs">
                            {cert.programa}: {cert.detalhes.substring(0, 40)}
                            {cert.detalhes.length > 40 ? '...' : ''}
                          </div>
                        ))}
                        {aluno.certificacoes.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{aluno.certificacoes.length - 2} mais...
                          </div>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

