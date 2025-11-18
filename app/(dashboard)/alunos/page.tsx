'use client'

import { useState, useMemo } from 'react'
import { useAlunosData } from '@/lib/queries/alunos'
import { KPICard } from '@/components/dashboard/kpi-card'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Users,
  BookOpen,
  CheckCircle,
  FlaskConical,
  GraduationCap,
  Calendar,
  Filter,
  Search,
  Briefcase,
  TrendingUp,
} from 'lucide-react'
import { formatNumber, formatDate, formatPercent } from '@/lib/formatters'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import Image from 'next/image'

export default function AlunosPage() {
  const [page, setPage] = useState(1)
  const [programa, setPrograma] = useState('all')
  const [status, setStatus] = useState('all')
  const [municipio, setMunicipio] = useState('')
  const [busca, setBusca] = useState('')

  const { data, isLoading, error } = useAlunosData(page, 20, programa, status, municipio, busca)

  const alunosData = useMemo(() => {
    if (!data?.data?.alunos) return []
    return data.data.alunos
  }, [data])

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid gap-6 md:grid-cols-6">
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

  const { alunos, pagination, filters } = data.data

  // Calcular totais
  const totalTrilhasInscritas = alunos.reduce(
    (acc, aluno) => acc + aluno.trilhasInscritas,
    0
  )
  const totalTrilhasConcluidas = alunos.reduce(
    (acc, aluno) => acc + aluno.trilhasConcluidas,
    0
  )
  const totalLabInscricoes = alunos.reduce(
    (acc, aluno) => acc + aluno.labInscricoes,
    0
  )
  const totalWorkInscricoes = alunos.reduce(
    (acc, aluno) => acc + aluno.workInscricoes,
    0
  )
  const totalMatriculasEdu = alunos.reduce(
    (acc, aluno) => acc + aluno.matriculasEdu,
    0
  )
  const progressoMedioGeral =
    alunos.length > 0
      ? alunos.reduce((acc, aluno) => acc + aluno.progressoGeral, 0) /
        alunos.length
      : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2">Alunos</h1>
        <p className="text-lg text-muted-foreground">
          Gestão completa de alunos do ecossistema OxeTech
        </p>
      </motion.div>

      {/* KPIs */}
      <div className="grid gap-6 md:grid-cols-6">
        <KPICard
          title="Total de Alunos"
          value={formatNumber(pagination.total)}
          icon={Users}
          delay={0}
        />
        <KPICard
          title="Trilhas Inscritas"
          value={formatNumber(totalTrilhasInscritas)}
          icon={BookOpen}
          delay={50}
        />
        <KPICard
          title="Trilhas Concluídas"
          value={formatNumber(totalTrilhasConcluidas)}
          icon={CheckCircle}
          delay={100}
        />
        <KPICard
          title="Lab Inscrições"
          value={formatNumber(totalLabInscricoes)}
          icon={FlaskConical}
          delay={150}
        />
        <KPICard
          title="Work Inscrições"
          value={formatNumber(totalWorkInscricoes)}
          icon={Briefcase}
          delay={200}
        />
        <KPICard
          title="Progresso Médio"
          value={formatPercent(progressoMedioGeral)}
          icon={TrendingUp}
          delay={250}
        />
      </div>

      {/* Filtros Avançados */}
      <Card
        className="border-0 shadow-soft"
        style={{ borderRadius: '22px' }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros Avançados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={busca}
                onChange={(e) => {
                  setBusca(e.target.value)
                  setPage(1)
                }}
                className="pl-10"
                style={{ borderRadius: '12px' }}
              />
            </div>
            <select
              value={programa}
              onChange={(e) => {
                setPrograma(e.target.value)
                setPage(1)
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              style={{ borderRadius: '12px' }}
            >
              <option value="all">Todos os Programas</option>
              <option value="work">Work</option>
              <option value="edu">Edu</option>
              <option value="trilhas">Trilhas</option>
              <option value="lab">Lab</option>
            </select>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                setPage(1)
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              style={{ borderRadius: '12px' }}
            >
              <option value="all">Todos os Status</option>
              <option value="VALIDADO">Validado</option>
              <option value="AGUARDANDO VALIDAÇÃO">Aguardando Validação</option>
            </select>
            <select
              value={municipio}
              onChange={(e) => {
                setMunicipio(e.target.value)
                setPage(1)
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              style={{ borderRadius: '12px' }}
            >
              <option value="">Todos os Municípios</option>
              {filters.municipios.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Alunos */}
      <Card
        className="border-0 shadow-soft overflow-hidden"
        style={{ borderRadius: '22px' }}
      >
        <CardHeader>
          <CardTitle>Lista de Alunos</CardTitle>
          <CardDescription>
            {pagination.total} aluno(s) encontrado(s)
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
                  <th className="text-center p-3 text-sm font-semibold text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
                    Programas
                  </th>
                  <th className="text-right p-3 text-sm font-semibold text-muted-foreground">
                    Progresso
                  </th>
                  <th className="text-left p-3 text-sm font-semibold text-muted-foreground">
                    Última Atividade
                  </th>
                  <th className="text-center p-3 text-sm font-semibold text-muted-foreground">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {alunos.map((aluno, index) => (
                  <motion.tr
                    key={aluno.id}
                    className="border-b hover:bg-muted/50 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {aluno.avatar_url ? (
                          <div className="relative h-10 w-10 rounded-full overflow-hidden">
                            <Image
                              src={aluno.avatar_url}
                              alt={aluno.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{aluno.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        {aluno.email && (
                          <div className="flex items-center gap-2">
                            <a
                              href={`mailto:${aluno.email}`}
                              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                              title={aluno.email}
                            >
                              📧 {aluno.email.length > 25 ? `${aluno.email.substring(0, 25)}...` : aluno.email}
                            </a>
                          </div>
                        )}
                        {aluno.telefone && (
                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${aluno.telefone.replace(/\D/g, '')}`}
                              className="text-sm text-green-600 hover:underline flex items-center gap-1"
                              title={aluno.telefone}
                            >
                              📱 {aluno.telefone}
                            </a>
                          </div>
                        )}
                        {!aluno.email && !aluno.telefone && (
                          <span className="text-xs text-muted-foreground">Sem contato</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {aluno.municipio}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={cn(
                          'rounded-full px-3 py-1 text-xs font-medium',
                          aluno.status === 'VALIDADO'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        )}
                      >
                        {aluno.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {aluno.programas.map((prog, idx) => (
                          <span
                            key={idx}
                            className="rounded-full px-2 py-1 text-xs font-medium bg-muted text-muted-foreground"
                          >
                            {prog}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span
                          className={cn(
                            'font-bold',
                            aluno.progressoGeral >= 70
                              ? 'text-green-600'
                              : aluno.progressoGeral >= 40
                              ? 'text-yellow-600'
                              : 'text-red-600'
                          )}
                        >
                          {formatPercent(aluno.progressoGeral)}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground text-sm">
                      {formatDate(aluno.ultimaAtividade)}
                    </td>
                    <td className="p-3 text-center">
                      <Link href={`/alunos/${aluno.id}`}>
                        <Button variant="ghost" size="sm" style={{ borderRadius: '8px' }}>
                          Ver detalhes
                        </Button>
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Página {pagination.page} de {pagination.totalPages} •{' '}
              {pagination.total} aluno(s) total(is)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{ borderRadius: '12px' }}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                disabled={page === pagination.totalPages}
                style={{ borderRadius: '12px' }}
              >
                Próxima
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
