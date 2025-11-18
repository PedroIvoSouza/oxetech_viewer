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

async function fetchCertificadosData(): Promise<CertificadosData> {
  const response = await fetch('/api/certificados')
  if (!response.ok) {
    throw new Error('Failed to fetch certificados data')
  }
  return response.json()
}

export function useCertificadosData() {
  return useQuery<CertificadosData, Error>({
    queryKey: ['certificados'],
    queryFn: fetchCertificadosData,
    refetchInterval: 60000,
  })
}

