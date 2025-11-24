/**
 * Funções auxiliares para chamadas de API
 */

export async function safeFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, {
      credentials: 'include',
      ...options,
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.error || errorData.message || `Failed to fetch: ${response.status}`
      )
    }
    
    return response.json()
  } catch (error) {
    console.error(`Error fetching ${url}:`, error)
    throw error instanceof Error ? error : new Error(`Failed to fetch ${url}`)
  }
}

