import { useQuery } from '@tanstack/react-query'

// Monitor Lab
interface LabMonitorData {
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
  if (!response.ok) throw new Error('Failed to fetch lab monitor data')
  return response.json()
}

export function useLabMonitorData() {
  return useQuery<LabMonitorData, Error>({
    queryKey: ['monitor-lab'],
    queryFn: fetchLabMonitorData,
    staleTime: 1 * 60 * 1000, // 1 minuto
    refetchInterval: 2 * 60 * 1000, // 2 minutos
  })
}

// Monitor Work
interface WorkMonitorData {
  data: {
    funilCompleto: Record<string, number>
    ciclos: Array<any>
    empresasPorStatus: Record<string, number>
    empresasSemVaga: number
    retencao: Record<string, number>
    alertas: Array<any>
    auditoria: Array<any>
    stats: Record<string, number>
  }
  error: string | null
}

async function fetchWorkMonitorData(): Promise<WorkMonitorData> {
  const response = await fetch('/api/monitor/work')
  if (!response.ok) throw new Error('Failed to fetch work monitor data')
  return response.json()
}

export function useWorkMonitorData() {
  return useQuery<WorkMonitorData, Error>({
    queryKey: ['monitor-work'],
    queryFn: fetchWorkMonitorData,
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 5 * 60 * 1000, // 5 minutos
  })
}

// Monitor Trilhas
interface TrilhasMonitorData {
  data: {
    trilhasComMetricas: Array<any>
    trilhasBaixaConclusao: Array<any>
    trilhasQueda: Array<any>
    modulosAbandonados: number
    engajamentoPorPeriodo: Array<any>
    alertas: Array<any>
    stats: Record<string, number>
  }
  error: string | null
}

async function fetchTrilhasMonitorData(): Promise<TrilhasMonitorData> {
  const response = await fetch('/api/monitor/trilhas')
  if (!response.ok) throw new Error('Failed to fetch trilhas monitor data')
  return response.json()
}

export function useTrilhasMonitorData() {
  return useQuery<TrilhasMonitorData, Error>({
    queryKey: ['monitor-trilhas'],
    queryFn: fetchTrilhasMonitorData,
    staleTime: 3 * 60 * 1000, // 3 minutos
    refetchInterval: 5 * 60 * 1000, // 5 minutos
  })
}

// Monitor Edu
interface EduMonitorData {
  data: {
    escolasComFrequencia: Array<any>
    rankingEscolas: Array<any>
    cursosComEvasao: Array<any>
    cursosAltaEvasao: Array<any>
    heatmapHorarios: Array<any>
    alertas: Array<any>
    stats: Record<string, number>
  }
  error: string | null
}

async function fetchEduMonitorData(): Promise<EduMonitorData> {
  const response = await fetch('/api/monitor/edu')
  if (!response.ok) throw new Error('Failed to fetch edu monitor data')
  return response.json()
}

export function useEduMonitorData() {
  return useQuery<EduMonitorData, Error>({
    queryKey: ['monitor-edu'],
    queryFn: fetchEduMonitorData,
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 5 * 60 * 1000, // 5 minutos
  })
}

// Painel Executivo
interface ExecutivoData {
  data: {
    kpis: Record<string, number>
    participantesAtivos: Record<string, number>
    impactoSocial: Record<string, number>
    okrs: Array<any>
    tendencias: Record<string, number>
    stats: Record<string, number>
  }
  error: string | null
}

async function fetchExecutivoData(): Promise<ExecutivoData> {
  const response = await fetch('/api/monitor/executivo')
  if (!response.ok) throw new Error('Failed to fetch executive panel data')
  return response.json()
}

export function useExecutivoData() {
  return useQuery<ExecutivoData, Error>({
    queryKey: ['monitor-executivo'],
    queryFn: fetchExecutivoData,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 10 * 60 * 1000, // 10 minutos
  })
}
