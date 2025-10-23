# 🚀 GUIA DE DEPLOY - Vercel

## 📋 Visão Geral

Este guia te ajudará a fazer o deploy do Canvas de Nicho e ICP no Vercel. O Vercel é uma plataforma de deploy que oferece hospedagem gratuita para aplicações web estáticas.

## 🔧 PASSO 1: Preparação

### 1.1 Instalar Vercel CLI
```bash
npm install -g vercel
```

### 1.2 Verificar Arquivos
Certifique-se de que todos os arquivos estão no diretório:
- `index.html`
- `script.js`
- `styles.css`
- `config.js`
- `package.json`
- `vercel.json`
- `supabase-security-policies.sql`
- Arquivos de documentação

## 🔑 PASSO 2: Login no Vercel

### 2.1 Fazer Login
```bash
vercel login
```

### 2.2 Escolher Método de Login
- **GitHub** (recomendado)
- **GitLab**
- **Bitbucket**
- **Email**

## 🔗 PASSO 3: Vincular Projeto

### 3.1 Linkar ao Projeto Existente
```bash
vercel link --project-id prj_hTAxPkyoXqwnmXZxfRXloUv8pJAZ
```

### 3.2 Configurar Projeto
- **Project Name:** `canvas-nicho-icp-podium`
- **Directory:** `.` (diretório atual)
- **Override Settings:** `N` (não)

## ⚙️ PASSO 4: Configurar Variáveis de Ambiente

### 4.1 Acessar Dashboard
1. Acesse [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Encontre o projeto `canvas-nicho-icp-podium`
3. Clique no projeto

### 4.2 Configurar Environment Variables
1. Vá em "Settings" → "Environment Variables"
2. Adicione as seguintes variáveis:

**VITE_SUPABASE_URL**
- **Name:** `VITE_SUPABASE_URL`
- **Value:** `https://zqscitdvsqfkhzddzaeh.supabase.co`
- **Environment:** Production, Preview, Development

**VITE_SUPABASE_ANON_KEY**
- **Name:** `VITE_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpxc2NpdGR2c3Fma2h6ZGR6YWVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNzA0MzAsImV4cCI6MjA3NjY0NjQzMH0.JZmkmdxJTTf42UYY3M4ruunnS5HupXHiTMwK_YDJmAY`
- **Environment:** Production, Preview, Development

**CANVAS_PASSWORD**
- **Name:** `CANVAS_PASSWORD`
- **Value:** `mundopodium`
- **Environment:** Production, Preview, Development

### 4.3 Salvar Configurações
Clique em "Save" para salvar todas as variáveis.

## 🚀 PASSO 5: Deploy

### 5.1 Deploy de Produção
```bash
vercel --prod
```

### 5.2 Aguardar Deploy
- O Vercel irá fazer o build e deploy
- Aguarde a conclusão (alguns minutos)
- Você receberá uma URL de produção

### 5.3 Verificar Deploy
1. Acesse a URL fornecida
2. Teste o canvas completo
3. Verifique se o salvamento no Supabase funciona

## 🔄 PASSO 6: Deploys Futuros

### 6.1 Deploy Automático
Após a primeira configuração, você pode:
```bash
vercel --prod
```

### 6.2 Deploy de Desenvolvimento
Para testar mudanças:
```bash
vercel
```

## 🌐 PASSO 7: Configurar Domínio Personalizado (Opcional)

### 7.1 Adicionar Domínio
1. No dashboard do Vercel, vá em "Settings" → "Domains"
2. Adicione seu domínio personalizado
3. Configure os DNS conforme instruções

### 7.2 SSL Automático
O Vercel fornece SSL automático para todos os domínios.

## 📊 PASSO 8: Monitoramento e Analytics

### 8.1 Vercel Analytics
- O analytics já está configurado no código
- Acesse "Analytics" no dashboard para ver métricas
- Configure eventos customizados conforme necessário

### 8.2 Logs e Performance
- Monitore performance em "Functions"
- Veja logs em tempo real
- Configure alertas se necessário

## 🔧 CONFIGURAÇÕES AVANÇADAS

### 8.1 Headers de Segurança
O `vercel.json` já está configurado com headers básicos.

### 8.2 Cache e Performance
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 8.3 Redirects (se necessário)
```json
{
  "redirects": [
    {
      "source": "/old-path",
      "destination": "/new-path",
      "permanent": true
    }
  ]
}
```

## 🧪 TESTES PÓS-DEPLOY

### 9.1 Teste de Funcionalidades
- [ ] Modal de senha funciona
- [ ] Canvas carrega corretamente
- [ ] Salvamento local funciona
- [ ] Salvamento no Supabase funciona
- [ ] Auto-save funciona
- [ ] Limpar dados funciona
- [ ] Imprimir funciona
- [ ] Botão da comunidade funciona

### 9.2 Teste de Responsividade
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

### 9.3 Teste de Performance
- [ ] Carregamento rápido (< 3s)
- [ ] Analytics funcionando
- [ ] Sem erros no console

## 🔍 SOLUÇÃO DE PROBLEMAS

### Erro: "Project not found"
```bash
vercel link --project-id prj_hTAxPkyoXqwnmXZxfRXloUv8pJAZ
```

### Erro: "Environment variables not found"
1. Verifique se as variáveis estão configuradas no dashboard
2. Certifique-se de que estão em todos os ambientes
3. Faça um novo deploy após configurar

### Erro: "Build failed"
1. Verifique se todos os arquivos estão presentes
2. Confirme se o `package.json` está correto
3. Veja os logs de build no dashboard

### Erro: "Analytics not working"
1. Verifique se o script do Vercel Analytics está carregando
2. Confirme se o projeto está vinculado corretamente
3. Aguarde alguns minutos para aparecer nos dados

## 📱 CONFIGURAÇÕES MOBILE

### PWA (Progressive Web App)
Para transformar em PWA, adicione ao `index.html`:
```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#F2b705">
```

### Manifest.json
```json
{
  "name": "Canvas de Nicho e ICP - Método Pódium",
  "short_name": "Canvas Pódium",
  "description": "Canvas de Nicho e ICP - Método Pódium",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#F2b705",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

## 🆘 SUPORTE

- **Documentação Vercel:** [https://vercel.com/docs](https://vercel.com/docs)
- **Comunidade Vercel:** [https://github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
- **Comunidade Pódium:** [WhatsApp](https://chat.whatsapp.com/L4camOPOJMxDb8et6M80oN)

## ✅ CHECKLIST FINAL

- [ ] Projeto criado no Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy de produção realizado
- [ ] URL de produção funcionando
- [ ] Todas as funcionalidades testadas
- [ ] Analytics funcionando
- [ ] Responsividade verificada
- [ ] Performance otimizada

---

**Deploy concluído! Seu Canvas de Nicho e ICP está online e funcionando. 🚀**
