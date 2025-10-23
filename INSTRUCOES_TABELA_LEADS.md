# 📋 Instruções para Criar a Tabela Leads no Supabase

## ⚠️ IMPORTANTE
Se você está recebendo erro ao enviar o formulário, é porque a tabela `leads` não existe no Supabase ou as políticas RLS não estão configuradas.

## 🔧 Passo a Passo

### 1. Acesse o Supabase
1. Vá para https://supabase.com
2. Faça login na sua conta
3. Abra o projeto: `wmsxiuxscmogbechxlty`

### 2. Abra o SQL Editor
1. No menu lateral, clique em **SQL Editor**
2. Clique em **New Query**

### 3. Execute o SQL

Cole e execute este código SQL:

```sql
-- Criar tabela leads
CREATE TABLE IF NOT EXISTS leads (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    terms BOOLEAN DEFAULT false,
    source TEXT DEFAULT 'canvas-nicho-icp',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Política: Permitir INSERT para todos (anônimo)
DROP POLICY IF EXISTS "Permitir inserção de leads" ON leads;
CREATE POLICY "Permitir inserção de leads"
ON leads
FOR INSERT
WITH CHECK (true);

-- Política: Permitir SELECT para todos (anônimo)
DROP POLICY IF EXISTS "Permitir leitura de leads" ON leads;
CREATE POLICY "Permitir leitura de leads"
ON leads
FOR SELECT
USING (true);

-- Criar índice para email (melhor performance)
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);

-- Criar índice para created_at (melhor performance)
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
```

### 4. Clique em RUN

Aguarde a execução. Você deve ver uma dessas mensagens:
```
Success. No rows returned
```
ou
```
Success. 2 rows affected
```

**⚠️ Se aparecer erro sobre política já existente:**
- Isso é normal! Significa que as políticas já foram criadas antes
- Continue para a próxima etapa

### 5. Verifique se a tabela foi criada

Execute este SQL:

```sql
SELECT * FROM leads LIMIT 5;
```

Se retornar uma tabela vazia (sem erro), está tudo certo! ✅

## 🧪 Testar a Integração

1. Abra o arquivo `public/index.html` no navegador
2. Preencha o modal com dados válidos:
   - Nome: `João Silva` (nome e sobrenome)
   - Email: `joao@exemplo.com`
   - Telefone: `11999999999`
   - Marque a checkbox de termos
3. Clique em "Acessar Canvas"

### O que deve acontecer:
- ✅ Modal fecha
- ✅ Canvas aparece desbloqueado
- ✅ Console mostra: "✅ Lead salvo no Supabase com sucesso!"

### Se der erro:
- ❌ Verifique o console do navegador (F12)
- ❌ Veja qual é o status code do erro
- ❌ Certifique-se que executou o SQL corretamente

## 🔍 Verificar Dados Salvos

No Supabase, execute:

```sql
SELECT 
    id,
    name,
    email,
    phone,
    created_at
FROM leads
ORDER BY created_at DESC
LIMIT 10;
```

Você deve ver os leads capturados pelo formulário!

## 🆘 Problemas Comuns

### Erro 404 - Tabela não encontrada
- Execute o SQL da etapa 3 novamente
- Verifique se está no projeto correto

### Erro 401/403 - Permissão negada
- Execute as políticas RLS (etapa 3)
- Certifique-se que habilitou o RLS

### Erro "Unexpected end of JSON input"
- Esse erro foi corrigido no código
- Atualize o arquivo `public/script.js`

### Erro "policy already exists"
- **✅ Isso é NORMAL!** Significa que as políticas já existem
- Continue para a próxima etapa
- O formulário deve funcionar mesmo com esse "erro"

### Tabela já existe mas formulário não funciona
Execute este SQL para verificar as políticas:
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'leads';
```

Se não retornar nada, execute apenas as políticas:
```sql
-- Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "insert_leads" ON leads;
DROP POLICY IF EXISTS "select_leads" ON leads;

-- Criar políticas corretas
CREATE POLICY "Permitir inserção de leads"
ON leads FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir leitura de leads"
ON leads FOR SELECT USING (true);
```

## ✅ Configuração Completa!

Após seguir esses passos, o formulário deve funcionar perfeitamente! 🎉

