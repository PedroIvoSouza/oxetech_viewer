import { useQuery } from '@tanstack/react-query'

interface AlunoData {
  id: number
  name: string
  email: string
  telefone: string
  municipio: string
  status: string
  avatar_url: string | null
  created_at: Date
  trilhasInscritas: number
  trilhasConcluidas: number
  progressoGeral: number
  labInscricoes: number
  matriculasLab: number
  matriculasEdu: number
  workInscricoes: number
  totalFrequencias: number
  ultimaAtividade: Date
  programas: string[]
}

interface AlunosData {
  data: {
    alunos: AlunoData[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
    filters: {
      municipios: string[]
    }
  }
  error: string | null
}

async function fetchAlunosData(
  page = 1,
  limit = 20,
  programa = 'all',
  status = 'all',
  municipio = '',
  busca = ''
): Promise<AlunosData> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  })

  if (programa !== 'all') params.append('programa', programa)
  if (status !== 'all') params.append('status', status)
  if (municipio) params.append('municipio', municipio)
  if (busca) params.append('busca', busca)

  const response = await fetch(`/api/alunos?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch alunos data')
  }
  return response.json()
}

export function useAlunosData(
  page = 1,
  limit = 20,
  programa = 'all',
  status = 'all',
  municipio = '',
  busca = ''
) {
  return useQuery<AlunosData, Error>({
    queryKey: ['alunos', page, limit, programa, status, municipio, busca],
    queryFn: () => fetchAlunosData(page, limit, programa, status, municipio, busca),
    refetchInterval: 60000,
  })
}

interface AlunoDetalhadoData {
  data: {
    aluno: {
      id: number
      name: string
      email: string
      telefone: string | null
      status: string
      created_at: Date
      inscricoes_trilhas_alunos: Array<{
        id: number
        concluido: boolean
        trilhas_de_conhecimento: {
          titulo: string | null
        } | null
        modulos_trilhas_alunos: Array<{
          curso_concluido: boolean
          atividade_concluida: boolean
        }>
      }>
      oxetechlab_inscricoes: Array<{
        id: number
        status: string
        turmas: {
          titulo: string | null
          laboratorios: {
            nome: string | null
          } | null
        } | null
      }>
      matriculas_oxetech_edu: Array<{
        id: number
        status: string
        faltas: number | null
        escolas_oxetech_edu: {
          nome: string | null
        } | null
      }>
    }
  }
  error: string | null
}

async function fetchAlunoData(id: number): Promise<AlunoDetalhadoData> {
  const response = await fetch(`/api/alunos/${id}`)
  if (!response.ok) {
    throw new Error('Failed to fetch aluno data')
  }
  return response.json()
}

export function useAlunoData(id: number) {
  return useQuery<AlunoDetalhadoData, Error>({
    queryKey: ['aluno', id],
    queryFn: () => fetchAlunoData(id),
    enabled: !!id,
  })
}

