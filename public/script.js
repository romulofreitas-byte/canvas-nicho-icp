/**
 * Canvas de Nicho e ICP - Método Pódium
 * Versão: 1.0
 */

// ========================================
// CLASSE: Lead Capture
// ========================================
class LeadCapture {
    constructor() {
        this.modal = document.getElementById('leadModal');
        this.form = document.getElementById('leadForm');
        this.nameInput = document.getElementById('leadName');
        this.emailInput = document.getElementById('leadEmail');
        this.phoneInput = document.getElementById('leadPhone');
        this.termsInput = document.getElementById('leadTerms');
        
        // Configurar Supabase
        this.supabase = null;
        this.initSupabase();
        this.init();
    }
    
    initSupabase() {
        try {
            // Usar as configurações do config.js
            if (window.SUPABASE_URL && window.SUPABASE_ANON_KEY) {
                this.supabase = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
                console.log('✅ Supabase inicializado com sucesso');
            } else {
                console.warn('⚠️ Configurações do Supabase não encontradas');
            }
        } catch (error) {
            console.error('❌ Erro ao inicializar Supabase:', error);
        }
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
        
        // Máscara para telefone
        this.phoneInput.addEventListener('input', (e) => this.formatPhone(e));
    }
    
    formatPhone(event) {
        let value = event.target.value.replace(/\D/g, '');
        if (value.length >= 11) {
            value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (value.length >= 7) {
            value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
        } else if (value.length >= 3) {
            value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
        }
        event.target.value = value;
    }
    
    isAuthenticated() {
        const authData = localStorage.getItem('canvas-lead-auth');
        if (!authData) return false;
        
        const parsed = JSON.parse(authData);
        const expiryDate = new Date(parsed.expiry);
        
        // Verificar se ainda está dentro do prazo (30 dias)
        if (new Date() > expiryDate) {
            localStorage.removeItem('canvas-lead-auth');
            return false;
        }
        
        return true;
    }
    
    async handleSubmit(event) {
        event.preventDefault();
        
        const formData = {
            name: this.nameInput.value.trim(),
            email: this.emailInput.value.trim(),
            phone: this.phoneInput.value.trim(),
            terms: this.termsInput.checked,
            created_at: new Date().toISOString(),
            source: 'canvas-nicho-icp'
        };
        
        // Validações
        if (!formData.name || !formData.email || !formData.phone) {
            alert('❌ Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
        if (!formData.terms) {
            alert('❌ Você deve aceitar receber conteúdos do Método Pódium.');
            return;
        }
        
        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            alert('❌ Por favor, insira um e-mail válido.');
            return;
        }
        
        try {
            // Salvar no Supabase
            if (this.supabase) {
                const { data, error } = await this.supabase
                    .from('leads')
                    .insert([formData]);
                
                if (error) {
                    console.error('Erro ao salvar no Supabase:', error);
                    // Continuar mesmo com erro no Supabase
                } else {
                    console.log('✅ Lead salvo no Supabase:', data);
                }
            }
            
            // Salvar autenticação local (30 dias)
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 30);
            
            localStorage.setItem('canvas-lead-auth', JSON.stringify({
                authenticated: true,
                lead: formData,
                expiry: expiryDate.toISOString(),
                date: new Date().toISOString()
            }));
            
            this.hideModal();
            alert('✅ Acesso liberado! Bem-vindo ao Canvas de Nicho e ICP, ' + formData.name + '!');
            
            // Track analytics
            if (typeof window.va === 'function') {
                window.va('track', 'Lead Captured', {
                    lead_name: formData.name,
                    lead_email: formData.email
                });
            }
            
        } catch (error) {
            console.error('Erro ao processar lead:', error);
            alert('❌ Ocorreu um erro. Tente novamente.');
        }
    }
    
    showModal() {
        this.modal.classList.remove('hidden');
    }
    
    hideModal() {
        this.modal.classList.add('hidden');
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
    window.leadCapture = new LeadCapture();
    
    // Inicializar canvas
    window.canvas = new CanvasNichoICP();
    
    // Inicializar Vercel Analytics
    if (typeof window.va === 'function') {
        window.va('track', 'Page View', {
            page: 'Canvas Nicho ICP'
        });
    }
});

// ========================================
// CLASSE: Canvas Automatizado Completo
// ========================================
class CanvasAutomatizado {
    constructor() {
        this.nichos = {
            'advogados': { nome: 'Advogados/Escritórios Jurídicos', multiplicador: 1.2 },
            'dentistas': { nome: 'Dentistas/Clínicas Odontológicas', multiplicador: 1.1 },
            'medicos': { nome: 'Médicos/Clínicas Médicas', multiplicador: 1.2 },
            'academias': { nome: 'Academias/Personal Trainers', multiplicador: 1.0 },
            'restaurantes': { nome: 'Restaurantes/Bares', multiplicador: 1.0 },
            'beleza': { nome: 'Salões de Beleza/Barbearias', multiplicador: 1.0 },
            'imoveis': { nome: 'Corretores de Imóveis', multiplicador: 1.1 },
            'arquitetos': { nome: 'Arquitetos/Design de Interiores', multiplicador: 1.2 },
            'contadores': { nome: 'Contadores/Escritórios Contábeis', multiplicador: 1.1 },
            'escolas': { nome: 'Escolas/Cursos Livres', multiplicador: 1.0 },
            'ecommerce': { nome: 'E-commerce/Lojas Online', multiplicador: 1.0 },
            'infoprodutores': { nome: 'Infoprodutores/Coaches', multiplicador: 1.1 },
            'construtoras': { nome: 'Construtoras/Engenharia', multiplicador: 1.2 },
            'mecanicas': { nome: 'Oficinas Mecânicas', multiplicador: 1.0 },
            'psicologos': { nome: 'Psicólogos/Terapeutas', multiplicador: 1.1 }
        };
        
        this.dores = {
            'presenca-digital': 'Falta de presença digital/online',
            'leads-qualificados': 'Baixa geração de leads qualificados',
            'conversao-seguidores': 'Dificuldade em converter seguidores em clientes',
            'redes-sociais': 'Não sabe usar redes sociais para vender',
            'orcamento-desperdicado': 'Orçamento desperdiçado em anúncios',
            'relacionamento-publico': 'Falta de relacionamento com público',
            'site-desatualizado': 'Site desatualizado ou inexistente',
            'processos-desorganizados': 'Processos comerciais desorganizados'
        };
        
        this.canais = {
            'google-maps': 'Google Maps / Google Meu Negócio',
            'linkedin': 'LinkedIn (B2B)',
            'instagram-facebook': 'Instagram / Facebook (B2C)',
            'portais-classe': 'Portais de Classe (OAB, CREA, CRM, CRO)',
            'indicacao': 'Indicação / Networking',
            'eventos': 'Eventos / Feiras do Setor',
            'cold-call': 'Cold Call / Prospecção Ativa',
            'anuncios-pagos': 'Anúncios Pagos'
        };
        
        this.servicos = {
            'trafego-pago': { nome: 'Tráfego Pago', icon: '📈' },
            'midias-sociais': { nome: 'Mídias Sociais', icon: '📱' },
            'desenvolvimento-sites': { nome: 'Desenvolvimento de Sites e Landing Pages', icon: '💻' },
            'automacao-whatsapp': { nome: 'Automação de WhatsApp', icon: '🤖' },
            'mapeamento-processo': { nome: 'Mapeamento do Processo Comercial', icon: '🗺️' },
            'estruturacao-atendimento': { nome: 'Estruturação de Atendimento', icon: '🎧' },
            'estrategia-marketing': { nome: 'Estratégia e Planejamento de Marketing', icon: '🎯' }
        };
        
        this.outrosServicos = {
            'consultoria': { nome: 'Consultoria Estratégica', icon: '💡' }
        };
        
        this.precos = {
            'trafego-pago': { micro: 400, pequeno: 800, medio: 2000, grande: 4000 },
            'midias-sociais': { micro: 300, pequeno: 600, medio: 1500, grande: 3000 },
            'desenvolvimento-sites': { micro: 800, pequeno: 1500, medio: 3500, grande: 7000 },
            'automacao-whatsapp': { micro: 250, pequeno: 500, medio: 1200, grande: 2500 },
            'mapeamento-processo': { micro: 200, pequeno: 400, medio: 1000, grande: 2000 },
            'estruturacao-atendimento': { micro: 300, pequeno: 600, medio: 1500, grande: 3000 },
            'estrategia-marketing': { micro: 500, pequeno: 1000, medio: 2500, grande: 5000 },
            'consultoria': { micro: 300, pequeno: 600, medio: 1500, grande: 3000 },
            'google-meu-negocio': { micro: 200, pequeno: 400, medio: 1000, grande: 2000 }
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateAllSelections();
    }
    
    setupEventListeners() {
        // Nichos - Radio buttons
        document.querySelectorAll('input[name="nicho"]').forEach(radio => {
            radio.addEventListener('change', () => this.updateNichoResumo());
        });
        
        // Dores - Checkboxes
        document.querySelectorAll('input[name="dores"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updateDoresResumo());
        });
        
        // Canais
        document.querySelectorAll('input[name="canais"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updateCanais());
        });
        
