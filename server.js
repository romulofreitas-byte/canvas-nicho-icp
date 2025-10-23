/**
 * Canvas de Nicho e ICP - Método Pódium
 * Servidor Node.js com Express
 * Versão: 1.0
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://wmsxiuxscmogbechxlty.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indtc3hpdXhzY21vZ2JlY2h4bHR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMjQ3NzYsImV4cCI6MjA3NjgwMDc3Nn0.QzgHcJJLU2YMybrJC-a9BeaQXDVsxuJOszqkj431c0c";

// Inicializar cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Senha do canvas
const CANVAS_PASSWORD = process.env.CANVAS_PASSWORD || 'mundopodium';

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para o arquivo de teste local
app.get('/test', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'test-local.html'));
});

// API para verificar senha
app.post('/api/verify-password', (req, res) => {
    const { password } = req.body;
    
    if (password === CANVAS_PASSWORD) {
        res.json({ success: true, message: 'Senha correta' });
    } else {
        res.status(401).json({ success: false, message: 'Senha incorreta' });
    }
});

// API para salvar dados do canvas
app.post('/api/save-canvas', async (req, res) => {
    try {
        const {
            user_fingerprint,
            triada1,
            triada2,
            triada3,
            nicho,
            dores,
            financeiro,
            acesso,
            entregaveis,
            precificacao,
            checks,
            user_agent,
            ip_address
        } = req.body;

        // Inserir dados no Supabase
        const { data, error } = await supabase
            .from('canvas_data')
            .insert([
                {
                    user_fingerprint,
                    triada1: Boolean(triada1),
                    triada2: Boolean(triada2),
                    triada3: Boolean(triada3),
                    nicho,
                    dores,
                    financeiro,
                    acesso,
                    entregaveis,
                    precificacao,
                    checks: checks || {},
                    user_agent: user_agent || req.headers['user-agent'],
                    ip_address: ip_address || req.ip
                }
            ]);

        if (error) {
            console.error('Erro ao salvar no Supabase:', error);
            res.status(500).json({ success: false, message: 'Erro ao salvar dados' });
        } else {
            console.log('Canvas salvo com sucesso:', data);
            res.json({ success: true, message: 'Dados salvos com sucesso', data });
        }
    } catch (error) {
        console.error('Erro no servidor:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
});

// API para obter dados do canvas por fingerprint
app.get('/api/get-canvas/:fingerprint', async (req, res) => {
    try {
        const { fingerprint } = req.params;

        const { data, error } = await supabase
            .from('canvas_data')
            .select('*')
            .eq('user_fingerprint', fingerprint)
            .order('created_at', { ascending: false })
            .limit(1);

        if (error) {
            console.error('Erro ao buscar dados:', error);
            res.status(500).json({ success: false, message: 'Erro ao buscar dados' });
        } else {
            res.json({ success: true, data: data[0] || null });
        }
    } catch (error) {
        console.error('Erro no servidor:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
});

// API para obter estatísticas (admin)
app.get('/api/stats', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('canvas_data')
            .select('*');

        if (error) {
            console.error('Erro ao buscar estatísticas:', error);
            res.status(500).json({ success: false, message: 'Erro ao buscar estatísticas' });
        } else {
            const stats = {
                total_canvas: data.length,
                triada_completa: data.filter(c => c.triada1 && c.triada2 && c.triada3).length,
                usuarios_unicos: new Set(data.map(c => c.user_fingerprint)).size,
                ultimos_7_dias: data.filter(c => {
                    const dataCanvas = new Date(c.created_at);
                    const agora = new Date();
                    const diffTime = Math.abs(agora - dataCanvas);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return diffDays <= 7;
                }).length
            };

            res.json({ success: true, stats });
        }
    } catch (error) {
        console.error('Erro no servidor:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
});

// Rota para health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Middleware para capturar IP real
app.use((req, res, next) => {
    req.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    next();
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor Canvas de Nicho e ICP rodando na porta ${PORT}`);
    console.log(`📱 Acesse: http://localhost:${PORT}`);
    console.log(`🧪 Teste: http://localhost:${PORT}/test`);
    console.log(`💾 Supabase: ${SUPABASE_URL}`);
    console.log(`🔐 Senha: ${CANVAS_PASSWORD}`);
});

// Tratamento de erros
process.on('uncaughtException', (err) => {
    console.error('Erro não capturado:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Promise rejeitada:', reason);
});
