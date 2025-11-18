import { NextResponse } from 'next/server'
import { generateToken } from '@/middleware'
import type { UserRole } from '@/middleware'

export const dynamic = 'force-dynamic'

// Mock de usuários (em produção, usar banco de dados)
const USERS = [
  {
    id: '1',
    email: 'admin@oxetech.al.gov.br',
    password: 'admin123', // Em produção, usar hash bcrypt
    role: 'admin' as UserRole,
    name: 'Administrador',
  },
  {
    id: '2',
    email: 'gestor@oxetech.al.gov.br',
    password: 'gestor123',
    role: 'gestor' as UserRole,
    name: 'Gestor',
  },
  {
    id: '3',
    email: 'visualizacao@oxetech.al.gov.br',
    password: 'view123',
    role: 'visualizacao' as UserRole,
    name: 'Visualização',
  },
]

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar usuário (em produção, consultar banco)
    const user = USERS.find((u) => u.email === email && u.password === password)

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    // Gerar token
    const token = await generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    })

    // Criar resposta com cookie HttpOnly
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    })

    // Configurar cookie HttpOnly
    response.cookies.set('oxetech-auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 horas
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Error in login:', error)
    return NextResponse.json(
      { error: 'Erro ao realizar login' },
      { status: 500 }
    )
  }
}

