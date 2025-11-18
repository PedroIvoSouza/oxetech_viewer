# Debug de Autenticação

## Problema
Erro "Unauthorized" ao acessar `/api/bi/lab-detalhado`

## Verificações Necessárias

### 1. Cookie está sendo setado?
- Nome: `oxetech-auth-token`
- HttpOnly: true
- Path: /
- SameSite: lax
- MaxAge: 8 horas

### 2. Cookie está sendo enviado?
- Verificar no DevTools → Application → Cookies
- Verificar se está presente em requisições (Network tab)

### 3. Middleware está verificando corretamente?
- Rota `/api/bi/lab-detalhado` está protegida? ✅ SIM (startsWith('/api'))
- Cookie está sendo lido? Verificar linha 68 do middleware.ts

### 4. Token JWT está válido?
- Verificar se não expirou
- Verificar se o secret está correto

## Solução

Se não estiver logado:
1. Acessar `/login`
2. Fazer login com credenciais:
   - Admin: admin@oxetech.al.gov.br / admin123
   - Gestor: gestor@oxetech.al.gov.br / gestor123
   - Visualização: visualizacao@oxetech.al.gov.br / view123

Se já estiver logado:
1. Verificar cookies no DevTools
2. Se cookie não existe, fazer logout e login novamente
3. Verificar console para erros de JWT

