import { useQuery } from '@tanstack/react-query'

interface GeographicData {
  data: {
    distribuicao: Array<{
      municipio: string
      work: number
      edu: number
      lab: number
      trilhas: number
      total: number
      coordenadas?: {
        lat: number
        lng: number
      }
    }>
    totalMunicipios: number
    maxTotal: number
  }
  error: string | null
}

async function fetchGeographicData(): Promise<GeographicData> {
  const response = await fetch('/api/geographic')
  if (!response.ok) {
    throw new Error('Failed to fetch geographic data')
  }
  return response.json()
}

export function useGeographicData() {
  return useQuery<GeographicData, Error>({
    queryKey: ['geographic'],
    queryFn: fetchGeographicData,
    staleTime: 10 * 60 * 1000, // 10 minutos (dados geográficos mudam pouco)
    gcTime: 30 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

