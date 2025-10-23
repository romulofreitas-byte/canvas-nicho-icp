-- SQL SIMPLES PARA CRIAR TABELA LEADS NO SUPABASE
-- Execute este código no SQL Editor do Supabase

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

-- Verificar se a tabela foi criada
SELECT * FROM leads;
