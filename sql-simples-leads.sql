-- SQL ULTRA SIMPLES - Execute linha por linha se necessário

-- 1. Criar a tabela
CREATE TABLE leads (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    terms BOOLEAN DEFAULT false,
    source TEXT DEFAULT 'canvas-nicho-icp',
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Habilitar RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- 3. Criar política de inserção
CREATE POLICY "insert_leads" ON leads FOR INSERT WITH CHECK (true);

-- 4. Criar política de leitura
CREATE POLICY "select_leads" ON leads FOR SELECT USING (true);

-- 5. Testar inserção
INSERT INTO leads (name, email, phone, terms) 
VALUES ('Teste', 'teste@teste.com', '11999999999', true);

-- 6. Verificar dados
SELECT * FROM leads;
