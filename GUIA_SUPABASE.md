# 🗄️ GUIA DE CONFIGURAÇÃO - Supabase

## 📋 Visão Geral

Este guia te ajudará a configurar o Supabase para salvar os dados do Canvas de Nicho e ICP. O Supabase funciona como um banco de dados na nuvem que armazena os canvas preenchidos pelos usuários.

## 🚀 PASSO 1: Criar Projeto no Supabase

### 1.1 Acessar Supabase
1. Acesse [https://supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Faça login com sua conta (GitHub, Google, ou email)

### 1.2 Criar Novo Projeto
1. Clique em "New Project"
2. Escolha sua organização
3. Preencha os dados:
   - **Name:** `canvas-nicho-icp-podium`
   - **Database Password:** Gere uma senha forte (salve em local seguro)
   - **Region:** Escolha a região mais próxima (Brazil - South America)
4. Clique em "Create new project"
5. Aguarde a criação (pode levar alguns minutos)

## 🔧 PASSO 2: Configurar a Tabela

### 2.1 Acessar SQL Editor
1. No painel do Supabase, clique em "SQL Editor" no menu lateral
2. Clique em "New query"

### 2.2 Executar Script SQL
1. Copie todo o conteúdo do arquivo `supabase-security-policies.sql`
2. Cole no editor SQL
3. Clique em "Run" para executar

**⚠️ IMPORTANTE:** Certifique-se de que o script foi executado com sucesso. Você deve ver mensagens de confirmação.

### 2.3 Verificar Tabela Criada
1. No menu lateral, clique em "Table Editor"
2. Você deve ver a tabela `canvas_data` listada
3. Clique na tabela para ver sua estrutura

## 🔑 PASSO 3: Obter Credenciais

### 3.1 URL do Projeto
1. No painel do Supabase, vá em "Settings" → "API"
2. Copie a **Project URL** (algo como: `https://xxxxx.supabase.co`)

### 3.2 Chave Pública (Anon Key)
1. Na mesma página (Settings → API)
2. Copie a **anon public** key (uma string longa começando com `eyJ...`)

### 3.3 Configurar no Projeto
1. Abra o arquivo `config.js`
2. Substitua os valores:
   ```javascript
   URL: "SUA_PROJECT_URL_AQUI",
   ANON_KEY: "SUA_ANON_KEY_AQUI"
   ```

## 🔒 PASSO 4: Configurar Segurança (RLS)

### 4.1 Verificar RLS Ativado
1. Vá em "Table Editor" → "canvas_data"
2. Clique na aba "RLS" 
3. Certifique-se que está ativado

### 4.2 Verificar Políticas
1. Na aba "Policies", você deve ver 3 políticas criadas:
   - "Allow insert canvas data"
   - "Allow select canvas data" 
   - "Allow update canvas data"

## 🧪 PASSO 5: Testar Configuração

### 5.1 Teste Local
1. Abra o arquivo `index.html` no navegador
2. Preencha o canvas com dados de teste
3. Clique em "💾 SALVAR DADOS"
4. Verifique se aparece a mensagem de sucesso

### 5.2 Verificar no Supabase
1. Volte ao Supabase → "Table Editor" → "canvas_data"
2. Você deve ver o registro de teste criado
3. Verifique se todos os campos foram preenchidos corretamente

## 📊 PASSO 6: Visualizar Dados

### 6.1 Consultas Úteis
No SQL Editor, você pode executar estas consultas:

**Ver todos os canvas:**
```sql
SELECT * FROM canvas_data ORDER BY created_at DESC;
```

**Contar canvas por usuário:**
```sql
SELECT user_fingerprint, COUNT(*) as total 
FROM canvas_data 
GROUP BY user_fingerprint 
ORDER BY total DESC;
```

**Ver canvas com tríade completa:**
```sql
SELECT * FROM canvas_data 
WHERE triada1 = true AND triada2 = true AND triada3 = true
ORDER BY created_at DESC;
```

### 6.2 Estatísticas Gerais
```sql
SELECT 
    COUNT(*) as total_canvas,
    COUNT(CASE WHEN triada1 = true AND triada2 = true AND triada3 = true THEN 1 END) as triada_completa,
    COUNT(DISTINCT user_fingerprint) as usuarios_unicos
FROM canvas_data;
```

## ⚙️ CONFIGURAÇÕES AVANÇADAS

### Rate Limiting
O sistema já está configurado com rate limiting:
- Máximo 10 inserções por hora por usuário
- Evita spam e uso excessivo

### Backup Automático
O Supabase faz backup automático dos dados. Você pode:
1. Ir em "Settings" → "Database"
2. Configurar backup schedule
3. Exportar dados quando necessário

### Monitoramento
1. Vá em "Logs" para ver atividade em tempo real
2. Monitore performance em "Reports"
3. Configure alertas se necessário

## 🔧 SOLUÇÃO DE PROBLEMAS

### Erro: "Failed to fetch"
- Verifique se a URL do Supabase está correta
- Confirme se a ANON_KEY está correta
- Teste se o projeto está ativo no Supabase

### Erro: "Row Level Security"
- Verifique se RLS está ativado na tabela
- Confirme se as políticas foram criadas corretamente
- Teste executando o script SQL novamente

### Erro: "Rate limit exceeded"
- Usuário atingiu limite de 10 inserções por hora
- Aguarde 1 hora ou ajuste o limite nas políticas

### Dados não aparecem
- Verifique se o script SQL foi executado completamente
- Confirme se a tabela foi criada corretamente
- Teste inserção manual no Supabase

## 📱 CONFIGURAÇÃO PARA PRODUÇÃO

### Variáveis de Ambiente
Para deploy no Vercel, configure estas variáveis:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Domínio Personalizado
1. Vá em "Settings" → "API"
2. Adicione seu domínio em "Site URL"
3. Configure CORS se necessário

## 🆘 SUPORTE

- **Documentação Supabase:** [https://supabase.com/docs](https://supabase.com/docs)
- **Comunidade:** [https://github.com/supabase/supabase/discussions](https://github.com/supabase/supabase/discussions)
- **Comunidade Pódium:** [WhatsApp](https://chat.whatsapp.com/L4camOPOJMxDb8et6M80oN)

---

**Configuração concluída! Seus dados do canvas serão salvos automaticamente no Supabase. 🚀**
