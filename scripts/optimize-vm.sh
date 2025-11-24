#!/bin/bash

# Script de otimização completa para VM com poucos recursos
# Aplica configurações ideais para máquinas f1-micro (3.8GB RAM, 2 CPUs)

set -e

echo "🚀 Iniciando otimização da VM..."

# 1. Otimizar Swappiness (reduz uso de swap, melhora performance)
echo "📊 Otimizando swappiness..."
if ! grep -q "vm.swappiness" /etc/sysctl.conf; then
    echo "vm.swappiness=10" | sudo tee -a /etc/sysctl.conf
    echo "vm.vfs_cache_pressure=50" | sudo tee -a /etc/sysctl.conf
    echo "vm.dirty_ratio=15" | sudo tee -a /etc/sysctl.conf
    echo "vm.dirty_background_ratio=5" | sudo tee -a /etc/sysctl.conf
    sudo sysctl -p
    echo "✅ Swappiness otimizado para 10 (ideal para VMs pequenas)"
else
    echo "⚠️  Swappiness já configurado"
fi

# 2. Otimizar PostgreSQL
echo "🐘 Otimizando PostgreSQL..."
if [ -f /etc/postgresql/13/main/postgresql.conf ]; then
    sudo sed -i 's/^shared_buffers = .*/shared_buffers = 64MB/' /etc/postgresql/13/main/postgresql.conf
    sudo sed -i 's/^max_connections = .*/max_connections = 20/' /etc/postgresql/13/main/postgresql.conf
    sudo sed -i 's/^#work_mem = .*/work_mem = 4MB/' /etc/postgresql/13/main/postgresql.conf
    sudo sed -i 's/^#maintenance_work_mem = .*/maintenance_work_mem = 32MB/' /etc/postgresql/13/main/postgresql.conf
    echo "✅ PostgreSQL otimizado (64MB shared_buffers, 20 conexões max)"
    echo "⚠️  Reinicie o PostgreSQL: sudo systemctl restart postgresql@13-main"
else
    echo "⚠️  PostgreSQL não encontrado"
fi

# 3. Otimizar Redis
echo "🔴 Otimizando Redis..."
if command -v redis-cli &> /dev/null; then
    # Limita Redis a 256MB (ideal para VM pequena)
    redis-cli CONFIG SET maxmemory 256mb 2>/dev/null || echo "  (requer acesso ao Redis)"
    redis-cli CONFIG SET maxmemory-policy allkeys-lru 2>/dev/null || echo "  (requer acesso ao Redis)"
    
    # Configuração permanente
    if [ -f /etc/redis/redis.conf ]; then
        sudo sed -i 's/^# maxmemory .*/maxmemory 256mb/' /etc/redis/redis.conf
        sudo sed -i 's/^maxmemory .*/maxmemory 256mb/' /etc/redis/redis.conf
        sudo sed -i 's/^# maxmemory-policy .*/maxmemory-policy allkeys-lru/' /etc/redis/redis.conf
        sudo sed -i 's/^maxmemory-policy .*/maxmemory-policy allkeys-lru/' /etc/redis/redis.conf
        echo "✅ Redis configurado para usar máximo 256MB"
        echo "⚠️  Reinicie o Redis: sudo systemctl restart redis-server"
    fi
else
    echo "⚠️  Redis não encontrado"
fi

# 4. Otimizar limites do sistema para Node.js
echo "📦 Otimizando limites do sistema..."
if ! grep -q "oxetech_mcz.*nofile" /etc/security/limits.conf; then
    echo "oxetech_mcz soft nofile 65536" | sudo tee -a /etc/security/limits.conf
    echo "oxetech_mcz hard nofile 65536" | sudo tee -a /etc/security/limits.conf
    echo "oxetech_mcz soft nproc 4096" | sudo tee -a /etc/security/limits.conf
    echo "oxetech_mcz hard nproc 4096" | sudo tee -a /etc/security/limits.conf
    echo "✅ Limites do sistema otimizados"
else
    echo "⚠️  Limites já configurados"
fi

# 5. Desabilitar serviços desnecessários (opcional)
echo "🔧 Verificando serviços..."
echo "  Para desabilitar serviços desnecessários, use:"
echo "  sudo systemctl disable exim4  # Se não usar email"
echo "  sudo systemctl stop exim4"

# 6. Configurar zram (swap comprimido - mais rápido que swap em disco)
echo "💾 Configurando zram (swap comprimido)..."
if ! modprobe zram 2>/dev/null; then
    echo "⚠️  zram não disponível no kernel"
else
    echo "✅ zram disponível (pode ser configurado manualmente)"
fi

echo ""
echo "✅ Otimização concluída!"
echo ""
echo "📋 Próximos passos:"
echo "  1. Reinicie o PostgreSQL: sudo systemctl restart postgresql@13-main"
echo "  2. Reinicie o Redis: sudo systemctl restart redis-server"
echo "  3. Faça logout e login novamente para aplicar limites do sistema"
echo "  4. Execute: sudo sysctl -p para aplicar configurações de kernel"
echo ""
echo "💡 Dica: Execute 'free -h' para verificar uso de memória"

