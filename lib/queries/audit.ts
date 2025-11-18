import { useQuery } from '@tanstack/react-query'
import type { AuditoriaCompleta } from '@/lib/audit/ai-auditor'

interface AuditResponse {
  data: AuditoriaCompleta
  error: string | null
}

async function fetchAudit(): Promise<AuditoriaCompleta> {
  const response = await fetch('/api/audit', {
    credentials: 'include',
  })
  const json: AuditResponse = await response.json()
  if (!response.ok || json.error) {
    throw new Error(json.error || 'Erro ao buscar auditoria')
  }
  return json.data
}

export function useAudit() {
  return useQuery<AuditoriaCompleta, Error>({
    queryKey: ['audit'],
    queryFn: fetchAudit,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
    refetchInterval: 10 * 60 * 1000, // Refetch a cada 10 minutos
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  })
}

