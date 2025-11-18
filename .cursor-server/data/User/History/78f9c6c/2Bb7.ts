import { useQuery } from '@tanstack/react-query'

interface TrilhaData {
  data: {
    stats: {
      totalTrilhas: number
      totalInscritos: number
      totalConcluidos: number
      progressoMedioGeral: number
      conclusaoMediaModulo: number
    }
    trilhas: Array<{
      id: number
      titulo: string
      descricao: string
      carga_horaria: number
      created_at: Date
      updated_at: Date
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
      id: number
      trilha: string
      totalInscritos: number
      concluidos: number
      progressoMedio: number
      percentualConclusao: number
      totalModulos: number
      status: 'ativo' | 'inativo'
    }>
    topTrilhas: Array<{
      id: number
      trilha: string
      totalInscritos: number
      concluidos: number
      progressoMedio: number
      percentualConclusao: number
      totalModulos: number
      status: 'ativo' | 'inativo'
    }>
    evolucaoTemporal: Array<{
      mes: string
      inscricoes: number
    }>
    inscritos: Array<{
      id: number
      aluno: string
      email: string
      trilha: string
      concluido: boolean
      percentualConcluido: number
      dataInscricao: Date
    }>
  }
  error: string | null
}

async function fetchTrilhasData(
  periodo: string = 'all',
  busca: string = ''
): Promise<TrilhaData> {
  const params = new URLSearchParams()
  if (periodo) params.append('periodo', periodo)
  if (busca) params.append('busca', busca)

  const url = `/api/trilhas${params.toString() ? `?${params.toString()}` : ''}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch trilhas data')
  }
  return response.json()
}

export function useTrilhasData(periodo: string = 'all', busca: string = '') {
  return useQuery<TrilhaData, Error>({
    queryKey: ['trilhas', periodo, busca],
    queryFn: () => fetchTrilhasData(periodo, busca),
    refetchInterval: 60000,
  })
}
