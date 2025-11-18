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

async function fetchAlunoData(id: number) {
  const response = await fetch(`/api/alunos/${id}`)
  if (!response.ok) {
    throw new Error('Failed to fetch aluno data')
  }
  return response.json()
}

export function useAlunoData(id: number) {
  return useQuery({
    queryKey: ['aluno', id],
    queryFn: () => fetchAlunoData(id),
    enabled: !!id,
  })
}

