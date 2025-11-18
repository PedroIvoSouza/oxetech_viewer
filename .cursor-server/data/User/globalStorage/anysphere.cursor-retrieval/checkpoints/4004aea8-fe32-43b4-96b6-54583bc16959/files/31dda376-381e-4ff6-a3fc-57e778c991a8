import { useQuery } from '@tanstack/react-query'

interface TrilhaData {
  trilhas: Array<{
    id: number
    titulo: string
    descricao: string
    carga_horaria: number
    created_at: Date
    modulos_trilhas: Array<{
      id: number
      curso_id: number
      cursos: {
        id: number
        titulo: string
        descricao: string
      }
      modulos_trilhas_pdfs: Array<{
        id: number
        nome: string
      }>
    }>
  }>
  progressoPorTrilha: Array<{
    trilha: string
    totalInscritos: number
    concluidos: number
    progressoMedio: number
  }>
  inscritos: Array<{
    id: number
    aluno: string
    email: string
    trilha: string
    concluido: boolean
    percentualConcluido: number
  }>
}

async function fetchTrilhasData(): Promise<TrilhaData> {
  const response = await fetch('/api/trilhas')
  if (!response.ok) {
    throw new Error('Failed to fetch trilhas data')
  }
  return response.json()
}

export function useTrilhasData() {
  return useQuery<TrilhaData, Error>({
    queryKey: ['trilhas'],
    queryFn: fetchTrilhasData,
    refetchInterval: 60000,
  })
}

