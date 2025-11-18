'use client'

import { useParams } from 'next/navigation'
import { useAlunoData } from '@/lib/queries/alunos'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/formatters'

export default function AlunoDetailPage() {
  const params = useParams()
  const id = parseInt(params.id as string)
  const { data, isLoading, error } = useAlunoData(id)

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

  if (!data || !data.data?.aluno) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p>Aluno não encontrado</p>
      </div>
    )
  }

  const { aluno } = data.data

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/alunos">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{aluno.name}</h1>
          <p className="text-muted-foreground">{aluno.email}</p>
        </div>
      </div>

      {/* Informações Gerais */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Gerais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{aluno.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Telefone</p>
              <p className="font-medium">{aluno.telefone}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-medium">{aluno.status}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Data de Cadastro</p>
              <p className="font-medium">{formatDate(aluno.created_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trilhas */}
      {aluno.inscricoes_trilhas_alunos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Trilhas Inscritas</CardTitle>
            <CardDescription>
              {aluno.inscricoes_trilhas_alunos.length} trilha(s) inscrita(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aluno.inscricoes_trilhas_alunos.map((inscricao) => (
                <div
                  key={inscricao.id}
                  className="rounded-lg border p-4"
                >
                  <h3 className="font-semibold">
                    {inscricao.trilhas_de_conhecimento?.titulo || 'Sem título'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Status:{' '}
                    {inscricao.concluido ? (
                      <span className="text-green-600">Concluída</span>
                    ) : (
                      <span className="text-yellow-600">Em andamento</span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Módulos concluídos:{' '}
                    {
                      inscricao.modulos_trilhas_alunos.filter(
                        (m) => m.curso_concluido && m.atividade_concluida
                      ).length
                    }{' '}
                    de {inscricao.modulos_trilhas_alunos.length}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lab */}
      {aluno.oxetechlab_inscricoes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>OxeTech Lab</CardTitle>
            <CardDescription>
              {aluno.oxetechlab_inscricoes.length} inscrição(ões) no Lab
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aluno.oxetechlab_inscricoes.map((inscricao) => (
                <div key={inscricao.id} className="rounded-lg border p-4">
                  <h3 className="font-semibold">
                    {inscricao.turmas?.titulo || 'Sem título'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Laboratório:{' '}
                    {inscricao.turmas?.laboratorios?.nome || 'Sem laboratório'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Status: {inscricao.status}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Matrículas Edu */}
      {aluno.matriculas_oxetech_edu.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Matrículas OxeTech Edu</CardTitle>
            <CardDescription>
              {aluno.matriculas_oxetech_edu.length} matrícula(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aluno.matriculas_oxetech_edu.map((matricula) => (
                <div key={matricula.id} className="rounded-lg border p-4">
                  <h3 className="font-semibold">
                    {matricula.escolas_oxetech_edu?.nome || 'Sem escola'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Status: {matricula.status}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Faltas: {matricula.faltas}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

