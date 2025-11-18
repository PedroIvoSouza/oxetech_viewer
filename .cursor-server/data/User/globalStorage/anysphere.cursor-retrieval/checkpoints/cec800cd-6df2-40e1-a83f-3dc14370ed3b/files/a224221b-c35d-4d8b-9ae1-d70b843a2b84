import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify, SignJWT } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'oxetech-dashboard-secret-key-change-in-production'
)

const COOKIE_NAME = 'oxetech-auth-token'

// Tipos de usuário e suas permissões
export type UserRole = 'admin' | 'gestor' | 'visualizacao' | 'publico'

interface UserPayload {
  id: string
  email: string
  role: UserRole
  name?: string
}

/**
 * Middleware principal
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Log da requisição
  const startTime = Date.now()
  const logData = {
    path: pathname,
    method: request.method,
    ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
    origin: request.headers.get('origin') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    timestamp: new Date().toISOString(),
  }

  // Rotas públicas (sem autenticação) - VERIFICAR PRIMEIRO
  const publicRoutes = [
    '/api/public', 
    '/api/auth/login', 
    '/api/auth/logout',
    '/login', 
    '/_next', 
    '/favicon.ico'
  ]
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // Se for rota pública, permitir acesso imediatamente
  if (isPublicRoute) {
    const response = NextResponse.next()
    logRequest(logData, Date.now() - startTime, response.status)
    return response
  }

  // Rotas de API protegidas (excluir rotas públicas de autenticação)
  const isApiRoute = pathname.startsWith('/api') && 
    !pathname.startsWith('/api/public') &&
    !pathname.startsWith('/api/auth/login') &&
    !pathname.startsWith('/api/auth/logout')

  // Rotas do dashboard protegidas
  const isDashboardRoute =
    pathname.startsWith('/work') ||
    pathname.startsWith('/edu') ||
    pathname.startsWith('/trilhas') ||
      pathname.startsWith('/lab') ||
    pathname.startsWith('/alunos') ||
    pathname.startsWith('/mapa') ||
    pathname.startsWith('/certificados') ||
    pathname.startsWith('/relatorios') ||
    pathname.startsWith('/exec') ||
    pathname.startsWith('/gestao') ||
    pathname.startsWith('/bi') ||
    pathname.startsWith('/audit') ||
    pathname.startsWith('/debug') ||
    (pathname === '/' && pathname.length > 1)

  // Verificar autenticação para rotas protegidas
  if (isApiRoute || isDashboardRoute) {
    const token = request.cookies.get(COOKIE_NAME)?.value

    if (!token) {
      // Se for API, retornar 401
      if (isApiRoute) {
        const response = NextResponse.json(
          { error: 'Unauthorized', message: 'Token de autenticação necessário' },
          { status: 401 }
        )
        logRequest(logData, Date.now() - startTime, 401)
        return response
      }

      // Se for dashboard, redirecionar para login
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      const response = NextResponse.redirect(loginUrl)
      logRequest(logData, Date.now() - startTime, 302)
      return response
    }

    try {
      // Verificar JWT
      const { payload } = await jwtVerify(token, JWT_SECRET)
      const user: UserPayload = {
        id: String(payload.id || ''),
        email: String(payload.email || ''),
        role: (payload.role || 'publico') as UserRole,
        name: payload.name ? String(payload.name) : undefined,
      }

      // Verificar permissões (RBAC)
      if (isApiRoute && !hasApiAccess(user.role)) {
        const response = NextResponse.json(
          { error: 'Forbidden', message: 'Acesso negado' },
          { status: 403 }
        )
        logRequest(logData, Date.now() - startTime, 403, user)
        return response
      }

      if (isDashboardRoute && !hasDashboardAccess(user.role, pathname)) {
        const loginUrl = new URL('/login', request.url)
        const response = NextResponse.redirect(loginUrl)
        logRequest(logData, Date.now() - startTime, 403, user)
        return response
      }

      // Adicionar user ao header para uso nas rotas
      const response = NextResponse.next()
      response.headers.set('x-user-id', user.id)
      response.headers.set('x-user-role', user.role)

      logRequest(logData, Date.now() - startTime, 200, user)
      return response
    } catch (error) {
      // Token inválido ou expirado
      console.error('JWT verification error:', error)
      const response = isApiRoute
        ? NextResponse.json({ 
            error: 'Unauthorized', 
            message: error instanceof Error ? error.message : 'Token inválido ou expirado' 
          }, { status: 401 })
        : NextResponse.redirect(new URL('/login', request.url))

      logRequest(logData, Date.now() - startTime, 401)
      return response
    }
  }

  const response = NextResponse.next()
  logRequest(logData, Date.now() - startTime, response.status)
  return response
}

/**
 * Verificar acesso à API
 */
function hasApiAccess(role: UserRole): boolean {
  return role !== 'publico'
}

/**
 * Verificar acesso ao dashboard
 */
function hasDashboardAccess(role: UserRole, path: string): boolean {
  if (role === 'publico') return false
  if (role === 'admin' || role === 'gestor') return true

  // Visualização: acesso somente leitura
  if (role === 'visualizacao') {
    return !path.includes('/relatorios') && !path.includes('/exec') && !path.includes('/gestao')
  }

  return false
}

/**
 * Log de requisições
 */
function logRequest(
  logData: any,
  duration: number,
  status: number,
  user?: UserPayload
): void {
  const log = {
    ...logData,
    duration: `${duration}ms`,
    status,
    user: user
      ? {
          id: user.id,
          email: user.email,
          role: user.role,
        }
      : null,
  }

  // Em produção, usar logger (Winston, Pino, etc.)
  if (process.env.NODE_ENV === 'production') {
    console.log(JSON.stringify(log))
  } else {
    console.log(`[${status}] ${logData.method} ${logData.path} - ${duration}ms`)
  }
}

/**
 * Gerar token JWT
 */
export async function generateToken(payload: UserPayload): Promise<string> {
  const jwtPayload: Record<string, string> = {
    id: payload.id,
    email: payload.email,
    role: payload.role,
  }
  if (payload.name) {
    jwtPayload.name = payload.name
  }

  return await new SignJWT(jwtPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(JWT_SECRET)
}

/**
 * Configuração do middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

