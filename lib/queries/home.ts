import { useQuery } from '@tanstack/react-query'

interface HomeKPIs {
  totalAlunos: number
  totalEmpresas: number
  totalMatriculasEdu: number
  totalInscricoesWork: number
  totalVagasWork: number
  totalCandidaturasWork: number
  totalContratacoesWork: number
  totalTrilhas: number
  totalAtividadesConcluidas: number
  totalFrequencias: number
  totalInstrutores: number
  totalAgentes: number
  totalCertificados?: number
  totalCertificadosWork?: number
  totalCertificadosEdu?: number
  totalCertificadosTrilhas?: number
  totalCertificadosLab?: number
}

interface HomeData {
  data: {
    kpis: HomeKPIs & { totalMunicipios: number }
    evolucao12Meses: Array<{ mes: string; alunos: number }>
    evolucaoAlunos: Array<{ mes: string; total: number }>
    evolucaoWork: Array<{ mes: string; inscricoes: number }>
    funilWork: {
      inscricoes: number
      candidaturas: number
      contratacoes: number
    }
    conclusaoTrilhas: Array<{ trilha: string; total: number }>
    distribuicaoPrograma: {
      work: number
      edu: number
      lab: number
      trilhas: number
    }
  }
  error: string | null
}

async function fetchHomeData(): Promise<HomeData> {
  try {
    const response = await fetch('/api/home', {
      credentials: 'include',
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Failed to fetch home data: ${response.status}`)
    }
    const data = await response.json()
    // Garantir que a estrutura de dados está correta
    if (!data.data) {
      return {
        data: {
          kpis: {
            totalAlunos: 0,
            totalEmpresas: 0,
            totalMatriculasEdu: 0,
            totalInscricoesWork: 0,
            totalVagasWork: 0,
            totalCandidaturasWork: 0,
            totalContratacoesWork: 0,
            totalTrilhas: 0,
            totalAtividadesConcluidas: 0,
            totalFrequencias: 0,
            totalInstrutores: 0,
            totalAgentes: 0,
            totalCertificados: 0,
            totalCertificadosWork: 0,
            totalCertificadosEdu: 0,
            totalCertificadosTrilhas: 0,
            totalCertificadosLab: 0,
            totalMunicipios: 0,
          },
          evolucao12Meses: [],
          evolucaoAlunos: [],
          evolucaoWork: [],
          funilWork: { inscricoes: 0, candidaturas: 0, contratacoes: 0 },
          conclusaoTrilhas: [],
          distribuicaoPrograma: { work: 0, edu: 0, lab: 0, trilhas: 0 },
        },
        error: data.error || null,
      }
    }
    return data
  } catch (error) {
    console.error('Error fetching home data:', error)
    throw error instanceof Error ? error : new Error('Failed to fetch home data')
  }
}

export function useHomeData() {
  return useQuery<HomeData, Error>({
    queryKey: ['home'],
    queryFn: fetchHomeData,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (antigo cacheTime)
    refetchInterval: 5 * 60 * 1000, // Refetch a cada 5 minutos
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}

