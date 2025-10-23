/**
 * Configuração do Supabase para Canvas de Nicho e ICP
 */

function getEnvVar(name, defaultValue = null) {
    return window?.[`__ENV_${name}`] || 
           window?.[name] || 
           defaultValue;
}

const SUPABASE_CONFIG = {
    // URL do seu projeto Supabase
    URL: getEnvVar('VITE_SUPABASE_URL', "https://wmsxiuxscmogbechxlty.supabase.co"),
    
    // Chave pública do Supabase
    ANON_KEY: getEnvVar('VITE_SUPABASE_ANON_KEY', "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indtc3hpdXhzY21vZ2JlY2h4bHR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMjQ3NzYsImV4cCI6MjA3NjgwMDc3Nn0.QzgHcJJLU2YMybrJC-a9BeaQXDVsxuJOszqkj431c0c"),
    
    // Nome da tabela
    TABLE_NAME: 'canvas_data'
};

// Senha de acesso ao canvas
const CANVAS_PASSWORD = 'mundopodium';

// Expor configuração
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.SUPABASE_URL = SUPABASE_CONFIG.URL;
window.SUPABASE_ANON_KEY = SUPABASE_CONFIG.ANON_KEY;
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
