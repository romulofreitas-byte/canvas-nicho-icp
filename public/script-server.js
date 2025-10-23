/**
 * Canvas de Nicho e ICP - Método Pódium
 * Versão Node.js com Express
 * Versão: 1.0
 */

// ========================================
// CLASSE: Password Authentication
// ========================================
class PasswordAuth {
    constructor() {
        this.modal = document.getElementById('passwordModal');
        this.form = document.getElementById('passwordForm');
        this.passwordInput = document.getElementById('password');
        this.init();
    }
    
    init() {
        // Verificar se já está autenticado
        if (!this.isAuthenticated()) {
            this.showModal();
        } else {
            this.hideModal();
        }
        
        // Listener para o form
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
    
    isAuthenticated() {
        const authData = localStorage.getItem('canvas-auth');
        if (!authData) return false;
        
        const parsed = JSON.parse(authData);
        const expiryDate = new Date(parsed.expiry);
        
        // Verificar se ainda está dentro do prazo (30 dias)
        if (new Date() > expiryDate) {
            localStorage.removeItem('canvas-auth');
            return false;
        }
        
        return true;
    }
    
    async handleSubmit(event) {
        event.preventDefault();
        
        const password = this.passwordInput.value;
        
        try {
            const response = await fetch('/api/verify-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Salvar autenticação (30 dias)
                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + 30);
                
                localStorage.setItem('canvas-auth', JSON.stringify({
                    authenticated: true,
                    expiry: expiryDate.toISOString(),
                    date: new Date().toISOString()
                }));
                
                this.hideModal();
                alert('✅ Acesso liberado! Bem-vindo ao Canvas de Nicho e ICP.');
                
                // Track analytics
                if (typeof window.va === 'function') {
                    window.va('track', 'Canvas Unlocked');
                }
            } else {
                alert('❌ Senha incorreta! Tente novamente.');
                this.passwordInput.value = '';
                this.passwordInput.focus();
            }
        } catch (error) {
            console.error('Erro ao verificar senha:', error);
            alert('❌ Erro ao verificar senha. Tente novamente.');
        }
    }
    
    showModal() {
        this.modal.classList.remove('hidden');
    }
    
    hideModal() {
        this.modal.classList.add('hidden');
    }
    
    logout() {
        localStorage.removeItem('canvas-auth');
        this.showModal();
    }
}

// ========================================
// CLASSE: Canvas Nicho ICP
// ========================================
class CanvasNichoICP {
    constructor() {
        this.form = document.getElementById('canvasForm');
        this.userFingerprint = this.generateFingerprint();
        this.init();
    }
    
    init() {
        // Carregar dados salvos
        this.carregarDados();
        
        // Setup da tríade
        this.setupTriada();
        
        // Auto-save a cada 30 segundos
        setInterval(() => this.autoSave(), 30000);
    }
    
    setupTriada() {
        const triada1 = document.getElementById('triada1');
        const triada2 = document.getElementById('triada2');
        const triada3 = document.getElementById('triada3');
        
        [triada1, triada2, triada3].forEach(checkbox => {
            checkbox.addEventListener('change', () => this.validarTriada());
        });
        
        this.validarTriada();
    }
    
    validarTriada() {
        const triada1 = document.getElementById('triada1').checked;
        const triada2 = document.getElementById('triada2').checked;
        const triada3 = document.getElementById('triada3').checked;
        
        const resultado = document.getElementById('resultadoTriada');
        
        if (triada1 && triada2 && triada3) {
            resultado.classList.add阶段('ativo');
        } else {
            resultado.classList.remove('ativo');
        }
    }
    
