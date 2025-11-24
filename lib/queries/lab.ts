import { useQuery } from '@tanstack/react-query'

interface LabData {
  data: {
    stats: {
      totalInscricoes: number
      inscricoesAtivas: number
      inscricoesFinalizadas: number
      inscricoesPorStatus: Array<{
        status: string
        total: number
      }>
      mediaPorLaboratorio: number
      totalVagas: number
      vagasOcupadas: number
      vagasLivres: number
      totalTurmas: number
      explicacao: {
        vagasCalculo: string
        inscricoesCalculo: string
        diferenca: string
      }
    }
    distribuicaoPorCurso: Array<{
      curso: string
      total: number
    }>
    cursosNormalizados: Array<{
      nomeOriginal: string
      nomeNormalizado: string
      categoria: string
      subcategoria?: string
      total: number
    }>
    cursosPorCategoria: Record<string, {
      total: number
      cursos: string[]
    }>
    cursosPorSubcategoria: Record<string, {
      total: number
      cursos: string[]
    }>
    inscricoesPorCursoNormalizado: Array<{
      nomeOriginal: string
      nomeNormalizado: string
      categoria: string
      subcategoria?: string
      total: number
    }>
    analisePorCurso: Array<{
      nomeOriginal: string
      nomeNormalizado: string
      categoria: string
      subcategoria?: string
      totalTurmas: number
      totalVagas: number
      vagasOcupadas: number
      vagasLivres: number
      taxaOcupacao: number
      totalInscricoes: number
      total: number
    }>
    evolucaoTemporal: Array<{
      mes: string
      inscricoes: number
    }>
    evolucaoSemanal: Array<{
      semana: string
      inscricoes: number
    }>
    inscricoesPorLaboratorio: Array<{
      laboratorio: string
      municipio: string
      totalInscricoes: number
      totalTurmas: number
      totalCursos: number
      vagasOcupadas: number
      vagasTotal: number
      vagasLivres: number
      taxaOcupacao: number
    }>
    inscricoes: Array<{
      id: number
      aluno: string
      email: string
      curso: string
      laboratorio: string
      municipio: string
      status: string
      dataInscricao: Date
    }>
    alunosCertificadosLab?: Array<{
      id: number | null
      aluno: string
      email: string
      telefone: string
      municipio: string
      curso: string
      cursoNormalizado: string
      laboratorio: string
      dataConclusao: Date
      status: string
    }>
    totalCertificadosLab?: number
  }
  error: string | null
}

import { safeFetch } from '@/lib/utils/api-helpers'

async function fetchLabData(): Promise<LabData> {
  try {
    const data = await safeFetch<LabData>('/api/lab')
    if (!data.data) {
      return {
        data: {
          stats: {
            totalInscricoes: 0,
            inscricoesAtivas: 0,
            inscricoesFinalizadas: 0,
            inscricoesPorStatus: [],
            mediaPorLaboratorio: 0,
            totalVagas: 0,
            vagasOcupadas: 0,
            vagasLivres: 0,
            totalTurmas: 0,
            explicacao: {
              vagasCalculo: '',
              inscricoesCalculo: '',
              diferenca: '',
            },
          },
          distribuicaoPorCurso: [],
          cursosNormalizados: [],
          cursosPorCategoria: {},
          cursosPorSubcategoria: {},
          inscricoesPorCursoNormalizado: [],
          analisePorCurso: [],
          evolucaoTemporal: [],
          evolucaoSemanal: [],
          inscricoesPorLaboratorio: [],
          inscricoes: [],
          alunosCertificadosLab: [],
          totalCertificadosLab: 0,
        },
        error: 'Dados não disponíveis',
      }
    }
    return data
  } catch (error) {
    console.error('Error fetching lab data:', error)
    throw error
  }
}

export function useLabData() {
  return useQuery<LabData, Error>({
    queryKey: ['lab'],
    queryFn: fetchLabData,
    staleTime: 3 * 60 * 1000, // 3 minutos
    gcTime: 10 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}

