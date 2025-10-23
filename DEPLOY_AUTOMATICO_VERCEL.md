# 🚀 CONFIGURAR DEPLOY AUTOMÁTICO NO VERCEL

## 📋 Problema Identificado

O teste local funciona, mas o deploy automático no Vercel não está acontecendo. Isso geralmente acontece porque:

1. O projeto não está conectado ao GitHub no Vercel
2. O webhook do GitHub não está configurado
3. As configurações do projeto estão incorretas

## 🔧 SOLUÇÃO PASSO A PASSO

### PASSO 1: Conectar Projeto ao GitHub

#### 1.1 Acessar Vercel Dashboard
1. Acesse [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Faça login com sua conta

#### 1.2 Importar Projeto do GitHub
1. Clique em **"New Project"**
2. Selecione **"Import Git Repository"**
3. Escolha o repositório: **`romulofreitas-byte/canvas-nicho-icp`**
4. Clique em **"Import"**

#### 1.3 Configurar Projeto
- **Project Name:** `canvas-nicho-icp-podium`
- **Framework Preset:** `Other`
- **Root Directory:** `./` (deixar vazio)
- **Build Command:** Deixar vazio
- **Output Directory:** Deixar vazio
- **Install Command:** Deixar vazio

### PASSO 2: Configurar Variáveis de Ambiente

**IMPORTANTE:** Configure ANTES de fazer o primeiro deploy:

1. Clique em **"Environment Variables"**
2. Adicione estas variáveis:

```
VITE_SUPABASE_URL = https://wmsxiuxscmogbechxlty.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indtc3hpdXhzY21vZ2JlY2h4bHR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMjQ3NzYsImV4cCI6MjA3NjgwMDc3Nn0.QzgHcJJLU2YMybrJC-a9BeaQXDVsxuJOszqkj431c0c
CANVAS_PASSWORD = mundopodium
```

3. Certifique-se de que estão marcadas para:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

### PASSO 3: Fazer o Primeiro Deploy

1. Clique em **"Deploy"**
2. Aguarde o processo (alguns minutos)
3. Você receberá uma URL como: `https://canvas-nicho-icp-podium-xxx.vercel.app`

### PASSO 4: Verificar Deploy Automático

Após o primeiro deploy, o Vercel deve configurar automaticamente:

1. **Webhook do GitHub** - Para deploys automáticos
2. **Branch de produção** - Geralmente `main`
3. **Deploy automático** - A cada push no GitHub

## 🔍 VERIFICAÇÕES IMPORTANTES

### Verificar se o Webhook está Configurado

#### No GitHub:
1. Vá para o repositório: `romulofreitas-byte/canvas-nicho-icp`
2. Clique em **"Settings"**
3. Clique em **"Webhooks"**
4. Você deve ver um webhook do Vercel

#### No Vercel:
1. Vá para o projeto no dashboard
2. Clique em **"Settings"**
3. Clique em **"Git"**
4. Verifique se o repositório está conectado

### Verificar Configurações do Projeto

#### No Vercel Dashboard:
1. Vá para o projeto
2. Clique em **"Settings"**
3. Clique em **"General"**
4. Verifique:
   - **Framework Preset:** Other
   - **Build Command:** (vazio)
   - **Output Directory:** (vazio)
   - **Install Command:** (vazio)

## 🚀 TESTAR DEPLOY AUTOMÁTICO

### Fazer uma Alteração de Teste

1. Faça uma pequena alteração no arquivo `index.html`
2. Faça commit e push para o GitHub
3. Verifique se o Vercel detecta a mudança automaticamente

### Comando para Teste:
```bash
git add .
git commit -m "test: Teste de deploy automático"
git push origin main
```

## 🔧 SOLUÇÃO DE PROBLEMAS

### Problema: Deploy não acontece automaticamente

#### Solução 1: Verificar Webhook
1. No GitHub: Settings → Webhooks
2. Verifique se há webhook do Vercel
3. Se não houver, reconecte o projeto no Vercel

#### Solução 2: Reconectar Projeto
1. No Vercel: Delete o projeto atual
2. Importe novamente do GitHub
3. Configure as variáveis de ambiente
4. Faça o deploy

#### Solução 3: Verificar Branch
1. No Vercel: Settings → Git
2. Verifique se a branch de produção está correta
3. Geralmente deve ser `main`

### Problema: Erro 404 após deploy

#### Solução:
1. Verifique se o `vercel.json` está correto
2. Confirme se as variáveis de ambiente estão configuradas
3. Verifique os logs de build no Vercel

### Problema: Variáveis de ambiente não funcionam

#### Solução:
1. Verifique se estão configuradas para todos os ambientes
2. Faça um novo deploy após configurar
3. Verifique se os nomes estão corretos

## 📊 CONFIGURAÇÕES RECOMENDADAS

### Vercel.json (já configurado):
```json
{
  "version": 2,
  "name": "canvas-nicho-icp-podium",
  "framework": null,
  "github": {
    "enabled": true,
    "autoAlias": true
  }
}
```

### Variáveis de Ambiente:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `CANVAS_PASSWORD`

## ✅ CHECKLIST FINAL

- [ ] Projeto importado do GitHub no Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] Primeiro deploy realizado com sucesso
- [ ] Webhook do GitHub configurado
- [ ] Deploy automático funcionando
- [ ] URL do Vercel acessível
- [ ] Teste de alteração funcionando

## 🆘 SUPORTE

Se o deploy automático ainda não funcionar:

1. **Verifique os logs** no Vercel Dashboard
2. **Teste o webhook** fazendo uma alteração
3. **Reconecte o projeto** se necessário
4. **Entre em contato** com a equipe Pódium

---

**Siga estes passos e o deploy automático funcionará perfeitamente! 🚀**
