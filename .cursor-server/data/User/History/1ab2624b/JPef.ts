import { useQuery } from '@tanstack/react-query'

// Lab Monitor
export interface LabMonitorData {
  data: {
    turmasAbertasHoje: number
    turmasComPresenca: Array<any>
    rankingEscolas: Array<any>
    heatmapSemanal: Array<any>
    turmasCriticas: Array<any>
    turmasSemPresenca: Array<any>
    professoresEvasao: Array<any>
    alertas: Array<any>
    auditoria: Array<any>
    stats: {
      totalTurmas: number
      totalAlunos: number
      mediaFrequencia: number
      totalAlertas: number
      totalAuditoria: number
    }
  }
  error: string | null
}

async function fetchLabMonitorData(): Promise<LabMonitorData> {
  const response = await fetch('/api/monitor/lab')
  if (!response.ok) {
    throw new Error('Failed to fetch lab monitor data')
  }
  return response.json()
}

export function useLabMonitorData() {
  return useQuery<LabMonitorData, Error>({
    queryKey: ['monitor-lab'],
    queryFn: fetchLabMonitorData,
    staleTime: 1 * 60 * 1000, // 1 minuto (tempo real)
    gcTime: 5 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000, // Refetch a cada 2 minutos
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}

// Work Monitor
export interface WorkMonitorData {
  data: {
    funilCompleto: any
    ciclos: Array<any>
    empresasPorStatus: any
    empresasSemVaga: number
    retencao: any
    alertas: Array<any>
    auditoria: Array<any>
    stats: any
  }
  error: string | null
}

async function fetchWorkMonitorData(): Promise<WorkMonitorData> {
  const response = await fetch('/api/monitor/work')
  if (!response.ok) {
    throw new Error('Failed to fetch work monitor data')
  }
  return response.json()
}

export function useWorkMonitorData() {
  return useQuery<WorkMonitorData, Error>({
    queryKey: ['monitor-work'],
    queryFn: fetchWorkMonitorData,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 10 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}

// Trilhas Monitor
export interface TrilhasMonitorData {
  data: {
    trilhasComMetricas: Array<any>
    trilhasBaixaConclusao: Array<any>
    trilhasQueda: Array<any>
    totalModulosAbandonados: number
    acessosPorPeriodo: Array<any>
    engajamentoSemanal: Array<any>
    alertas: Array<any>
    stats: any
  }
  error: string | null
}

async function fetchTrilhasMonitorData(): Promise<TrilhasMonitorData> {
  const response = await fetch('/api/monitor/trilhas')
  if (!response.ok) {
    throw new Error('Failed to fetch trilhas monitor data')
  }
  return response.json()
}

export function useTrilhasMonitorData() {
  return useQuery<TrilhasMonitorData, Error>({
    queryKey: ['monitor-trilhas'],
    queryFn: fetchTrilhasMonitorData,
    staleTime: 3 * 60 * 1000, // 3 minutos
    gcTime: 10 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}

// Edu Monitor
export interface EduMonitorData {
  data: {
    escolasComFrequencia: Array<any>
    escolasBaixaFrequencia: Array<any>
    cursosComEvasao: Array<any>
    cursosAltaEvasao: Array<any>
    rankingEscolas: Array<any>
    heatmapHorario: Array<any>
    aulasSemPresenca: number
    professoresVariacao: Array<any>
    alertas: Array<any>
    stats: any
  }
  error: string | null
}

async function fetchEduMonitorData(): Promise<EduMonitorData> {
  const response = await fetch('/api/monitor/edu')
  if (!response.ok) {
    throw new Error('Failed to fetch edu monitor data')
  }
  return response.json()
}

export function useEduMonitorData() {
  return useQuery<EduMonitorData, Error>({
    queryKey: ['monitor-edu'],
    queryFn: fetchEduMonitorData,
    staleTime: 3 * 60 * 1000, // 3 minutos
    gcTime: 10 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}

// Executivo Monitor
export interface ExecutivoMonitorData {
  data: {
    impactoSocial: any
    participantesAtivos: any
    indicadoresTerritoriais: any
    execucaoMetas: any
    okrs: Array<any>
    tendencias: Array<any>
    oportunidades: Array<any>
    stats: any
  }
  error: string | null
}

async function fetchExecutivoMonitorData(): Promise<ExecutivoMonitorData> {
  const response = await fetch('/api/monitor/executivo')
  if (!response.ok) {
    throw new Error('Failed to fetch executivo monitor data')
  }
  return response.json()
}

export function useExecutivoMonitorData() {
  return useQuery<ExecutivoMonitorData, Error>({
    queryKey: ['monitor-executivo'],
    queryFn: fetchExecutivoMonitorData,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 15 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}

