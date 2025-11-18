/**
 * Página de teste para debug
 */

export default function TestPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-4xl font-bold text-foreground mb-4">
        Página de Teste
      </h1>
      <p className="text-lg text-foreground">
        Se você está vendo isso, o layout está funcionando.
      </p>
      <div className="mt-8 p-4 bg-card rounded-lg border border-border">
        <p className="text-foreground">Card de teste</p>
      </div>
    </div>
  )
}

