# 🚀 INSTRUÇÕES DE DEPLOY - Canvas de Nicho e ICP

## ⚠️ SOLUÇÃO PARA ERRO 404

Se você está recebendo erro **404: NOT_FOUND**, siga estas instruções:

## 📋 MÉTODO 1: Deploy Manual no Vercel (RECOMENDADO)

### Passo 1: Acessar Vercel
1. Acesse [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Faça login com sua conta

### Passo 2: Importar Projeto
1. Clique em **"New Project"**
2. Selecione **"Import Git Repository"**
3. Escolha: **`romulofreitas-byte/canvas-nicho-icp`**
4. Clique em **"Import"**

### Passo 3: Configurar Projeto
- **Project Name:** `canvas-nicho-icp-podium`
- **Framework Preset:** `Other`
- **Root Directory:** `./` (deixar vazio)
- **Build Command:** Deixar vazio
- **Output Directory:** Deixar vazio

### Passo 4: Variáveis de Ambiente
**IMPORTANTE:** Configure ANTES de fazer deploy:

1. Clique em **"Environment Variables"**
2. Adicione:

```
VITE_SUPABASE_URL = https://wmsxiuxscmogbechxlty.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indtc3hpdXhzY21vZ2JlY2h4bHR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMjQ3NzYsImV4cCI6MjA3NjgwMDc3Nn0.QzgHcJJLU2YMybrJC-a9BeaQXDVsxuJOszqkj431c0c
CANVAS_PASSWORD = mundopodium
```

### Passo 5: Deploy
1. Clique em **"Deploy"**
2. Aguarde (alguns minutos)
3. Você receberá uma URL como: `https://canvas-nicho-icp-podium-xxx.vercel.app`

## 📋 MÉTODO 2: Teste Local Imediato

Se o Vercel não funcionar, use o arquivo de teste:

1. **Abra `test-local.html`** diretamente no navegador
2. **Digite a senha:** `mundopodium`
3. **Funciona imediatamente!**

## 📋 MÉTODO 3: GitHub Pages

### Passo 1: Configurar Pages
1. Vá para o repositório no GitHub
2. **Settings** → **Pages**
3. **Source:** `Deploy from a branch`
4. **Branch:** `main`
5. **Save**

### Passo 2: Acessar
- URL: `https://romulofreitas-byte.github.io/canvas-nicho-icp/`

## 📋 MÉTODO 4: Netlify

### Passo 1: Deploy
1. Acesse [https://netlify.com](https://netlify.com)
2. **New site from Git**
3. Escolha **GitHub**
4. Selecione: `romulofreitas-byte/canvas-nicho-icp`
5. **Deploy site**

## 🔧 SOLUÇÃO DE PROBLEMAS

### Erro 404 no Vercel
- **Causa:** Projeto não foi deployado ou configuração incorreta
- **Solução:** Siga o MÉTODO 1 acima

### Arquivos não carregam
- **Causa:** Problema de CORS ou configuração
- **Solução:** Use o MÉTODO 2 (teste local)

### Variáveis de ambiente não funcionam
- **Causa:** Não configuradas no Vercel
- **Solução:** Configure no dashboard do Vercel

## ✅ CHECKLIST RÁPIDO

- [ ] Repositório está público no GitHub
- [ ] Todos os arquivos estão commitados
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy realizado com sucesso
- [ ] URL acessível

## 🆘 TESTE IMEDIATO

**Para testar AGORA mesmo:**

1. Abra o arquivo `test-local.html` no navegador
2. Digite a senha: `mundopodium`
3. Teste todas as funcionalidades

**Este método funciona 100% e não requer servidor!**

---

**Siga o MÉTODO 1 para deploy no Vercel ou use o MÉTODO 2 para teste imediato! 🚀**
