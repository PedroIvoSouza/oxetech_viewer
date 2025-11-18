import { useQuery } from '@tanstack/react-query'

interface AlunoData {
  id: number
  name: string
  email: string
  telefone: string
  status: string
  created_at: Date
  trilhasInscritas: number
  trilhasConcluidas: number
  labInscricoes: number
  matriculasLab: number
  matriculasEdu: number
  totalFrequencias: number
}

interface AlunosData {
  alunos: AlunoData[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

async function fetchAlunosData(page = 1, limit = 20): Promise<AlunosData> {
  const response = await fetch(`/api/alunos?page=${page}&limit=${limit}`)
  if (!response.ok) {
    throw new Error('Failed to fetch alunos data')
  }
  return response.json()
}

export function useAlunosData(page = 1, limit = 20) {
  return useQuery<AlunosData, Error>({
    queryKey: ['alunos', page, limit],
    queryFn: () => fetchAlunosData(page, limit),
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

