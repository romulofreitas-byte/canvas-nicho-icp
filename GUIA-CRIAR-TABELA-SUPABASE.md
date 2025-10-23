# GUIA: Como Criar a Tabela Leads no Supabase

## Passo 1: Acessar o Supabase Dashboard
1. Acesse: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto: `wmsxiuxscmogbechxlty`

## Passo 2: Abrir o SQL Editor
1. No menu lateral esquerdo, clique em **"SQL Editor"**
2. Clique em **"New query"** para criar uma nova consulta

## Passo 3: Executar o SQL
Copie e cole o código abaixo no SQL Editor:

```sql
-- Criar tabela leads
CREATE TABLE leads (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    terms BOOLEAN NOT NULL DEFAULT false,
    source VARCHAR(100) DEFAULT 'canvas-nicho-icp',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar política para permitir inserção pública
CREATE POLICY "Permitir inserção de leads" ON leads
    FOR INSERT WITH CHECK (true);

-- Criar política para permitir leitura pública
CREATE POLICY "Permitir leitura de leads" ON leads
    FOR SELECT USING (true);
```

## Passo 4: Executar a Consulta
1. Clique no botão **"Run"** ou pressione **Ctrl+Enter**
2. Você deve ver uma mensagem de sucesso

## Passo 5: Verificar se Funcionou
Execute esta consulta para verificar:

```sql
-- Verificar se a tabela foi criada
SELECT * FROM leads;
```

## Passo 6: Testar Inserção
Execute esta consulta para testar:

```sql
-- Inserir um registro de teste
INSERT INTO leads (name, email, phone, terms, source) 
VALUES ('Teste', 'teste@exemplo.com', '(11) 99999-9999', true, 'canvas-nicho-icp');

-- Verificar se foi inserido
SELECT * FROM leads;
```

## Passo 7: Verificar Políticas de Segurança
1. Vá para **"Authentication"** > **"Policies"**
2. Verifique se as políticas foram criadas para a tabela `leads`

## Problemas Comuns:

### Se der erro de permissão:
```sql
-- Habilitar RLS (Row Level Security)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
```

### Se der erro de política:
```sql
-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Permitir inserção de leads" ON leads;
DROP POLICY IF EXISTS "Permitir leitura de leads" ON leads;

-- Recriar políticas
CREATE POLICY "Permitir inserção de leads" ON leads
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir leitura de leads" ON leads
    FOR SELECT USING (true);
```

## Verificação Final:
Após executar todos os passos, a tabela `leads` deve estar criada e funcionando. 
Você pode testar o formulário do canvas para ver se os dados estão sendo salvos.
