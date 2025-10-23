/**
 * Configuração Local para Canvas de Nicho e ICP
 * Versão Node.js
 */

module.exports = {
    // Configuração do Supabase
    SUPABASE_URL: "https://wmsxiuxscmogbechxlty.supabase.co",
    SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indtc3hpdXhzY21vZ2JlY2h4bHR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMjQ3NzYsImV4cCI6MjA3NjgwMDc3Nn0.QzgHcJJLU2YMybrJC-a9BeaQXDVsxuJOszqkj431c0c",
    
    // Senha de acesso ao canvas
    CANVAS_PASSWORD: "mundopodium",
    
    // Porta do servidor
    PORT: process.env.PORT || 3000,
    
    // Ambiente
    NODE_ENV: process.env.NODE_ENV || "development"
};
