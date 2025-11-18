'use client'

import { useState } from 'react'
import { useAlunosData } from '@/lib/queries/alunos'
import { KPICard } from '@/components/dashboard/kpi-card'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, BookOpen, CheckCircle, FlaskConical, GraduationCap, Calendar } from 'lucide-react'
import { formatNumber, formatDate } from '@/lib/formatters'
import Link from 'next/link'

export default function AlunosPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading, error } = useAlunosData(page, 20)

  if (isLoading) {
    return (
      <div className="space-y-6">
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

  const { alunos, pagination } = data

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
  const totalMatriculasLab = alunos.reduce(
    (acc, aluno) => acc + aluno.matriculasLab,
    0
  )
  const totalMatriculasEdu = alunos.reduce(
    (acc, aluno) => acc + aluno.matriculasEdu,
    0
  )
  const totalFrequencias = alunos.reduce(
    (acc, aluno) => acc + aluno.totalFrequencias,
    0
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Alunos</h1>
        <p className="text-muted-foreground">
          Lista de alunos do ecossistema OxeTech
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-6">
        <KPICard
          title="Total de Alunos"
          value={formatNumber(pagination.total)}
          icon={Users}
        />
        <KPICard
          title="Trilhas Inscritas"
          value={formatNumber(totalTrilhasInscritas)}
          icon={BookOpen}
        />
        <KPICard
          title="Trilhas Concluídas"
          value={formatNumber(totalTrilhasConcluidas)}
          icon={CheckCircle}
        />
        <KPICard
          title="Lab Inscrições"
          value={formatNumber(totalLabInscricoes)}
          icon={FlaskConical}
        />
        <KPICard
          title="Matrículas Edu"
          value={formatNumber(totalMatriculasEdu)}
          icon={GraduationCap}
        />
        <KPICard
          title="Frequências"
          value={formatNumber(totalFrequencias)}
          icon={Calendar}
        />
      </div>

      {/* Tabela de Alunos */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Alunos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Nome</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Cadastro</th>
                  <th className="text-right p-2">Trilhas</th>
                  <th className="text-right p-2">Lab</th>
                  <th className="text-right p-2">Edu</th>
                  <th className="text-right p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {alunos.map((aluno) => (
                  <tr key={aluno.id} className="border-b">
                    <td className="p-2 font-medium">{aluno.name}</td>
                    <td className="p-2 text-muted-foreground">
                      {aluno.email}
                    </td>
                    <td className="p-2">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          aluno.status === 'VALIDADO'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {aluno.status}
                      </span>
                    </td>
                    <td className="p-2 text-sm text-muted-foreground">
                      {formatDate(aluno.created_at)}
                    </td>
                    <td className="p-2 text-right">
                      {aluno.trilhasInscritas} ({aluno.trilhasConcluidas})
                    </td>
                    <td className="p-2 text-right">{aluno.labInscricoes}</td>
                    <td className="p-2 text-right">{aluno.matriculasEdu}</td>
                    <td className="p-2 text-right">
                      <Link href={`/alunos/${aluno.id}`}>
                        <Button variant="ghost" size="sm">
                          Ver detalhes
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Página {pagination.page} de {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
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

