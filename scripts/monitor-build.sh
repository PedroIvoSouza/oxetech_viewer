#!/bin/bash

# Script para monitorar o progresso do build e estimar tempo restante

echo "🔍 Monitorando build do Next.js..."
echo ""

# Verifica se há build em andamento
BUILD_PID=$(pgrep -f "next build" | head -1)

if [ -z "$BUILD_PID" ]; then
    echo "❌ Nenhum build em andamento encontrado"
    
    # Verifica se há BUILD_ID (build concluído)
    if [ -f ".next/BUILD_ID" ]; then
        echo "✅ Build já foi concluído!"
        BUILD_TIME=$(stat -c %y .next/BUILD_ID 2>/dev/null | cut -d' ' -f2 | cut -d'.' -f1)
        echo "   Concluído em: $BUILD_TIME"
    else
        echo "⚠️  Build pode ter falhado ou ainda não foi iniciado"
    fi
    exit 0
fi

echo "📊 Build em andamento (PID: $BUILD_PID)"
echo ""

# Estatísticas do processo
ELAPSED=$(ps -p $BUILD_PID -o etime= | tr -d ' ')
CPU=$(ps -p $BUILD_PID -o %cpu= | tr -d ' ')
MEM=$(ps -p $BUILD_PID -o %mem= | tr -d ' ')

echo "⏱️  Tempo decorrido: $ELAPSED"
echo "💻 Uso de CPU: ${CPU}%"
echo "🧠 Uso de Memória: ${MEM}%"
echo ""

# Conta arquivos gerados
TOTAL_FILES=$(find .next -type f -name "*.js" 2>/dev/null | wc -l)
SERVER_FILES=$(find .next/server -type f 2>/dev/null | wc -l)
STATIC_FILES=$(find .next/static -type f 2>/dev/null | wc -l)

echo "📁 Arquivos gerados:"
echo "   Total JS: $TOTAL_FILES"
echo "   Server: $SERVER_FILES"
echo "   Static: $STATIC_FILES"
echo ""

# Tamanho do build
BUILD_SIZE=$(du -sh .next 2>/dev/null | cut -f1)
echo "💾 Tamanho do build: $BUILD_SIZE"
echo ""

# Estimativa baseada em projetos similares
# Para VM f1-micro com 123 arquivos, build típico leva 3-8 minutos
echo "⏳ Estimativa de tempo restante:"
if [ $TOTAL_FILES -lt 100 ]; then
    echo "   🟡 Fase inicial - Ainda compilando..."
    echo "   ⏱️  Estimativa: 4-6 minutos restantes"
elif [ $TOTAL_FILES -lt 300 ]; then
    echo "   🟢 Fase intermediária - Compilando e otimizando..."
    echo "   ⏱️  Estimativa: 2-4 minutos restantes"
elif [ $TOTAL_FILES -lt 400 ]; then
    echo "   🔵 Fase final - Gerando assets estáticos..."
    echo "   ⏱️  Estimativa: 1-2 minutos restantes"
else
    echo "   ✅ Quase concluído - Finalizando..."
    echo "   ⏱️  Estimativa: menos de 1 minuto"
fi

echo ""
echo "💡 Dica: Para ver logs em tempo real, use:"
echo "   tail -f .next/trace (se disponível)"

