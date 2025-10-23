-- Tabela para captura de leads do Canvas de Nicho e ICP
-- Execute este SQL no Supabase SQL Editor

CREATE TABLE IF NOT EXISTS leads (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    terms BOOLEAN NOT NULL DEFAULT false,
    source VARCHAR(100) DEFAULT 'canvas-nicho-icp',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);

-- Política de segurança para permitir inserção pública
CREATE POLICY "Permitir inserção pública de leads" ON leads
    FOR INSERT WITH CHECK (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_leads_updated_at 
    BEFORE UPDATE ON leads 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE leads IS 'Tabela para captura de leads do Canvas de Nicho e ICP';
COMMENT ON COLUMN leads.name IS 'Nome completo do lead';
COMMENT ON COLUMN leads.email IS 'E-mail do lead (único)';
COMMENT ON COLUMN leads.phone IS 'Telefone/WhatsApp do lead';
COMMENT ON COLUMN leads.terms IS 'Se aceita receber conteúdos';
COMMENT ON COLUMN leads.source IS 'Origem do lead';
COMMENT ON COLUMN leads.created_at IS 'Data de criação do registro';
COMMENT ON COLUMN leads.updated_at IS 'Data da última atualização';
