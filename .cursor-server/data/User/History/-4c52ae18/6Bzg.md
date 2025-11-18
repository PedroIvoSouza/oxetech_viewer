# Configuração de Acesso Externo - Google Cloud

## IP Público da Instância

**IP Público:** `35.226.67.209`

**Link de Acesso:** `http://35.226.67.209:3000`

## Configuração do Next.js

O Next.js já está configurado para aceitar conexões externas:

- **Desenvolvimento:** `npm run dev` - Escuta em `0.0.0.0:3000`
- **Produção:** `npm run start` - Escuta em `0.0.0.0:3000`

### Scripts Disponíveis

```bash
# Desenvolvimento (acesso externo)
npm run dev

# Desenvolvimento (apenas localhost)
npm run dev:local

# Produção (acesso externo)
npm run build
npm run start

# Produção (apenas localhost)
npm run build
npm run start:local
```

## Configuração do Firewall do Google Cloud

Para permitir acesso externo, você precisa configurar uma regra de firewall no Google Cloud:

### Via Console do Google Cloud

1. Acesse o [Console do Google Cloud](https://console.cloud.google.com/)
2. Navegue até **VPC Network** > **Firewall**
3. Clique em **Create Firewall Rule**
4. Configure:
   - **Name:** `allow-nextjs-port-3000`
   - **Direction:** Ingress
   - **Action on match:** Allow
   - **Targets:** All instances in the network (ou selecione sua instância)
   - **Source IP ranges:** `0.0.0.0/0` (todos) ou IPs específicos
   - **Protocols and ports:** 
     - ✅ TCP
     - Port: `3000`

### Via gcloud CLI

```bash
gcloud compute firewall-rules create allow-nextjs-port-3000 \
  --allow tcp:3000 \
  --source-ranges 0.0.0.0/0 \
  --description "Allow external access to Next.js on port 3000"
```

### Via Terraform (opcional)

```hcl
resource "google_compute_firewall" "allow_nextjs" {
  name    = "allow-nextjs-port-3000"
  network = "default"

  allow {
    protocol = "tcp"
    ports    = ["3000"]
  }

  source_ranges = ["0.0.0.0/0"]
  description   = "Allow external access to Next.js on port 3000"
}
```

## Verificar Configuração

### 1. Verificar se o Next.js está escutando em todas as interfaces

```bash
netstat -tlnp | grep 3000
# Deve mostrar: :::3000 (todas as interfaces) ou 0.0.0.0:3000
```

### 2. Testar acesso local

```bash
curl http://localhost:3000
curl http://10.128.0.2:3000
```

### 3. Testar acesso externo

```bash
curl http://35.226.67.209:3000
```

## Segurança

### Recomendações

1. **Use HTTPS em produção:**
   - Configure um Load Balancer ou Reverse Proxy (nginx/Apache)
   - Use certificado SSL/TLS (Let's Encrypt)

2. **Restrinja IPs de origem (opcional):**
   - Em vez de `0.0.0.0/0`, use IPs específicos no firewall
   - Exemplo: `--source-ranges 123.456.789.0/24`

3. **Configure autenticação:**
   - O sistema já tem middleware de autenticação
   - Certifique-se de que está funcionando corretamente

4. **Use variáveis de ambiente:**
   - Não exponha credenciais no código
   - Use `.env` para configurações sensíveis

## Nginx Reverse Proxy (Recomendado para Produção)

Para produção, é recomendado usar Nginx como reverse proxy:

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Troubleshooting

### Problema: Não consigo acessar externamente

**Soluções:**

1. Verifique se o firewall está configurado:
```bash
gcloud compute firewall-rules list | grep 3000
```

2. Verifique se a instância tem IP público:
```bash
gcloud compute instances describe NOME_DA_INSTANCIA --zone ZONA | grep natIP
```

3. Verifique se o Next.js está rodando:
```bash
ps aux | grep next
```

4. Verifique se está escutando na porta correta:
```bash
netstat -tlnp | grep 3000
```

5. Teste a conectividade:
```bash
# Da sua máquina local
telnet 35.226.67.209 3000
# ou
nc -zv 35.226.67.209 3000
```

### Problema: Conexão recusada

- Verifique se o Next.js está escutando em `0.0.0.0` e não apenas `127.0.0.1`
- Verifique se há outro firewall (iptables, ufw) bloqueando

### Problema: Timeout

- Verifique as regras de firewall do Google Cloud
- Verifique se a instância está rodando
- Verifique os logs do Next.js

## Logs

Para monitorar acessos:

```bash
# Logs do Next.js
npm run dev 2>&1 | tee nextjs.log

# Logs do sistema (se usando PM2)
pm2 logs nextjs
```

## Porta Alternativa

Se quiser usar outra porta (ex: 8080):

1. Modifique o `package.json`:
```json
"dev": "next dev -H 0.0.0.0 -p 8080"
```

2. Configure o firewall para a nova porta:
```bash
gcloud compute firewall-rules create allow-nextjs-port-8080 \
  --allow tcp:8080 \
  --source-ranges 0.0.0.0/0
```

## Status Atual

✅ Next.js configurado para aceitar conexões externas  
✅ Scripts atualizados (`npm run dev` e `npm run start`)  
⚠️ **Pendente:** Configurar regra de firewall no Google Cloud  
⚠️ **Recomendado:** Configurar HTTPS/SSL para produção  

## Próximos Passos

1. Configurar regra de firewall no Google Cloud (ver instruções acima)
2. Testar acesso externo: `http://35.226.67.209:3000`
3. Configurar HTTPS (Load Balancer ou Nginx + Let's Encrypt)
4. Configurar domínio (opcional)