    generateFingerprint() {
        // Gerar fingerprint único baseado em características do navegador
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('browser-fingerprint', 2, 2);
        
        const fingerprint = canvas.toDataURL();
        const hash = this.hashCode(fingerprint + navigator.userAgent + navigator.language);
        
        return 'user_' + hash;
    }
    
    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    }
    
    async salvarDados() {
        const dados = this.coletarDados();
        
        // Salvar localmente
        this.salvarLocal(dados);
        
        // Salvar no servidor (que salva no Supabase)
        await this.salvarServidor(dados);
    }
    
    coletarDados() {
        return {
            triada1: document.getElementById('triada1').checked,
            triada2: document.getElementById('triada2').checked,
            triada3: document.getElementById('triada3').checked,
            nicho: document.getElementById('nicho').value,
            dores: document.getElementById('dores').value,
            financeiro: document.getElementById('financeiro').value,
            acesso: document.getElementById('acesso').value,
            entregaveis: document.getElementById('entregaveis').value,
            precificacao: document.getElementById('precificacao').value,
            checks: {
                check1: document.getElementById('check1').checked,
                check2: document.getElementById('check2').checked,
                check3: document.getElementById('check3').checked,
                check4: document.getElementById('check4').checked,
                check5: document.getElementById('check5').checked,
                check6: document.getElementById('check6').checked,
                check7: document.getElementById('check7').checked,
                check8: document.getElementById('check8').checked,
            }
        };
    }
    
    salvarLocal(dados) {
        localStorage.setItem('canvasNichoICP', JSON.stringify(dados));
    }
    
    async salvarServidor(dados) {
        try {
            // Rate limiting: verificar se já salvou recentemente
            const lastSaveKey = `lastServerSave_${this.userFingerprint}`;
            const lastSave = localStorage.getItem(lastSaveKey);
            const now = Date.now();
            
            if (lastSave) {
                const timeDiff = now - parseInt(lastSave);
                const oneHour = 60 * 60 * 1000; // 1 hora em milissegundos
                
                if (timeDiff < oneHour) {
                    const remainingTime = Math.ceil((oneHour - timeDiff) / (60 * 1000));
                    alert(`⚠️ Aguarde ${remainingTime} minutos antes de salvar novamente.\n\nIsso evita spam e garante melhor performance.`);
                    return false;
                }
            }
            
            const payload = {
                user_fingerprint: this.userFingerprint,
                triada1: dados.triada1,
                triada2: dados.triada2,
                triada3: dados.triada3,
                nicho: dados.nicho,
                dores: dados.dores,
                financeiro: dados.financeiro,
                acesso: dados.acesso,
                entregaveis: dados.entregaveis,
                precificacao: dados.precificacao,
                checks: dados.checks,
                user_agent: navigator.userAgent,
                ip_address: await this.obterIP()
            };
            
            const response = await fetch('/api/save-canvas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            const result = await response.json();
            
            if (result.success) {
                console.log('✅ Canvas salvo no servidor!');
                // Salvar timestamp do último save
                localStorage.setItem(lastSaveKey, now.toString());
                alert('✅ Dados salvos com sucesso!\n\nSeus dados foram salvos localmente e no Supabase via servidor.');
                return true;
            } else {
                console.error('❌ Erro ao salvar no servidor:', result.message);
                alert('✅ Dados salvos localmente!\n\nErro ao salvar no servidor: ' + result.message);
                return false;
            }
        } catch (error) {
            console.error('❌ Erro ao conectar com servidor:', error);
            alert('✅ Dados salvos localmente!\n\nErro ao conectar com servidor. Verifique sua conexão.');
            return false;
        }
    }
    
    async obterIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch {
            return 'desconhecido';
        }
    }
    
    async carregarDados() {
        // Primeiro, tentar carregar do localStorage
        const dadosLocais = localStorage.getItem('canvasNichoICP');
        
        if (dadosLocais) {
            const obj = JSON.parse(dadosLocais);
            this.preencherCampos(obj);
            this.validarTriada();
        }
        
        // Depois, tentar carregar do servidor
        try {
            const response = await fetch(`/api/get-canvas/${this.userFingerprint}`);
            const result = await response.json();
            
            if (result.success && result.data) {
                const dados = result.data;
                this.preencherCampos({
                    triada1: dados.triada1,
                    triada2: dados.triada2,
                    triada3: dados.triada3,
                    nicho: dados.nicho,
                    dores: dados.dores,
                    financeiro: dados.financeiro,
                    acesso: dados.acesso,
                    entregaveis: dados.entregaveis,
                    precificacao: dados.precificacao,
                    checks: dados.checks || {}
                });
                this.validarTriada();
                console.log('✅ Dados carregados do servidor!');
            }
        } catch (error) {
            console.error('❌ Erro ao carregar dados do servidor:', error);
        }
    }
    
    preencherCampos(obj) {
        document.getElementById('triada1').checked = obj.triada1 || false;
        document.getElementById('triada2').checked = obj.triada2 || false;
        document.getElementById('triada3').checked = obj.triada3 || false;
        document.getElementById('nicho').value = obj.nicho || '';
        document.getElementById('dores').value = obj.dores || '';
        document.getElementById('financeiro').value = obj.financeiro || '';
        document.getElementById('acesso').value = obj.acesso || '';
        document.getElementById('entregaveis').value = obj.entregaveis || '';
        document.getElementById('precificacao').value = obj.precificacao || '';
        
        if (obj.checks) {
            document.getElementById('check1').checked = obj.checks.check1 || false;
            document.getElementById('check2').checked = obj.checks.check2 || false;
            document.getElementById('check3').checked = obj.checks.check3 || false;
            document.getElementById('check4').checked = obj.checks.check4 || false;
            document.getElementById('check5').checked = obj.checks.check5 || false;
            document.getElementById('check6').checked = obj.checks.check6 || false;
            document.getElementById('check7').checked = obj.checks.check7 || false;
            document.getElementById('check8').checked = obj.checks.check8 || false;
        }
    }
    
    limparDados() {
        if (confirm('⚠️ Tem certeza que deseja limpar todos os dados?\n\nEssa ação não pode ser desfeita.')) {
            localStorage.removeItem('canvasNichoICP');
            this.form.reset();
            this.validarTriada();
            alert('✅ Todos os dados foram limpos.');
            
            // Track analytics
            if (typeof window.va === 'function') {
                window.va('track', 'Canvas Cleared');
            }
        }
    }
    
    autoSave() {
        const dados = this.coletarDados();
        this.salvarLocal(dados);
        console.log('💾 Auto-save realizado');
    }
}

// ========================================
// FUNÇÕES GLOBAIS
// ========================================
function salvarDados() {
    if (window.canvas) {
        window.canvas.salvarDados();
    }
}

function limparDados() {
    if (window.canvas) {
        window.canvas.limparDados();
    }
}

// ========================================
// INICIALIZAÇÃO
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar autenticação
    window.passwordAuth = new PasswordAuth();
    
    // Inicializar canvas
    window.canvas = new CanvasNichoICP();
    
    // Inicializar Vercel Analytics
    if (typeof window.va === 'function') {
        window.va('track', 'Page View', {
            page: 'Canvas Nicho ICP - Node.js Version'
        });
    }
});
