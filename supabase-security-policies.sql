-- ========================================
-- Canvas de Nicho e ICP - Método Pódium
-- Configuração do Supabase: Tabela e Políticas de Segurança
-- ========================================

-- Criar tabela canvas_data
CREATE TABLE canvas_data (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Identificação do usuário (anônimo - baseado em fingerprint)
    user_fingerprint TEXT NOT NULL,
    
    -- Dados da Tríade
    triada1 BOOLEAN DEFAULT false,
    triada2 BOOLEAN DEFAULT false,
    triada3 BOOLEAN DEFAULT false,
    
    -- Dados do Canvas
    nicho TEXT,
    dores TEXT,
    financeiro TEXT,
    acesso TEXT,
    entregaveis TEXT,
    precificacao TEXT,
    
    -- Checklist
    checks JSONB,
    
    -- Metadados
    user_agent TEXT,
    ip_address TEXT
);

-- Criar índices para performance
CREATE INDEX idx_canvas_data_user_fingerprint ON canvas_data(user_fingerprint);
CREATE INDEX idx_canvas_data_created_at ON canvas_data(created_at DESC);

-- Ativar Row Level Security (RLS)
ALTER TABLE canvas_data ENABLE ROW LEVEL SECURITY;

-- Política: Permitir INSERT para todos
-- Rate limiting é implementado no código JavaScript (1 save por hora por usuário)
-- Como estamos usando anon key, vamos permitir INSERT para todos
CREATE POLICY "Allow insert canvas data" ON canvas_data
    FOR INSERT
    WITH CHECK (true);

-- Política: Permitir SELECT apenas do próprio usuário
-- Nota: Esta política requer autenticação JWT, mas como estamos usando anon key,
-- vamos permitir SELECT para todos (dados são anônimos mesmo)
CREATE POLICY "Allow select canvas data" ON canvas_data
    FOR SELECT
    USING (true);

-- Política: Permitir UPDATE apenas do próprio usuário
-- Similar ao SELECT, permitir para todos devido à natureza anônima
CREATE POLICY "Allow update canvas data" ON canvas_data
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_canvas_data_updated_at 
    BEFORE UPDATE ON canvas_data 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- INSTRUÇÕES DE USO
-- ========================================

-- 1. Execute este script no SQL Editor do Supabase
-- 2. Certifique-se de que o RLS está ativado
-- 3. Teste as políticas criando alguns registros de teste
-- 4. Configure as variáveis de ambiente no Vercel

-- ========================================
-- QUERIES ÚTEIS PARA ADMINISTRAÇÃO
-- ========================================

-- Ver todos os canvas salvos
-- SELECT * FROM canvas_data ORDER BY created_at DESC;

-- Contar canvas por fingerprint (últimas 24h)
-- SELECT user_fingerprint, COUNT(*) as total 
-- FROM canvas_data 
-- WHERE created_at > NOW() - INTERVAL '24 hours'
-- GROUP BY user_fingerprint 
-- ORDER BY total DESC;

-- Ver canvas completos (tríade validada)
-- SELECT * FROM canvas_data 
-- WHERE triada1 = true AND triada2 = true AND triada3 = true
-- ORDER BY created_at DESC;

-- Ver estatísticas gerais
-- SELECT 
--     COUNT(*) as total_canvas,
--     COUNT(CASE WHEN triada1 = true AND triada2 = true AND triada3 = true THEN 1 END) as triada_completa,
--     COUNT(DISTINCT user_fingerprint) as usuarios_unicos
-- FROM canvas_data;
