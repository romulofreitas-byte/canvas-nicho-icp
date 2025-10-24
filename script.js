/**
 * Canvas de Nicho e ICP - Método Pódium
 * Versão: 1.0
 */

// ========================================
// CLASSE: Lead Capture Modal
// ========================================
class LeadCaptureModal {
    constructor() {
        this.modal = document.getElementById('leadModal');
        this.form = document.getElementById('leadForm');
        this.isUnlocked = localStorage.getItem('canvasUnlocked') === 'true';
        this.init();
    }
    
    init() {
        if (!this.isUnlocked) {
            this.showModal();
        } else {
            this.hideModal();
        }
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Close modal on background click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                // Não permitir fechar clicando fora - força o preenchimento
                return;
            }
        });
        
        // Prevent form submission without filling
        this.form.addEventListener('submit', (e) => {
            const nome = document.getElementById('nomeCompleto').value.trim();
            const telefone = document.getElementById('telefone').value.trim();
            const email = document.getElementById('email').value.trim();
            
            if (!nome || !telefone || !email) {
                e.preventDefault();
                alert('⚠️ Por favor, preencha todos os campos obrigatórios.');
                return;
            }
        });
    }
    
    showModal() {
        this.modal.classList.remove('hidden');
        document.body.classList.add('modal-active');
    }
    
    hideModal() {
        this.modal.classList.add('hidden');
        document.body.classList.remove('modal-active');
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.form);
        const leadData = {
            nome: formData.get('nomeCompleto'),
            telefone: formData.get('telefone'),
            email: formData.get('email'),
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };
        
        try {
            // Salvar lead no Supabase
            await this.saveLead(leadData);
            
            // Marcar como desbloqueado
            localStorage.setItem('canvasUnlocked', 'true');
            this.isUnlocked = true;
            
            // Esconder modal
            this.hideModal();
            
            // Mostrar mensagem de sucesso
            alert('✅ Canvas desbloqueado com sucesso!\n\nAgora você pode usar todas as funcionalidades da ferramenta.');
            
            // Track analytics
            if (typeof window.va === 'function') {
                window.va('track', 'Canvas Unlocked', {
                    lead_captured: true
                });
            }
            
        } catch (error) {
            console.error('Erro ao salvar lead:', error);
            alert('⚠️ Erro ao processar seus dados. Tente novamente.');
        }
    }
    
    async saveLead(leadData) {
        if (!window.SUPABASE_CONFIG) {
            console.warn('Configuração do Supabase não encontrada - salvando apenas localmente');
            localStorage.setItem('leadData', JSON.stringify(leadData));
            return;
        }
        
        try {
            const response = await fetch(
                `${window.SUPABASE_CONFIG.URL}/rest/v1/leads`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': window.SUPABASE_CONFIG.ANON_KEY,
                        'Authorization': `Bearer ${window.SUPABASE_CONFIG.ANON_KEY}`
                    },
                    body: JSON.stringify(leadData)
                }
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            console.log('✅ Lead salvo no Supabase');
            
        } catch (error) {
            console.error('Erro ao salvar no Supabase:', error);
            // Salvar localmente como fallback
            localStorage.setItem('leadData', JSON.stringify(leadData));
            throw error;
        }
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
            capacidadeFinanceira: 'micro',
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

function testarModal() {
    // Função para testar o modal (apenas para desenvolvimento)
    if (window.leadModal) {
        localStorage.removeItem('canvasUnlocked');
        window.leadModal.showModal();
    }
}

function resetarModal() {
    // Função para resetar o modal (apenas para desenvolvimento)
    localStorage.removeItem('canvasUnlocked');
    location.reload();
}