        // Serviços
        document.querySelectorAll('input[name="servicos"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updateServicos());
        });
        
        // Capacidade Financeira - Radio buttons
        document.querySelectorAll('input[name="estruturaFisica"], input[name="tamanhoEquipe"], input[name="volumeClientes"], input[name="ticketMedio"], input[name="investeMarketing"]').forEach(radio => {
            radio.addEventListener('change', () => this.calcularCapacidadeEstrutura());
        });
        
        // Campos customizados
        document.getElementById('nichoCustom')?.addEventListener('input', () => this.updateNichoResumo());
        document.getElementById('dorCustom')?.addEventListener('input', () => this.updateDoresResumo());
        document.getElementById('canalCustom')?.addEventListener('input', () => this.updateCanais());
    }
    
    updateNichoResumo() {
        const selecionado = document.querySelector('input[name="nicho"]:checked');
        const customDiv = document.querySelector('.nicho-custom');
        
        if (selecionado) {
            const temOutro = selecionado.value === 'outro';
            
            // Mostrar/ocultar campo custom
            if (customDiv) {
                customDiv.style.display = temOutro ? 'block' : 'none';
            }
            
            let texto;
            if (temOutro) {
                const custom = document.getElementById('nichoCustom').value.trim();
                texto = custom || 'Outro nicho';
            } else {
                const nicho = this.nichos[selecionado.value];
                texto = nicho ? `${nicho.icon} ${nicho.nome}` : selecionado.nextElementSibling.textContent;
            }
            
            document.getElementById('nichoSelecionado').textContent = texto;
            this.updateResumo();
            this.calcularPrecificacao();
        } else {
            document.getElementById('nichoSelecionado').textContent = 'Selecione um nicho acima';
            if (customDiv) {
                customDiv.style.display = 'none';
            }
        }
    
    updateDores() {
        const selecionadas = [];
        const select = document.getElementById('doresSelect');
        const customDiv = document.querySelector('.dor-custom');
        
        if (select) {
            const opcoesSelecionadas = Array.from(select.selectedOptions);
            const temOutra = opcoesSelecionadas.some(option => option.value === 'outra');
            
            // Mostrar/ocultar campo custom
            if (customDiv) {
                customDiv.style.display = temOutra ? 'block' : 'none';
            }
            
            opcoesSelecionadas.forEach(option => {
                if (option.value === 'outra') {
                    const custom = document.getElementById('dorCustom').value.trim();
                    if (custom) {
                        selecionadas.push(custom);
                    }
                } else {
                    const dor = this.dores[option.value];
                    if (dor) {
                        selecionadas.push(`${dor.icon} ${dor.nome}`);
                    }
                }
            });
        }
        
        this.updateLista('listaDores', selecionadas, 'dor-selecionada');
        this.updateResumo();
        this.calcularPrecificacao();
    }
    
    updateCanais() {
        const selecionados = [];
        const checkboxes = document.querySelectorAll('input[name="canais"]:checked');
        
        checkboxes.forEach(checkbox => {
            if (checkbox.value === 'outro') {
                const custom = document.getElementById('canalCustom').value.trim();
                if (custom) {
                    selecionados.push(custom);
                }
            } else {
                selecionados.push(this.canais[checkbox.value]);
            }
        });
        
        this.updateLista('listaCanais', selecionados, 'canal-selecionado');
        this.updateResumo();
    }
    
    updateServicos() {
        const checkboxes = document.querySelectorAll('input[name="servicos"]:checked');
        const selecionados = [];
        
        checkboxes.forEach(checkbox => {
            const label = checkbox.parentElement.querySelector('.servico-nome').textContent;
            const detalhe = checkbox.parentElement.querySelector('.servico-input').value.trim();
            let texto = label;
            if (detalhe) {
                texto += ` (${detalhe})`;
            }
            selecionados.push(texto);
        });
        
        this.servicosSelecionados = selecionados;
        this.updateLista('listaServicos', selecionados, 'servico-selecionado');
        this.updateResumo();
        this.calcularPrecificacao();
    }
    
    updateOutrosServicos() {
        const selecionados = [];
        const checkboxes = document.querySelectorAll('input[name="outrosServicos"]:checked');
        
        checkboxes.forEach(checkbox => {
            const servico = this.outrosServicos[checkbox.value];
            const detalhe = checkbox.parentElement.querySelector('.servico-input').value.trim();
            let texto = `${servico.icon} ${servico.nome}`;
            if (detalhe) {
                texto += ` (${detalhe})`;
            }
            selecionados.push(texto);
        });
        
        this.updateLista('listaOutrosServicos', selecionados, 'outro-servico-selecionado');
        this.updateResumo();
        this.calcularPrecificacao();
    }
    
    updateLista(containerId, itens, className) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = '';
        itens.forEach(item => {
            const span = document.createElement('span');
            span.className = className;
            span.textContent = item;
            container.appendChild(span);
        });
    }
    
    calcularCapacidadeEstrutura() {
        const estruturaFisica = document.querySelector('input[name="estruturaFisica"]:checked')?.value;
        const tamanhoEquipe = document.querySelector('input[name="tamanhoEquipe"]:checked')?.value;
        const volumeClientes = document.querySelector('input[name="volumeClientes"]:checked')?.value;
        const ticketMedio = document.querySelector('input[name="ticketMedio"]:checked')?.value;
        const investeMarketing = document.querySelector('input[name="investeMarketing"]:checked')?.value;
        
        if (!estruturaFisica || !tamanhoEquipe || !volumeClientes || !ticketMedio || !investeMarketing) {
            document.getElementById('capacidadeEstimada').innerHTML = '<span class="capacidade-texto">Responda todas as perguntas</span>';
            return;
        }
        
        // Cálculo baseado nas respostas
        let score = 0;
        
        // Estrutura física
        const estruturaScores = { 'casa': 1, 'alugada': 2, 'propria': 3, 'multiplas': 4 };
        score += estruturaScores[estruturaFisica] || 1;
        
        // Tamanho da equipe
        const equipeScores = { '0': 1, '1-2': 2, '3-10': 3, '11-50': 4, '50+': 5 };
        score += equipeScores[tamanhoEquipe] || 1;
        
        // Volume de clientes
        const volumeScores = { '1-10': 1, '11-50': 2, '51-200': 3, '200+': 4 };
        score += volumeScores[volumeClientes] || 1;
        
        // Ticket médio
        const ticketScores = { '100': 1, '100-500': 2, '500-2000': 3, '2000-10000': 4, '10000+': 5 };
        score += ticketScores[ticketMedio] || 1;
        
        // Investimento em marketing
        const investScores = { '0': 1, '500': 2, '500-2000': 3, '2000-5000': 4, '5000+': 5 };
        score += investScores[investeMarketing] || 1;
        
        // Determinar faixa baseada no score
        let faixa, estimativa;
        if (score <= 8) {
            faixa = 'Micro';
            estimativa = 'R$ 5k/mês (3-5% = R$ 150-250 em marketing)';
        } else if (score <= 12) {
            faixa = 'Pequeno';
            estimativa = 'R$ 25k/mês (3-5% = R$ 750-1.250)';
        } else if (score <= 16) {
            faixa = 'Médio';
            estimativa = 'R$ 125k/mês (3-5% = R$ 3.750-6.250)';
        } else {
            faixa = 'Grande';
            estimativa = 'R$ 300k+/mês (3-5% = R$ 9k-15k)';
        }
        
        document.getElementById('capacidadeEstimada').innerHTML = `
            <span class="capacidade-texto">${faixa}</span>
            <small style="display: block; margin-top: 5px; opacity: 0.8;">${estimativa}</small>
        `;
        
        // Atualizar resumo da capacidade
        document.getElementById('capacidadeSelecionada').innerHTML = `
            <span class="badge">${faixa}</span>
            <small style="display: block; margin-top: 5px; opacity: 0.8;">${estimativa}</small>
        `;
        
        this.capacidadeFinanceira = faixa.toLowerCase();
        this.updateResumo();
        this.calcularPrecificacao();
    }
    
    updateCapacidadeDireta() {
        const selecionada = document.querySelector('input[name="capacidadeDireta"]:checked')?.value;
        if (selecionada) {
            this.capacidadeFinanceira = selecionada;
            this.updateResumo();
            this.calcularPrecificacao();
        }
    }
    
    calcularPrecificacao() {
        if (!this.capacidadeFinanceira) return;
        
        const servicosSelecionados = Array.from(document.querySelectorAll('input[name="servicos"]:checked')).map(cb => cb.value);
        const outrosSelecionados = Array.from(document.querySelectorAll('input[name="outrosServicos"]:checked')).map(cb => cb.value);
        
        let total = 0;
        const servicosIncluidos = [];
        
        // Calcular serviços de marketing
        servicosSelecionados.forEach(servico => {
            const preco = this.precos[servico][this.capacidadeFinanceira];
            total += preco;
            servicosIncluidos.push({
                nome: this.servicos[servico].nome,
                preco: preco,
                icon: this.servicos[servico].icon
            });
        });
        
        // Calcular outros serviços
        outrosSelecionados.forEach(servico => {
            const preco = this.precos[servico][this.capacidadeFinanceira];
            total += preco;
            servicosIncluidos.push({
                nome: this.outrosServicos[servico].nome,
                preco: preco,
                icon: this.outrosServicos[servico].icon
            });
        });
        
        // Aplicar multiplicador do nicho
        const nichosSelecionados = Array.from(document.querySelectorAll('input[name="nichos"]:checked')).map(cb => cb.value);
        let multiplicadorNicho = 1;
        
        nichosSelecionados.forEach(nicho => {
            if (nicho !== 'outro' && this.nichos[nicho]) {
                multiplicadorNicho = Math.max(multiplicadorNicho, this.nichos[nicho].multiplicador);
            }
        });
        
        total *= multiplicadorNicho;
        
        // Calcular jornadas
        const enxuta = Math.round(total * 0.6);
        const padrao = Math.round(total * 0.8);
        const completa = Math.round(total);
        
        // Atualizar interface
        this.atualizarResultadoPrecificacao(servicosIncluidos, total);
        this.atualizarJornadas(enxuta, padrao, completa);
        this.atualizarResumoJornadas(enxuta, padrao, completa);
    }
    
    atualizarResultadoPrecificacao(servicosIncluidos, total) {
        const container = document.getElementById('resultadoPrecificacao');
        if (!container) return;
        
        if (servicosIncluidos.length === 0) {
            container.innerHTML = '<p>Selecione os serviços para ver a precificação sugerida</p>';
            return;
        }
        
        let html = '<div class="precificacao-detalhada">';
        servicosIncluidos.forEach(servico => {
            html += `
                <div class="item-precificacao">
                    <span>${servico.icon} ${servico.nome}</span>
                    <span>R$ ${servico.preco.toLocaleString('pt-BR')}</span>
                </div>
            `;
        });
        
        html += `
            <div class="total-precificacao">
                <strong>Total: R$ ${total.toLocaleString('pt-BR')}</strong>
            </div>
        </div>`;
        
        container.innerHTML = html;
    }
    
    atualizarJornadas(enxuta, padrao, completa) {
        document.getElementById('pacoteBasico').querySelector('.pacote-preco').textContent = `R$ ${enxuta.toLocaleString('pt-BR')}`;
        document.getElementById('pacoteIntermediario').querySelector('.pacote-preco').textContent = `R$ ${padrao.toLocaleString('pt-BR')}`;
        document.getElementById('pacotePremium').querySelector('.pacote-preco').textContent = `R$ ${completa.toLocaleString('pt-BR')}`;
    }
    
    atualizarResumoJornadas(enxuta, padrao, completa) {
        document.getElementById('resumoEnxuta').textContent = `R$ ${enxuta.toLocaleString('pt-BR')}`;
        document.getElementById('resumoPadrao').textContent = `R$ ${padrao.toLocaleString('pt-BR')}`;
        document.getElementById('resumoCompleta').textContent = `R$ ${completa.toLocaleString('pt-BR')}`;
    }
    
    updateResumo() {
        // Nicho
        const nicho = document.querySelector('input[name="nicho"]:checked');
        const nichoTexto = nicho ? 
            (nicho.value === 'outro' ? 
                (document.getElementById('nichoCustom').value.trim() || 'Outro nicho') : 
                (this.nichos[nicho.value] ? `${this.nichos[nicho.value].icon} ${this.nichos[nicho.value].nome}` : nicho.nextElementSibling.textContent)
            ) : 'Nenhum nicho selecionado';
        document.getElementById('resumoNichos').textContent = nichoTexto;
        
        // Dores
        const dores = Array.from(document.querySelectorAll('input[name="dores"]:checked'));
        const doresTexto = dores.length > 0 ? 
            dores.map(d => {
                if (d.value === 'outra') {
                    const custom = document.getElementById('dorCustom').value.trim();
                    return custom || 'Outra dor';
                }
                return this.dores[d.value] ? `${this.dores[d.value].icon} ${this.dores[d.value].nome}` : d.nextElementSibling.textContent;
            }).join(', ') : 'Nenhuma dor selecionada';
        document.getElementById('resumoDores').textContent = doresTexto;
        
        // Capacidade
        const capacidade = this.capacidadeFinanceira || 'Não definida';
        document.getElementById('resumoCapacidade').textContent = capacidade;
        
        // Serviços
        const servicos = this.servicosSelecionados || [];
        const servicosTexto = servicos.length > 0 ? servicos.join(', ') : 'Nenhum serviço selecionado';
        document.getElementById('resumoServicos').textContent = servicosTexto;
    }
    
    updateDoresResumo() {
        const selecionadas = document.querySelectorAll('input[name="dores"]:checked');
        const customDiv = document.querySelector('.dor-custom');
        
        const temOutra = Array.from(selecionadas).some(cb => cb.value === 'outra');
        
        // Mostrar/ocultar campo custom
        if (customDiv) {
            customDiv.style.display = temOutra ? 'block' : 'none';
        }
        
        const textos = [];
        selecionadas.forEach(checkbox => {
            if (checkbox.value === 'outra') {
                const custom = document.getElementById('dorCustom').value.trim();
                if (custom) {
                    textos.push(custom);
                }
            } else {
                const dor = this.dores[checkbox.value];
                textos.push(dor ? `${dor.icon} ${dor.nome}` : checkbox.nextElementSibling.textContent);
            }
        });
        
        const container = document.getElementById('doresSelecionadas');
        if (textos.length > 0) {
            container.innerHTML = textos.map(texto => `<span class="tag">${texto}</span>`).join(' ');
        } else {
            container.textContent = 'Selecione as dores acima';
        }
        
        this.updateResumo();
        this.calcularPrecificacao();
    }
    
    updateAllSelections() {
        this.updateNichoResumo();
        this.updateDoresResumo();
        this.updateCanais();
        this.updateServicos();
        this.updateResumo();
    }
}

// ========================================
// FUNÇÃO: Exportar PDF
// ========================================
function exportarPDF() {
    const element = document.getElementById('canvasForm');
    const opt = {
        margin: 1,
        filename: `canvas-nicho-icp-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
}

// Atualizar inicialização para incluir CanvasAutomatizado
document.addEventListener('DOMContentLoaded', function() {
    new LeadCapture();
    new CanvasNichoICP();
    
    // Inicializar canvas automatizado
    new CanvasAutomatizado();
    
    // Inicializar Vercel Analytics
    if (typeof window.va === 'function') {
        window.va('track', 'Page View', {
            page: 'Canvas Nicho ICP'
        });
    }
});
