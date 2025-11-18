/**
 * React Query hooks para Business Intelligence (BI)
 */

import { useQuery } from '@tanstack/react-query'
import type {
  ImpactoSocial,
  EficaciaProgramas,
  TendenciasProjecoes,
  DesempenhoTerritorial,
  OportunidadesGaps,
  ROIEficiencia,
  AnaliseCompletaBI,
} from '@/lib/bi/analysis'

// ============================================
// 1. IMPACTO SOCIAL
// ============================================

interface ImpactoSocialResponse {
  data: ImpactoSocial
  error: string | null
}

async function fetchImpactoSocial(): Promise<ImpactoSocial> {
  const response = await fetch('/api/bi/impacto-social', {
    credentials: 'include',
  })
  const json: ImpactoSocialResponse = await response.json()
  if (!response.ok || json.error) {
    throw new Error(json.error || 'Erro ao buscar impacto social')
  }
  return json.data
}

export function useImpactoSocial() {
  return useQuery<ImpactoSocial, Error>({
    queryKey: ['bi', 'impacto-social'],
    queryFn: fetchImpactoSocial,
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
    refetchInterval: 15 * 60 * 1000, // Refetch a cada 15 minutos
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  })
}

// ============================================
// 2. EFICÁCIA DOS PROGRAMAS
// ============================================

interface EficaciaResponse {
  data: EficaciaProgramas
  error: string | null
}

async function fetchEficacia(): Promise<EficaciaProgramas> {
  const response = await fetch('/api/bi/eficacia')
  const json: EficaciaResponse = await response.json()
  if (!response.ok || json.error) {
    throw new Error(json.error || 'Erro ao buscar eficácia')
  }
  return json.data
}

export function useEficacia() {
  return useQuery<EficaciaProgramas, Error>({
    queryKey: ['bi', 'eficacia'],
    queryFn: fetchEficacia,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  })
}

// ============================================
// 3. TENDÊNCIAS E PROJEÇÕES
// ============================================

interface TendenciasResponse {
  data: TendenciasProjecoes
  error: string | null
}

async function fetchTendencias(): Promise<TendenciasProjecoes> {
  const response = await fetch('/api/bi/tendencias', {
    credentials: 'include',
  })
  const json: TendenciasResponse = await response.json()
  if (!response.ok || json.error) {
    throw new Error(json.error || 'Erro ao buscar tendências')
  }
  return json.data
}

export function useTendencias() {
  return useQuery<TendenciasProjecoes, Error>({
    queryKey: ['bi', 'tendencias'],
    queryFn: fetchTendencias,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  })
}

// ============================================
// 4. DESEMPENHO TERRITORIAL
// ============================================

interface TerritorialResponse {
  data: DesempenhoTerritorial
  error: string | null
}

async function fetchTerritorial(): Promise<DesempenhoTerritorial> {
  const response = await fetch('/api/bi/territorial', {
    credentials: 'include',
  })
  const json: TerritorialResponse = await response.json()
  if (!response.ok || json.error) {
    throw new Error(json.error || 'Erro ao buscar desempenho territorial')
  }
  return json.data
}

export function useTerritorial() {
  return useQuery<DesempenhoTerritorial, Error>({
    queryKey: ['bi', 'territorial'],
    queryFn: fetchTerritorial,
    staleTime: 15 * 60 * 1000, // 15 minutos
    gcTime: 30 * 60 * 1000,
    refetchInterval: 20 * 60 * 1000, // Refetch a cada 20 minutos
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  })
}

// ============================================
// 5. OPORTUNIDADES E GAPS
// ============================================

interface OportunidadesResponse {
  data: OportunidadesGaps
  error: string | null
}

async function fetchOportunidades(): Promise<OportunidadesGaps> {
  const response = await fetch('/api/bi/oportunidades', {
    credentials: 'include',
  })
  const json: OportunidadesResponse = await response.json()
  if (!response.ok || json.error) {
    throw new Error(json.error || 'Erro ao buscar oportunidades')
  }
  return json.data
}

export function useOportunidades() {
  return useQuery<OportunidadesGaps, Error>({
    queryKey: ['bi', 'oportunidades'],
    queryFn: fetchOportunidades,
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchInterval: 20 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  })
}

// ============================================
// 6. ROI E EFICIÊNCIA
// ============================================

interface ROIResponse {
  data: ROIEficiencia
  error: string | null
}

async function fetchROI(): Promise<ROIEficiencia> {
  const response = await fetch('/api/bi/roi')
  const json: ROIResponse = await response.json()
  if (!response.ok || json.error) {
    throw new Error(json.error || 'Erro ao buscar ROI')
  }
  return json.data
}

export function useROI() {
  return useQuery<ROIEficiencia, Error>({
    queryKey: ['bi', 'roi'],
    queryFn: fetchROI,
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchInterval: 20 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  })
}

// ============================================
// 7. ANÁLISE COMPLETA
// ============================================

interface AnaliseCompletaResponse {
  data: AnaliseCompletaBI
  error: string | null
}

async function fetchAnaliseCompleta(): Promise<AnaliseCompletaBI> {
  const response = await fetch('/api/bi/completa')
  const json: AnaliseCompletaResponse = await response.json()
  if (!response.ok || json.error) {
    throw new Error(json.error || 'Erro ao buscar análise completa')
  }
  return json.data
}

export function useAnaliseCompleta() {
  return useQuery<AnaliseCompletaBI, Error>({
    queryKey: ['bi', 'completa'],
    queryFn: fetchAnaliseCompleta,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  })
}