// ========================================
// INICIALIZAÇÃO
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOMContentLoaded - Iniciando inicialização...');
    
    try {
        // Inicializar modal de captura de leads
        console.log('🔧 Criando LeadCaptureModal...');
        window.leadModal = new LeadCaptureModal();
        console.log('✅ LeadCaptureModal criado:', !!window.leadModal);
        
        // Inicializar canvas
        console.log('🔧 Criando CanvasNichoICP...');
        window.canvas = new CanvasNichoICP();
        console.log('✅ CanvasNichoICP criado:', !!window.canvas);
        
        // Inicializar canvas automatizado
        console.log('🔧 Criando CanvasAutomatizado...');
        window.canvasAutomatizado = new CanvasAutomatizado();
        console.log('✅ CanvasAutomatizado criado:', !!window.canvasAutomatizado);
        
        // Inicializar Vercel Analytics
        if (typeof window.va === 'function') {
            window.va('track', 'Page View', {
                page: 'Canvas Nicho ICP'
            });
        }
        
        console.log('🎉 Inicialização completa!');
    } catch (error) {
        console.error('❌ Erro durante inicialização:', error);
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
        console.log('🔧 CanvasAutomatizado: Iniciando setup...');
        this.setupEventListeners();
        console.log('🔧 CanvasAutomatizado: Event listeners configurados');
        this.updateAllSelections();
        console.log('🔧 CanvasAutomatizado: Seleções atualizadas');
        console.log('✅ CanvasAutomatizado: Inicialização completa');
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
        console.log('🔧 updateNichoResumo: Iniciando...');
        const selecionado = document.querySelector('input[name="nicho"]:checked');
        const customDiv = document.querySelector('.nicho-custom');
        const resumoTexto = document.getElementById('nichoSelecionadoTexto');
        
        if (selecionado) {
            console.log('🔧 updateNichoResumo: Nicho selecionado:', selecionado.value);
            const temOutro = selecionado.value === 'outro';
            
            // Mostrar/ocultar campo custom
            if (customDiv) {
                customDiv.style.display = temOutro ? 'block' : 'none';
            }
            
            let textoNicho = '';
            if (temOutro) {
                const custom = document.getElementById('nichoCustom')?.value.trim();
                textoNicho = custom || 'Outro nicho (especifique)';
            } else {
                textoNicho = this.nichos[selecionado.value]?.nome || selecionado.value;
            }
            
            if (resumoTexto) {
                resumoTexto.textContent = textoNicho;
                console.log('✅ updateNichoResumo: Texto atualizado:', textoNicho);
            }
            
            this.updateResumo();
            this.calcularPrecificacao();
        } else {
            console.log('🔧 updateNichoResumo: Nenhum nicho selecionado');
            if (customDiv) {
                customDiv.style.display = 'none';
            }
            if (resumoTexto) {
                resumoTexto.textContent = 'Selecione um nicho acima';
            }
        }
    }
    
    updateCanais() {
        console.log('🔧 updateCanais: Iniciando...');
        const selecionados = [];
        const checkboxes = document.querySelectorAll('input[name="canais"]:checked');
        
        checkboxes.forEach(checkbox => {
            if (checkbox.value === 'outro') {
                const custom = document.getElementById('canalCustom')?.value.trim();
                if (custom) selecionados.push(custom);
            } else {
                selecionados.push(this.canais[checkbox.value]);
            }
        });
        
        const lista = document.getElementById('canaisSelecionadosLista');
        if (lista) {
            if (selecionados.length === 0) {
                lista.innerHTML = '<p>Selecione os canais acima</p>';
            } else {
                lista.innerHTML = selecionados.map(c => `<span class="tag">${c}</span>`).join('');
                console.log('✅ updateCanais: Canais atualizados:', selecionados);
            }
        }
        
        this.updateLista('listaCanais', selecionados, 'canal-selecionado');
        this.updateResumo();
    }
    
    updateServicos() {
        console.log('🔧 updateServicos: Iniciando...');
        const checkboxes = document.querySelectorAll('input[name="servicos"]:checked');
        const selecionados = [];
        
        checkboxes.forEach(checkbox => {
            const labelElement = checkbox.parentElement.querySelector('.servico-nome');
            const label = labelElement ? labelElement.textContent : checkbox.value;
            selecionados.push(label);
            console.log(`🔧 updateServicos: Serviço adicionado: ${label}`);
        });
        
        const lista = document.getElementById('servicosSelecionadosLista');
        if (lista) {
            if (selecionados.length === 0) {
                lista.innerHTML = '<p>Selecione os serviços acima</p>';
            } else {
                lista.innerHTML = selecionados.map(s => `<span class="tag">${s}</span>`).join('');
                console.log('✅ updateServicos: Serviços atualizados:', selecionados);
            }
        }
        
        this.servicosSelecionados = selecionados;
        console.log('🔧 updateServicos: Serviços selecionados:', selecionados);
        
        this.updateResumo();
        this.calcularPrecificacao();
        console.log('✅ updateServicos: Concluído');
    }
    
    updateOutrosServicos() {
        const selecionados = [];
        const checkboxes = document.querySelectorAll('input[name="outrosServicos"]:checked');
        
        checkboxes.forEach(checkbox => {
            const servico = this.outrosServicos[checkbox.value];
            const detalheElement = checkbox.parentElement.querySelector('.servico-input');
            const detalhe = detalheElement ? detalheElement.value.trim() : '';
            
            let texto = servico ? servico.nome : checkbox.value;
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
        console.log('🔧 calcularCapacidadeEstrutura: Iniciando...');
        const estruturaFisica = document.querySelector('input[name="estruturaFisica"]:checked')?.value;
        const tamanhoEquipe = document.querySelector('input[name="tamanhoEquipe"]:checked')?.value;
        const volumeClientes = document.querySelector('input[name="volumeClientes"]:checked')?.value;
        const ticketMedio = document.querySelector('input[name="ticketMedio"]:checked')?.value;
        const investeMarketing = document.querySelector('input[name="investeMarketing"]:checked')?.value;
        
        console.log('🔧 calcularCapacidadeEstrutura: Valores coletados:', {
            estruturaFisica, tamanhoEquipe, volumeClientes, ticketMedio, investeMarketing
        });
        
        if (!estruturaFisica || !tamanhoEquipe || !volumeClientes || !ticketMedio || !investeMarketing) {
            const elemento = document.getElementById('capacidadeEstimada');
            if (elemento) {
                elemento.innerHTML = '<span class="capacidade-texto">Responda todas as perguntas</span>';
            }
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
        
        console.log('🔧 calcularCapacidadeEstrutura: Score calculado:', score);
        
        // Determinar faixa baseada no score
        let faixa, estimativa, capacidadeKey;
        if (score <= 8) {
            faixa = 'Micro';
            estimativa = 'R$ 5k/mês (3-5% = R$ 150-250 em marketing)';
            capacidadeKey = 'micro';
        } else if (score <= 12) {
            faixa = 'Pequeno';
            estimativa = 'R$ 25k/mês (3-5% = R$ 750-1.250)';
            capacidadeKey = 'pequeno';
        } else if (score <= 16) {
            faixa = 'Médio';
            estimativa = 'R$ 125k/mês (3-5% = R$ 3.750-6.250)';
            capacidadeKey = 'medio';
        } else {
            faixa = 'Grande';
            estimativa = 'R$ 300k+/mês (3-5% = R$ 9k-15k)';
            capacidadeKey = 'grande';
        }
        
        const elemento = document.getElementById('capacidadeEstimada');
        if (elemento) {
            elemento.innerHTML = `
                <span class="capacidade-texto">${faixa}</span>
                <small style="display: block; margin-top: 5px; opacity: 0.8;">${estimativa}</small>
            `;
        }
        
        // Adicionar cálculo SEBRAE (3-5% do faturamento)
        const calculoSebrae = document.getElementById('calculoSebrae');
        if (calculoSebrae) {
            let faturamentoMin, faturamentoMax;
            if (faixa === 'Micro') {
                faturamentoMin = 5000;
                faturamentoMax = 5000;
            } else if (faixa === 'Pequeno') {
                faturamentoMin = 5000;
                faturamentoMax = 25000;
            } else if (faixa === 'Médio') {
                faturamentoMin = 25000;
                faturamentoMax = 125000;
            } else {
                faturamentoMin = 125000;
                faturamentoMax = 300000;
            }
            
            const investMin3 = Math.round(faturamentoMin * 0.03);
            const investMax5 = Math.round(faturamentoMax * 0.05);
            
            calculoSebrae.innerHTML = `
                <strong>Cálculo SEBRAE (3-5% do faturamento):</strong><br>
                Investimento sugerido em marketing: R$ ${investMin3.toLocaleString('pt-BR')} - R$ ${investMax5.toLocaleString('pt-BR')}/mês
            `;
            console.log('✅ calcularCapacidadeEstrutura: Cálculo SEBRAE adicionado');
        }
        
        // Atualizar capacidade financeira detectada na precificação
        const capacidadeDetectada = document.getElementById('capacidadeDetectada');
        if (capacidadeDetectada) {
            capacidadeDetectada.innerHTML = `<span class="capacidade-texto">${faixa}</span>`;
        }
        
        this.capacidadeFinanceira = capacidadeKey;
        console.log('✅ calcularCapacidadeEstrutura: Capacidade definida como:', capacidadeKey);
        
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
        console.log('🔧 calcularPrecificacao: Iniciando...');
        console.log('🔧 calcularPrecificacao: Capacidade financeira:', this.capacidadeFinanceira);
        
        if (!this.capacidadeFinanceira) {
            console.log('⚠️ calcularPrecificacao: Capacidade financeira não definida');
            return;
        }
        
        const servicosSelecionados = Array.from(document.querySelectorAll('input[name="servicos"]:checked')).map(cb => cb.value);
        console.log('🔧 calcularPrecificacao: Serviços selecionados:', servicosSelecionados);
        
        let total = 0;
        const servicosIncluidos = [];
        
        // Calcular serviços de marketing
        servicosSelecionados.forEach(servico => {
            const preco = this.precos[servico] ? this.precos[servico][this.capacidadeFinanceira] : 0;
            total += preco;
            const servicoInfo = this.servicos[servico];
            servicosIncluidos.push({
                nome: servicoInfo ? servicoInfo.nome : servico,
                preco: preco,
                icon: servicoInfo ? servicoInfo.icon : '📦'
            });
            console.log(`🔧 calcularPrecificacao: ${servico} = R$ ${preco}`);
        });
        
        // Aplicar multiplicador do nicho
        const nichoSelecionado = document.querySelector('input[name="nicho"]:checked');
        let multiplicadorNicho = 1;
        
        if (nichoSelecionado && nichoSelecionado.value !== 'outro' && this.nichos[nichoSelecionado.value]) {
            multiplicadorNicho = this.nichos[nichoSelecionado.value].multiplicador;
            console.log(`🔧 calcularPrecificacao: Multiplicador do nicho ${nichoSelecionado.value}: ${multiplicadorNicho}`);
        }
        
        total *= multiplicadorNicho;
        console.log(`🔧 calcularPrecificacao: Total calculado: R$ ${total}`);
        
        // Calcular jornadas
        const enxuta = Math.round(total * 0.6);
        const padrao = Math.round(total * 0.8);
        const completa = Math.round(total);
        
        console.log(`🔧 calcularPrecificacao: Jornadas - Enxuta: R$ ${enxuta}, Padrão: R$ ${padrao}, Completa: R$ ${completa}`);
        
        // Atualizar interface
        this.atualizarResultadoPrecificacao(servicosIncluidos, total);
        this.atualizarJornadas(enxuta, padrao, completa);
        this.atualizarResumoJornadas(enxuta, padrao, completa);
        
        console.log('✅ calcularPrecificacao: Concluído');
    }
    
    atualizarResultadoPrecificacao(servicosIncluidos, total) {
        console.log('🔧 atualizarResultadoPrecificacao: Atualizando...', servicosIncluidos);
        const container = document.getElementById('resultadoPrecificacao');
        if (!container) {
            console.error('❌ Elemento resultadoPrecificacao não encontrado');
            return;
        }
        
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
        console.log('✅ atualizarResultadoPrecificacao: Precificação atualizada');
    }
    
    atualizarJornadas(enxuta, padrao, completa) {
        const pacoteBasico = document.getElementById('pacoteBasico');
        const pacoteIntermediario = document.getElementById('pacoteIntermediario');
        const pacotePremium = document.getElementById('pacotePremium');
        
        if (pacoteBasico) {
            const precoElement = pacoteBasico.querySelector('.pacote-preco');
            if (precoElement) precoElement.textContent = `R$ ${enxuta.toLocaleString('pt-BR')}`;
        }
        
        if (pacoteIntermediario) {
            const precoElement = pacoteIntermediario.querySelector('.pacote-preco');
            if (precoElement) precoElement.textContent = `R$ ${padrao.toLocaleString('pt-BR')}`;
        }
        
        if (pacotePremium) {
            const precoElement = pacotePremium.querySelector('.pacote-preco');
            if (precoElement) precoElement.textContent = `R$ ${completa.toLocaleString('pt-BR')}`;
        }
    }
    
    atualizarResumoJornadas(enxuta, padrao, completa) {
        const resumoEnxuta = document.getElementById('resumoEnxuta');
        const resumoPadrao = document.getElementById('resumoPadrao');
        const resumoCompleta = document.getElementById('resumoCompleta');
        
        if (resumoEnxuta) resumoEnxuta.textContent = `R$ ${enxuta.toLocaleString('pt-BR')}`;
        if (resumoPadrao) resumoPadrao.textContent = `R$ ${padrao.toLocaleString('pt-BR')}`;
        if (resumoCompleta) resumoCompleta.textContent = `R$ ${completa.toLocaleString('pt-BR')}`;
    }
    
    updateResumo() {
        console.log('🔧 updateResumo: Iniciando...');
        // Nicho
        const nicho = document.querySelector('input[name="nicho"]:checked');
        const nichoTexto = nicho ? 
            (nicho.value === 'outro' ? 
                (document.getElementById('nichoCustom').value.trim() || 'Outro nicho') : 
                (this.nichos[nicho.value] ? this.nichos[nicho.value].nome : nicho.nextElementSibling.textContent)
            ) : 'Nenhum nicho selecionado';
        const elementoNicho = document.getElementById('resumoNichos');
        if (elementoNicho) {
            elementoNicho.textContent = nichoTexto;
            console.log('✅ updateResumo: Nicho atualizado:', nichoTexto);
        } else {
            console.error('❌ updateResumo: Elemento resumoNichos não encontrado');
        }
        
        // Dores
        const dores = Array.from(document.querySelectorAll('input[name="dores"]:checked'));
        const doresTexto = dores.length > 0 ? 
            dores.map(d => {
                if (d.value === 'outra') {
                    const custom = document.getElementById('dorCustom').value.trim();
                    return custom || 'Outra dor';
                }
                return this.dores[d.value] || d.nextElementSibling.textContent;
            }).join(', ') : 'Nenhuma dor selecionada';
        const elementoDores = document.getElementById('resumoDores');
        if (elementoDores) {
            elementoDores.textContent = doresTexto;
            console.log('✅ updateResumo: Dores atualizadas:', doresTexto);
        } else {
            console.error('❌ updateResumo: Elemento resumoDores não encontrado');
        }
        
        // Capacidade
        let capacidadeTexto = 'Não definida';
        if (this.capacidadeFinanceira) {
            const capacidadeMap = {
                'micro': 'Micro (até R$ 5k/mês)',
                'pequeno': 'Pequeno (R$ 5k-25k/mês)',
                'medio': 'Médio (R$ 25k-125k/mês)',
                'grande': 'Grande (acima R$ 125k/mês)'
            };
            capacidadeTexto = capacidadeMap[this.capacidadeFinanceira] || this.capacidadeFinanceira;
        }
        
        const elementoCapacidade = document.getElementById('resumoCapacidade');
        if (elementoCapacidade) {
            elementoCapacidade.textContent = capacidadeTexto;
            console.log('✅ updateResumo: Capacidade atualizada:', capacidadeTexto);
        } else {
            console.error('❌ updateResumo: Elemento resumoCapacidade não encontrado');
        }
        
        // Serviços
        const servicos = this.servicosSelecionados || [];
        const servicosTexto = servicos.length > 0 ? servicos.join(', ') : 'Nenhum serviço selecionado';
        const elementoServicos = document.getElementById('resumoServicos');
        if (elementoServicos) {
            elementoServicos.textContent = servicosTexto;
            console.log('✅ updateResumo: Serviços atualizados:', servicosTexto);
        } else {
            console.error('❌ updateResumo: Elemento resumoServicos não encontrado');
        }
        console.log('✅ updateResumo: Concluído');
    }
    
    updateDoresResumo() {
        console.log('🔧 updateDoresResumo: Iniciando...');
        const selecionadas = document.querySelectorAll('input[name="dores"]:checked');
        const customDiv = document.querySelector('.dor-custom');
        const lista = document.getElementById('doresSelecionadasLista');
        
        const temOutra = Array.from(selecionadas).some(cb => cb.value === 'outra');
        
        // Mostrar/ocultar campo custom
        if (customDiv) {
            customDiv.style.display = temOutra ? 'block' : 'none';
        }
        
        if (selecionadas.length === 0) {
            if (lista) lista.innerHTML = '<p>Selecione as dores acima</p>';
        } else {
            const doresTexto = Array.from(selecionadas).map(d => {
                if (d.value === 'outra') {
                    return document.getElementById('dorCustom')?.value.trim() || 'Outra dor';
                }
                return this.dores[d.value] || d.value;
            });
            if (lista) {
                lista.innerHTML = doresTexto.map(d => `<span class="tag">${d}</span>`).join('');
                console.log('✅ updateDoresResumo: Dores atualizadas:', doresTexto);
            }
        }
        
        this.updateResumo();
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
                        selecionadas.push(dor);
                    }
                }
            });
        }
        
        this.updateLista('listaDores', selecionadas, 'dor-selecionada');
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

// Inicialização já feita acima - removendo duplicação
