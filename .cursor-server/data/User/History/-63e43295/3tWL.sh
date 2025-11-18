#!/bin/bash
# Script para configurar firewall do Google Cloud para acesso externo ao Next.js

echo "🔥 Configurando Firewall do Google Cloud para Next.js..."
echo ""

# Verificar se a regra já existe
if gcloud compute firewall-rules describe allow-nextjs-port-3000 &>/dev/null; then
    echo "✅ Regra de firewall 'allow-nextjs-port-3000' já existe."
    echo "   Para atualizar, delete e recrie ou use 'gcloud compute firewall-rules update'"
    echo ""
    gcloud compute firewall-rules describe allow-nextjs-port-3000 --format="table(name,allowed[].ports,sourceRanges.list())"
else
    echo "📝 Criando regra de firewall 'allow-nextjs-port-3000'..."
    echo ""
    
    # Criar regra de firewall
    gcloud compute firewall-rules create allow-nextjs-port-3000 \
        --allow tcp:3000 \
        --source-ranges 0.0.0.0/0 \
        --description "Allow external access to Next.js on port 3000" \
        --direction INGRESS \
        --priority 1000
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Regra de firewall criada com sucesso!"
        echo ""
        echo "📋 Detalhes da regra:"
        gcloud compute firewall-rules describe allow-nextjs-port-3000 --format="table(name,allowed[].ports,sourceRanges.list(),direction,priority)"
        echo ""
        echo "🌐 Agora você pode acessar via:"
        IP_PUBLICO=$(curl -s ifconfig.me 2>/dev/null || curl -s icanhazip.com 2>/dev/null || echo "SEU_IP_PUBLICO")
        echo "   http://$IP_PUBLICO:3000"
        echo ""
    else
        echo "❌ Erro ao criar regra de firewall"
        exit 1
    fi
fi

echo ""
echo "⚠️  IMPORTANTE: Verifique se sua instância tem IP público configurado"
echo "   Para verificar: gcloud compute instances describe NOME_INSTANCIA --zone ZONA | grep natIP"
echo ""

