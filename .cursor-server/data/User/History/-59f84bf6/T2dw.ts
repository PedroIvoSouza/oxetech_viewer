import { NextResponse } from 'next/server'

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export function successResponse<T>(data: T): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    data,
    error: null,
  })
}

export function errorResponse(
  error: string,
  status: number = 500
): NextResponse<ApiResponse<null>> {
  return NextResponse.json(
    {
      data: null,
      error,
    },
    { status }
  )
}

export function validatePage(page: string | null): number {
  const parsed = parseInt(page || '1')
  return isNaN(parsed) || parsed < 1 ? 1 : parsed
}

export function validateLimit(limit: string | null): number {
  const parsed = parseInt(limit || '20')
  if (isNaN(parsed) || parsed < 1) return 20
  if (parsed > 100) return 100
  return parsed
}

