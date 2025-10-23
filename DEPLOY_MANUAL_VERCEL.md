# 🚀 DEPLOY MANUAL NO VERCEL

## 📋 Instruções para Deploy Manual

Como o Vercel CLI não está disponível, siga estas instruções para fazer o deploy manual:

### 1. Acessar o Vercel Dashboard

1. Acesse [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Faça login com sua conta (GitHub, GitLab, ou email)

### 2. Importar Projeto do GitHub

1. Clique em "New Project"
2. Selecione "Import Git Repository"
3. Escolha o repositório: `romulofreitas-byte/canvas-nicho-icp`
4. Clique em "Import"

### 3. Configurar o Projeto

1. **Project Name:** `canvas-nicho-icp-podium`
2. **Framework Preset:** Other
3. **Root Directory:** `./` (deixar vazio)
4. **Build Command:** Deixar vazio
5. **Output Directory:** Deixar vazio
6. **Install Command:** Deixar vazio

### 4. Configurar Variáveis de Ambiente

Antes de fazer o deploy, configure as variáveis:

1. Clique em "Environment Variables"
2. Adicione as seguintes variáveis:

**VITE_SUPABASE_URL**
- **Name:** `VITE_SUPABASE_URL`
- **Value:** `https://wmsxiuxscmogbechxlty.supabase.co`
- **Environment:** Production, Preview, Development

**VITE_SUPABASE_ANON_KEY**
- **Name:** `VITE_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indtc3hpdXhzY21vZ2JlY2h4bHR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMjQ3NzYsImV4cCI6MjA3NjgwMDc3Nn0.QzgHcJJLU2YMybrJC-a9BeaQXDVsxuJOszqkj431c0c`
- **Environment:** Production, Preview, Development

**CANVAS_PASSWORD**
- **Name:** `CANVAS_PASSWORD`
- **Value:** `mundopodium`
- **Environment:** Production, Preview, Development

### 5. Fazer o Deploy

1. Clique em "Deploy"
2. Aguarde o processo de deploy (alguns minutos)
3. Você receberá uma URL de produção

### 6. Verificar Deploy

1. Acesse a URL fornecida
2. Teste todas as funcionalidades:
   - [ ] Modal de senha funciona
   - [ ] Canvas carrega corretamente
   - [ ] Salvamento local funciona
   - [ ] Salvamento no Supabase funciona
   - [ ] Auto-save funciona
   - [ ] Limpar dados funciona
   - [ ] Imprimir funciona
   - [ ] Botão da comunidade funciona

### 7. Configurar Domínio Personalizado (Opcional)

1. Vá em "Settings" → "Domains"
2. Adicione seu domínio personalizado
3. Configure os DNS conforme instruções

## 🔧 Configurações Avançadas

### Configurar Build Settings

Se necessário, você pode configurar:

1. **Build Command:** Deixar vazio (site estático)
2. **Output Directory:** Deixar vazio
3. **Install Command:** Deixar vazio

### Configurar Headers

O arquivo `vercel.json` já está configurado com headers básicos.

## 🧪 Testes Pós-Deploy

### Teste de Funcionalidades
- [ ] Modal de senha funciona
- [ ] Canvas carrega corretamente
- [ ] Salvamento local funciona
- [ ] Salvamento no Supabase funciona
- [ ] Auto-save funciona
- [ ] Limpar dados funciona
- [ ] Imprimir funciona
- [ ] Botão da comunidade funciona

### Teste de Responsividade
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

### Teste de Performance
- [ ] Carregamento rápido (< 3s)
- [ ] Analytics funcionando (sem erros 404)
- [ ] Sem erros no console

## 🔍 Solução de Problemas

### Erro: "Failed to load resource: 404"
- Este erro é normal em ambiente local
- No Vercel, o analytics funcionará corretamente
- O código já trata este erro graciosamente

### Erro: "Environment variables not found"
- Verifique se as variáveis estão configuradas no dashboard
- Certifique-se de que estão em todos os ambientes
- Faça um novo deploy após configurar

### Erro: "Build failed"
- Verifique se todos os arquivos estão no repositório
- Confirme se o `vercel.json` está correto
- Veja os logs de build no dashboard

## 📱 Configurações Mobile

### PWA (Progressive Web App)
Para transformar em PWA, adicione ao `index.html`:
```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#F2b705">
```

## 🆘 Suporte

- **Documentação Vercel:** [https://vercel.com/docs](https://vercel.com/docs)
- **Comunidade Vercel:** [https://github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
- **Comunidade Pódium:** [WhatsApp](https://chat.whatsapp.com/L4camOPOJMxDb8et6M80oN)

## ✅ Checklist Final

- [ ] Projeto importado do GitHub
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy realizado com sucesso
- [ ] URL de produção funcionando
- [ ] Todas as funcionalidades testadas
- [ ] Analytics funcionando (sem erros 404)
- [ ] Responsividade verificada
- [ ] Performance otimizada

---

**Deploy manual concluído! Seu Canvas de Nicho e ICP está online e funcionando. 🚀**
