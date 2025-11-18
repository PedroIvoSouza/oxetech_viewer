/**
 * Análise Geográfica - Distribuição dos Programas por Município
 */

export interface DistribuicaoMunicipio {
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
}

// Coordenadas aproximadas dos principais municípios de Alagoas
const coordenadasMunicipios: Record<string, { lat: number; lng: number }> = {
  'Maceió': { lat: -9.5713, lng: -36.7820 },
  'Arapiraca': { lat: -9.7525, lng: -36.6611 },
  'Palmeira dos Índios': { lat: -9.4058, lng: -36.6228 },
  'Rio Largo': { lat: -9.4783, lng: -35.8394 },
  'Penedo': { lat: -10.2903, lng: -36.5858 },
  'União dos Palmares': { lat: -9.1597, lng: -36.0319 },
  'São Miguel dos Campos': { lat: -9.7833, lng: -36.0967 },
  'Marechal Deodoro': { lat: -9.7167, lng: -35.8833 },
  'Coruripe': { lat: -10.1275, lng: -36.1756 },
  'Santana do Ipanema': { lat: -9.3667, lng: -37.2500 },
  'Pilar': { lat: -9.6000, lng: -36.0167 },
  'São Luís do Quitunde': { lat: -9.3167, lng: -35.5667 },
  'Murici': { lat: -9.3167, lng: -35.9167 },
  'Mata Grande': { lat: -9.1167, lng: -37.7333 },
  'Viçosa': { lat: -9.3667, lng: -36.2333 },
}

export function normalizarNomeMunicipio(municipio: string): string {
  if (!municipio) return 'Desconhecido'
  
  // Normalizar capitalização
  const palavras = municipio.toLowerCase().split(' ')
  const normalizado = palavras
    .map(palavra => {
      // Preposições devem ficar minúsculas
      if (['de', 'da', 'do', 'dos', 'das'].includes(palavra)) {
        return palavra
      }
      return palavra.charAt(0).toUpperCase() + palavra.slice(1)
    })
    .join(' ')
  
  return normalizado.trim()
}

export function obterCoordenadas(municipio: string): { lat: number; lng: number } | undefined {
  const normalizado = normalizarNomeMunicipio(municipio)
  return coordenadasMunicipios[normalizado]
}

export function calcularIntensidade(total: number, maxTotal: number): number {
  if (maxTotal === 0) return 0
  return (total / maxTotal) * 100 // 0-100%
}

export function obterCorPorIntensidade(intensidade: number): string {
  if (intensidade >= 80) return '#B30000' // Vermelho escuro
  if (intensidade >= 60) return '#FF6A00' // Laranja
  if (intensidade >= 40) return '#F7A600' // Amarelo
  if (intensidade >= 20) return '#0A64C2' // Azul
  return '#E5E7EB' // Cinza claro
}

