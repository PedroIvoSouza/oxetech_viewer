import { useQuery } from '@tanstack/react-query'

interface CertificadosData {
  data: {
    stats: {
      totalCertificadosWork: number
      totalCertificadosEdu: number
      totalCertificadosTrilhas: number
      totalCertificadosLab: number
      totalCertificados: number
      totalAlunosCertificados: number
      alunosComMultiplosCertificados: number
    }
    alunosCertificados: Array<{
      id: number | undefined
      aluno: string
      email: string
      telefone: string
      municipio: string
      programas: string[]
      totalCertificados: number
      certificacoes: Array<{
        programa: string
        detalhes: string
        data: Date
      }>
    }>
    distribuicaoMunicipio: Array<{
      municipio: string
      total: number
    }>
    distribuicaoPrograma: {
      Work: number
      Edu: number
      Trilhas: number
      Lab: number
    }
    detalhesPorPrograma: {
      Work: Array<any>
      Edu: Array<any>
      Trilhas: Array<any>
      Lab: Array<any>
    }
  }
  error: string | null
}

import { safeFetch } from '@/lib/utils/api-helpers'

async function fetchCertificadosData(): Promise<CertificadosData> {
  try {
    const data = await safeFetch<CertificadosData>('/api/certificados')
    if (!data.data) {
      return {
        data: {
          stats: {
            totalCertificadosWork: 0,
            totalCertificadosEdu: 0,
            totalCertificadosTrilhas: 0,
            totalCertificadosLab: 0,
            totalCertificados: 0,
            totalAlunosCertificados: 0,
            alunosComMultiplosCertificados: 0,
          },
          alunosCertificados: [],
          distribuicaoMunicipio: [],
          distribuicaoPrograma: { Work: 0, Edu: 0, Trilhas: 0, Lab: 0 },
          detalhesPorPrograma: { Work: [], Edu: [], Trilhas: [], Lab: [] },
        },
        error: 'Dados não disponíveis',
      }
    }
    return data
  } catch (error) {
    console.error('Error fetching certificados data:', error)
    throw error
  }
}

export function useCertificadosData() {
  return useQuery<CertificadosData, Error>({
    queryKey: ['certificados'],
    queryFn: fetchCertificadosData,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 15 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}

