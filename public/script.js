/**
 * Canvas de Nicho e ICP - Método Pódium
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
        this.correctPassword = window.CANVAS_PASSWORD || 'mundopodium';
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
    
    handleSubmit(event) {
        event.preventDefault();
        
        const password = this.passwordInput.value;
        
        if (password === this.correctPassword) {
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
// CLASSE: Serviços e Precificação
// ========================================
class ServicosPrecificacao {
    constructor() {
        this.servicos = {
            'trafego-pago': { nome: 'Tráfego Pago', icon: '📈' },
            'midias-sociais': { nome: 'Mídias Sociais', icon: '📱' },
            'desenvolvimento-sites': { nome: 'Desenvolvimento de Sites e Landing Pages', icon: '💻' },
            'automacao-whatsapp': { nome: 'Automação de WhatsApp', icon: '🤖' },
            'mapeamento-processo': { nome: 'Mapeamento do Processo Comercial', icon: '🗺️' },
            'estruturacao-atendimento': { nome: 'Estruturação de Atendimento', icon: '🎧' },
            'estrategia-marketing': { nome: 'Estratégia e Planejamento de Marketing', icon: '🎯' }
        };
        
        this.precos = {
            'micro': { 'trafego-pago': 1500, 'midias-sociais': 800, 'desenvolvimento-sites': 2000, 'automacao-whatsapp': 1200, 'mapeamento-processo': 1000, 'estruturacao-atendimento': 1500, 'estrategia-marketing': 2500 },
            'pequeno': { 'trafego-pago': 3000, 'midias-sociais': 1500, 'desenvolvimento-sites': 4000, 'automacao-whatsapp': 2500, 'mapeamento-processo': 2000, 'estruturacao-atendimento': 3000, 'estrategia-marketing': 5000 },
            'medio': { 'trafego-pago': 6000, 'midias-sociais': 3000, 'desenvolvimento-sites': 8000, 'automacao-whatsapp': 5000, 'mapeamento-processo': 4000, 'estruturacao-atendimento': 6000, 'estrategia-marketing': 10000 },
            'grande': { 'trafego-pago': 12000, 'midias-sociais': 6000, 'desenvolvimento-sites': 15000, 'automacao-whatsapp': 10000, 'mapeamento-processo': 8000, 'estruturacao-atendimento': 12000, 'estrategia-marketing': 20000 }
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateServicosSelecionados();
        this.detectarCapacidadeFinanceira();
    }
    
    setupEventListeners() {
        // Listeners para checkboxes de serviços
        const servicosCheckboxes = document.querySelectorAll('input[name="servicos"]');
        servicosCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateServicosSelecionados();
                this.calcularPrecificacao();
            });
        });
        
        // Listener para campo de capacidade financeira
        const campoFinanceiro = document.getElementById('financeiro');
        if (campoFinanceiro) {
            campoFinanceiro.addEventListener('input', () => {
                this.detectarCapacidadeFinanceira();
                this.calcularPrecificacao();
            });
        }
    }
    
    updateServicosSelecionados() {
        const servicosSelecionados = Array.from(document.querySelectorAll('input[name="servicos"]:checked'));
        const listaServicos = document.getElementById('listaServicos');
        
        if (servicosSelecionados.length === 0) {
            listaServicos.innerHTML = '<p style="color: #999; font-style: italic;">Nenhum serviço selecionado</p>';
            return;
        }
        
        const html = servicosSelecionados.map(checkbox => {
            const servico = this.servicos[checkbox.value];
            const detalhes = checkbox.parentElement.querySelector('.servico-input').value;
            return `
                <div class="servico-selecionado">
                    <span class="servico-icon">${servico.icon}</span>
                    <span class="servico-nome">${servico.nome}</span>
                    ${detalhes ? `<span class="servico-detalhe">- ${detalhes}</span>` : ''}
                </div>
            `;
        }).join('');
        
        listaServicos.innerHTML = html;
    }
    
    detectarCapacidadeFinanceira() {
        const campoFinanceiro = document.getElementById('financeiro');
        const capacidadeDetectada = document.getElementById('capacidadeDetectada');
        
        if (!campoFinanceiro || !capacidadeDetectada) return;
        
        const texto = campoFinanceiro.value.toLowerCase();
        let capacidade = 'indefinida';
        let cor = '#666';
        
        // Detectar faixa baseada no texto
        if (texto.includes('micro') || texto.includes('até') || texto.includes('10k') || texto.includes('10.000')) {
            capacidade = 'Micro (até R$ 10k/mês)';
            cor = '#e74c3c';
        } else if (texto.includes('pequeno') || texto.includes('10k') || texto.includes('50k') || texto.includes('10.000') || texto.includes('50.000')) {
            capacidade = 'Pequeno (R$ 10k-50k/mês)';
            cor = '#f39c12';
        } else if (texto.includes('médio') || texto.includes('medio') || texto.includes('50k') || texto.includes('200k') || texto.includes('50.000') || texto.includes('200.000')) {
            capacidade = 'Médio (R$ 50k-200k/mês)';
            cor = '#3498db';
        } else if (texto.includes('grande') || texto.includes('acima') || texto.includes('200k') || texto.includes('200.000')) {
            capacidade = 'Grande (acima R$ 200k/mês)';
            cor = '#27ae60';
        }
        
        capacidadeDetectada.innerHTML = `<span class="capacidade-texto" style="color: ${cor};">${capacidade}</span>`;
        this.capacidadeAtual = capacidade.toLowerCase().includes('micro') ? 'micro' : 
                              capacidade.toLowerCase().includes('pequeno') ? 'pequeno' :
                              capacidade.toLowerCase().includes('médio') || capacidade.toLowerCase().includes('medio') ? 'medio' :
                              capacidade.toLowerCase().includes('grande') ? 'grande' : 'micro';
    }
    
    calcularPrecificacao() {
        const servicosSelecionados = Array.from(document.querySelectorAll('input[name="servicos"]:checked'));
        const resultadoPrecificacao = document.getElementById('resultadoPrecificacao');
        
        if (servicosSelecionados.length === 0) {
            resultadoPrecificacao.innerHTML = '<p>Selecione os serviços para ver a precificação sugerida</p>';
            this.atualizarPacotes([]);
            return;
        }
        
        const capacidade = this.capacidadeAtual || 'micro';
        const precosServicos = [];
        let total = 0;
        
        servicosSelecionados.forEach(checkbox => {
            const servico = checkbox.value;
            const preco = this.precos[capacidade][servico];
            const detalhes = checkbox.parentElement.querySelector('.servico-input').value;
            
            precosServicos.push({
                servico: this.servicos[servico].nome,
                icon: this.servicos[servico].icon,
                preco: preco,
                detalhes: detalhes
            });
            
            total += preco;
        });
        
        // Atualizar resultado
        const html = `
            <div class="precificacao-detalhada">
                ${precosServicos.map(item => `
                    <div class="item-precificacao">
                        <span class="item-icon">${item.icon}</span>
                        <span class="item-nome">${item.nome}</span>
                        <span class="item-preco">R$ ${item.preco.toLocaleString('pt-BR')}</span>
                        ${item.detalhes ? `<div class="item-detalhes">${item.detalhes}</div>` : ''}
                    </div>
                `).join('')}
                <div class="total-precificacao">
                    <strong>Total: R$ ${total.toLocaleString('pt-BR')}</strong>
                </div>
            </div>
        `;
        
        resultadoPrecificacao.innerHTML = html;
        
        // Atualizar pacotes
        this.atualizarPacotes(precosServicos, total);
    }
    
    atualizarPacotes(servicos, total = 0) {
        const pacotes = [
            { id: 'pacoteBasico', nome: '🥉 Básico', porcentagem: 0.6 },
            { id: 'pacoteIntermediario', nome: '🥈 Intermediário', porcentagem: 0.8 },
            { id: 'pacotePremium', nome: '🥇 Premium', porcentagem: 1.0 }
        ];
        
        pacotes.forEach(pacote => {
            const elemento = document.getElementById(pacote.id);
            if (!elemento) return;
            
            const precoPacote = Math.round(total * pacote.porcentagem);
            const servicosPacote = servicos.slice(0, Math.ceil(servicos.length * pacote.porcentagem));
            
            elemento.querySelector('.pacote-preco').textContent = `R$ ${precoPacote.toLocaleString('pt-BR')}`;
            
            const servicosHtml = servicosPacote.map(item => 
                `<div class="pacote-servico">${item.icon} ${item.nome}</div>`
            ).join('');
            
            elemento.querySelector('.pacote-servicos').innerHTML = servicosHtml || '<div class="pacote-servico">Nenhum serviço</div>';
        });
    }
}

// ========================================
// CLASSE: Canvas Nicho ICP
// ========================================
class CanvasNichoICP {
    constructor() {
        this.form = document.getElementById('canvasForm');
        this.userFingerprint = this.generateFingerprint();
        this.servicosPrecificacao = new ServicosPrecificacao();
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
            resultado.classList.add('ativo');
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
        
        // Salvar no Supabase
        await this.salvarSupabase(dados);
        
        alert('✅ Dados salvos com sucesso!\n\nSeus dados foram salvos localmente e no Supabase.');
        
        // Track analytics
        if (typeof window.va === 'function') {
            window.va('track', 'Canvas Saved');
        }
    }
    
    coletarDados() {
        // Coletar serviços selecionados
        const servicosSelecionados = Array.from(document.querySelectorAll('input[name="servicos"]:checked')).map(checkbox => ({
            servico: checkbox.value,
            detalhes: checkbox.parentElement.querySelector('.servico-input').value
        }));
        
        return {
            triada1: document.getElementById('triada1').checked,
            triada2: document.getElementById('triada2').checked,
            triada3: document.getElementById('triada3').checked,
            nicho: document.getElementById('nicho').value,
            dores: document.getElementById('dores').value,
            financeiro: document.getElementById('financeiro').value,
            acesso: document.getElementById('acesso').value,
            servicos: servicosSelecionados,
            capacidadeFinanceira: this.servicosPrecificacao.capacidadeAtual || 'micro',
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
    
    async salvarSupabase(dados) {
        try {
            if (!window.SUPABASE_CONFIG) {
                console.error('❌ Configuração do Supabase não encontrada');
                return false;
            }
            
            // Rate limiting: verificar se já salvou recentemente
            const lastSaveKey = `lastSupabaseSave_${this.userFingerprint}`;
            const lastSave = localStorage.getItem(lastSaveKey);
            const now = Date.now();
            
            if (lastSave) {
                const timeDiff = now - parseInt(lastSave);
                const oneHour = 60 * 60 * 1000; // 1 hora em milissegundos
                
                if (timeDiff < oneHour) {
                    const remainingTime = Math.ceil((oneHour - timeDiff) / (60 * 1000));
                    alert(`⚠️ Aguarde ${remainingTime} minutos antes de salvar novamente no Supabase.\n\nIsso evita spam e garante melhor performance.`);
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
                servicos: JSON.stringify(dados.servicos),
                capacidade_financeira: dados.capacidadeFinanceira,
                checks: JSON.stringify(dados.checks),
                user_agent: navigator.userAgent,
                ip_address: await this.obterIP()
            };
            
            const response = await fetch(
                `${window.SUPABASE_CONFIG.URL}/rest/v1/${window.SUPABASE_CONFIG.TABLE_NAME}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': window.SUPABASE_CONFIG.ANON_KEY,
                        'Authorization': `Bearer ${window.SUPABASE_CONFIG.ANON_KEY}`
                    },
                    body: JSON.stringify(payload)
                }
            );
            
            if (response.ok) {
                console.log('✅ Canvas salvo no Supabase!');
                // Salvar timestamp do último save
                localStorage.setItem(lastSaveKey, now.toString());
                return true;
            } else {
                console.error('❌ Erro ao salvar no Supabase:', await response.json());
                return false;
            }
        } catch (error) {
            console.error('❌ Erro ao conectar com Supabase:', error);
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
    
    carregarDados() {
        const dados = localStorage.getItem('canvasNichoICP');
        
        if (dados) {
            const obj = JSON.parse(dados);
            
            document.getElementById('triada1').checked = obj.triada1 || false;
            document.getElementById('triada2').checked = obj.triada2 || false;
            document.getElementById('triada3').checked = obj.triada3 || false;
            document.getElementById('nicho').value = obj.nicho || '';
            document.getElementById('dores').value = obj.dores || '';
            document.getElementById('financeiro').value = obj.financeiro || '';
            document.getElementById('acesso').value = obj.acesso || '';
            
            // Carregar serviços selecionados
            if (obj.servicos && Array.isArray(obj.servicos)) {
                obj.servicos.forEach(servicoData => {
                    const checkbox = document.querySelector(`input[name="servicos"][value="${servicoData.servico}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                        const inputDetalhes = checkbox.parentElement.querySelector('.servico-input');
                        if (inputDetalhes && servicoData.detalhes) {
                            inputDetalhes.value = servicoData.detalhes;
                        }
                    }
                });
            }
            
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
            
            // Atualizar interface após carregar dados
            setTimeout(() => {
                this.servicosPrecificacao.updateServicosSelecionados();
                this.servicosPrecificacao.detectarCapacidadeFinanceira();
                this.servicosPrecificacao.calcularPrecificacao();
            }, 100);
            
            this.validarTriada();
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
            page: 'Canvas Nicho ICP'
        });
    }
});