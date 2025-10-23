/**
 * Configuração do Supabase para Canvas de Nicho e ICP
 */

function getEnvVar(name, defaultValue = null) {
    return window?.[`__ENV_${name}`] || 
           window?.[name] || 
           defaultValue;
}

const SUPABASE_CONFIG = {
    // URL do seu projeto Supabase (MESMA URL da calculadora)
    URL: getEnvVar('VITE_SUPABASE_URL', "https://zqscitdvsqfkhzddzaeh.supabase.co"),
    
    // Chave pública do Supabase (MESMA ANON KEY da calculadora)
    ANON_KEY: getEnvVar('VITE_SUPABASE_ANON_KEY', "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpxc2NpdGR2c3Fma2h6ZGR6YWVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNzA0MzAsImV4cCI6MjA3NjY0NjQzMH0.JZmkmdxJTTf42UYY3M4ruunnS5HupXHiTMwK_YDJmAY"),
    
    // Nome da tabela (DIFERENTE da calculadora)
    TABLE_NAME: 'canvas_data'
};

// Senha de acesso ao canvas
const CANVAS_PASSWORD = 'mundopodium';

// Expor configuração
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.CANVAS_PASSWORD = CANVAS_PASSWORD;

function validarConfiguracao() {
    if (!SUPABASE_CONFIG.URL || SUPABASE_CONFIG.URL === 'https://seu-projeto.supabase.co') {
        console.error('❌ ERRO: Configure a URL do Supabase');
        return false;
    }
    
    if (!SUPABASE_CONFIG.ANON_KEY || SUPABASE_CONFIG.ANON_KEY === 'sua-chave-publica-aqui') {
        console.error('❌ ERRO: Configure a ANON_KEY do Supabase');
        return false;
    }
    
    console.log('✅ Configuração do Supabase validada!');
    return true;
}

window.addEventListener('DOMContentLoaded', () => {
    validarConfiguracao();
});
