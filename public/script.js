/**
 * Canvas de Nicho e ICP - Método Pódium
 * Versão: 1.1 - Com Modal de Captura de Leads
 */

// ========================================
// CLASSE: LeadCapture - Modal de Captura de Leads
// ========================================
class LeadCapture {
    constructor() {
        this.modal = document.getElementById('leadModal');
        this.form = document.getElementById('leadForm');
        this.submitBtn = document.getElementById('submitLead');
        this.submitText = document.getElementById('submitText');
        this.submitLoading = document.getElementById('submitLoading');
        this.container = document.querySelector('.container');
        
        this.rateLimitAttempts = 0;
        this.rateLimitMax = 3;
        this.rateLimitWindow = 60000; // 1 minuto
        
        // Lista negra de emails comuns
        this.blockedEmails = [
            'test@test.com', 'email@email.com', 'fake@fake.com', 'spam@spam.com',
            'admin@admin.com', 'user@user.com', 'example@example.com',
            'temp@temp.com', 'demo@demo.com', 'sample@sample.com',
            'teste@teste.com', 'romulo@teste.com', 'teste@test.com',
            'test@teste.com', 'teste@teste.br', 'test@test.br',
            'email@teste.com', 'email@test.com', 'usuario@teste.com',
            'usuario@test.com', 'admin@teste.com', 'admin@test.com'
        ];
        
        // Lista negra de nomes genéricos
        this.blockedNames = [
            'teste', 'test', 'usuario', 'user', 'admin', 'administrador',
            'exemplo', 'example', 'demo', 'temp', 'temporario', 'fake',
            'falso', 'spam', 'bot', 'automated', 'automacao'
        ];
        
        this.init();
    }
    
    init() {
        // Verificar se já foi capturado na sessão
        if (sessionStorage.getItem('leadCaptured') === 'true') {
            this.liberarCanvas();
            return;
        }
        
        // Verificar IP para evitar captura duplicada
        this.checkIPAndProceed();
    }
    
    async checkIPAndProceed() {
        try {
            const userIP = await this.obterIP();
            const savedIP = localStorage.getItem('leadIP');
            
            if (savedIP && savedIP === userIP) {
                console.log('🔧 LeadCapture: IP já capturado, liberando canvas automaticamente');
                sessionStorage.setItem('leadCaptured', 'true');
                this.liberarCanvas();
                return;
            }
        } catch (error) {
            console.log('🔧 LeadCapture: Erro ao verificar IP, continuando com modal');
        }
        
        this.setupEventListeners();
        this.setupValidation();
        console.log('🔧 LeadCapture: Inicializado');
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
    
    setupEventListeners() {
        // Submit do formulário
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
        
        // Validação em tempo real
        const inputs = this.form.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
        
        // Rate limiting
        this.submitBtn.addEventListener('click', () => {
            if (this.isRateLimited()) {
                this.showError('Muitas tentativas. Aguarde um momento antes de tentar novamente.');
                return false;
            }
        });
    }
    
    setupValidation() {
        // Máscara para telefone com formato (XX)XXXXX-XXXX
        const phoneInput = document.getElementById('leadPhone');
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            
            // Aplicar máscara (XX)XXXXX-XXXX
            if (value.length <= 2) {
                value = `(${value}`;
            } else if (value.length <= 7) {
                value = `(${value.slice(0, 2)})${value.slice(2)}`;
            } else if (value.length <= 11) {
                value = `(${value.slice(0, 2)})${value.slice(2, 7)}-${value.slice(7)}`;
            } else {
                value = `(${value.slice(0, 2)})${value.slice(2, 7)}-${value.slice(7, 11)}`;
            }
            
            e.target.value = value;
        });
        
        // Validação de nome (apenas letras e espaços)
        const nameInput = document.getElementById('leadName');
        nameInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
        });
    }
    
    validateField(field) {
        const fieldName = field.name;
        const value = field.value.trim();
        
        this.clearFieldError(field);
        
        switch (fieldName) {
            case 'name':
                return this.validateName(value, field);
            case 'email':
                return this.validateEmail(value, field);
            case 'phone':
                return this.validatePhone(value, field);
            case 'terms':
                return this.validateTerms(field);
            default:
                return true;
        }
    }
    
    validateName(value, field) {
        if (!value) {
            this.showFieldError(field, 'Nome é obrigatório');
            return false;
        }
        
        // Verificar se contém apenas letras e espaços
        if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) {
            this.showFieldError(field, 'Nome deve conter apenas letras e espaços');
            return false;
        }
        
        // Dividir o nome em partes (separadas por espaços)
        const nameParts = value.trim().split(/\s+/).filter(part => part.length > 0);
        
        if (nameParts.length < 2) {
            this.showFieldError(field, 'Por favor, informe seu nome completo (nome e sobrenome)');
            return false;
        }
        
        // Verificar se cada parte tem pelo menos 2 caracteres
        for (const part of nameParts) {
            if (part.length < 2) {
                this.showFieldError(field, 'Nome e sobrenome devem ter pelo menos 2 caracteres cada');
                return false;
            }
            
            // Verificar se não está na lista negra de nomes genéricos
            if (this.blockedNames.includes(part.toLowerCase())) {
                this.showFieldError(field, 'Por favor, use seu nome real (não aceitamos nomes genéricos)');
                return false;
            }
        }
        
        if (value.length > 100) {
            this.showFieldError(field, 'Nome deve ter no máximo 100 caracteres');
            return false;
        }
        
        return true;
    }
    
    validateEmail(value, field) {
        if (!value) {
            this.showFieldError(field, 'Email é obrigatório');
            return false;
        }
        
        // Regex básico para email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            this.showFieldError(field, 'Formato de email inválido');
            return false;
        }
        
        // Verificar lista negra
        if (this.blockedEmails.includes(value.toLowerCase())) {
            this.showFieldError(field, 'Por favor, use um email válido');
            return false;
        }
        
        // Verificar padrões de emails de teste
        const emailPatterns = [
            /@teste\./i,
            /@test\./i,
            /teste@/i,
            /test@/i,
            /@fake\./i,
            /@spam\./i,
            /@example\./i,
            /@demo\./i
        ];
        
        if (emailPatterns.some(pattern => pattern.test(value))) {
            this.showFieldError(field, 'Por favor, use um email válido e real');
            return false;
        }
        
        return true;
    }
    
    validatePhone(value, field) {
        if (!value) {
            this.showFieldError(field, 'Telefone é obrigatório');
            return false;
        }
        
        // Remover caracteres não numéricos
        const cleanPhone = value.replace(/\D/g, '');
        
        if (cleanPhone.length < 10) {
            this.showFieldError(field, 'Telefone deve ter pelo menos 10 dígitos');
            return false;
        }
        
        if (cleanPhone.length > 11) {
            this.showFieldError(field, 'Telefone deve ter no máximo 11 dígitos');
            return false;
        }
        
        // Verificar se não é um padrão repetitivo
        if (this.isRepetitivePattern(cleanPhone)) {
            this.showFieldError(field, 'Por favor, use um telefone válido');
            return false;
        }
        
        // Verificar padrões sequenciais comuns
        if (this.isSequentialPattern(cleanPhone)) {
            this.showFieldError(field, 'Por favor, use um telefone válido');
            return false;
        }
        
        return true;
    }
    
    validateTerms(field) {
        if (!field.checked) {
            this.showFieldError(field, 'Você deve aceitar os termos para continuar');
            return false;
        }
        return true;
    }
    
    isRepetitivePattern(phone) {
        // Verificar padrões como 1111111111, 2222222222, etc.
        const firstDigit = phone[0];
        return phone.split('').every(digit => digit === firstDigit);
    }
    
    isSequentialPattern(phone) {
        // Verificar padrões sequenciais como (31)99999-9999, (11)11111-1111, etc.
        const digits = phone.split('');
        
        // Verificar se todos os dígitos após o DDD são iguais
        if (digits.length >= 4) {
            const afterDDD = digits.slice(2);
            const firstAfterDDD = afterDDD[0];
            if (afterDDD.every(digit => digit === firstAfterDDD)) {
                return true;
            }
        }
        
        // Verificar padrões como 1234567890, 9876543210
        let isAscending = true;
        let isDescending = true;
        
        for (let i = 1; i < digits.length; i++) {
            if (parseInt(digits[i]) !== parseInt(digits[i-1]) + 1) {
                isAscending = false;
            }
            if (parseInt(digits[i]) !== parseInt(digits[i-1]) - 1) {
                isDescending = false;
            }
        }
        
        return isAscending || isDescending;
    }
    
    showFieldError(field, message) {
        const errorElement = document.getElementById(`${field.name}Error`);
        if (errorElement) {
            errorElement.textContent = message;
        }
        field.classList.add('error');
    }
    
    clearFieldError(field) {
        const errorElement = document.getElementById(`${field.name}Error`);
        if (errorElement) {
            errorElement.textContent = '';
        }
        field.classList.remove('error');
    }
    
    showError(message) {
        // Criar ou atualizar elemento de erro global
        let errorElement = document.getElementById('globalError');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = 'globalError';
            errorElement.className = 'global-error';
            this.form.insertBefore(errorElement, this.form.firstChild);
        }
        errorElement.innerHTML = `⚠️ ${message}`;
        errorElement.style.display = 'block';
        
        // Auto-remover após 5 segundos
        setTimeout(() => {
            if (errorElement) {
                errorElement.style.display = 'none';
            }
        }, 5000);
    }
    
    isRateLimited() {
        const now = Date.now();
        const lastAttempt = localStorage.getItem('leadLastAttempt');
        
        if (lastAttempt) {
            const timeDiff = now - parseInt(lastAttempt);
            if (timeDiff < this.rateLimitWindow) {
                return true;
            }
        }
        
        return false;
    }
    
    async handleSubmit() {
        // Validar todos os campos
        const nameField = document.getElementById('leadName');
        const emailField = document.getElementById('leadEmail');
        const phoneField = document.getElementById('leadPhone');
        const termsField = document.getElementById('leadTerms');
        
        const isValid = 
            this.validateName(nameField.value.trim(), nameField) &&
            this.validateEmail(emailField.value.trim(), emailField) &&
            this.validatePhone(phoneField.value.trim(), phoneField) &&
            this.validateTerms(termsField);
        
        if (!isValid) {
            this.showError('Por favor, corrija os erros nos campos');
            return;
        }
        
        // Verificar rate limiting
        if (this.isRateLimited()) {
            this.showError('Muitas tentativas. Aguarde um momento antes de tentar novamente.');
            return;
        }
        
        // Preparar dados
        const leadData = {
            name: nameField.value.trim(),
            email: emailField.value.trim().toLowerCase(),
            phone: phoneField.value.replace(/\D/g, ''),
            terms: termsField.checked,
            source: 'canvas-nicho-icp'
        };
        
        // Mostrar loading
        this.setLoading(true);
        
        try {
            // Enviar para Supabase
            const success = await this.saveToSupabase(leadData);
            
            if (success) {
                // Salvar timestamp da última tentativa
                localStorage.setItem('leadLastAttempt', Date.now().toString());
                
                // Salvar IP para evitar captura duplicada
                const userIP = await this.obterIP();
                localStorage.setItem('leadIP', userIP);
                
                // Marcar como capturado na sessão
                sessionStorage.setItem('leadCaptured', 'true');
                
                // Liberar canvas
                this.liberarCanvas();
                
                console.log('✅ Lead capturado com sucesso');
            } else {
                this.setLoading(false);
                this.showError('Erro ao enviar dados. Tente novamente.');
            }
            
        } catch (error) {
            console.error('❌ Erro ao capturar lead:', error);
            this.setLoading(false);
            this.showError('Erro de conexão. Verifique sua internet e tente novamente.');
        }
    }
    
    async saveToSupabase(data) {
        try {
            if (!window.SUPABASE_CONFIG) {
                console.error('❌ Configuração do Supabase não encontrada');
                return false;
            }
            
            console.log('📤 Enviando dados para Supabase:', data);
            
            const response = await fetch(
                `${window.SUPABASE_CONFIG.URL}/rest/v1/leads`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': window.SUPABASE_CONFIG.ANON_KEY,
                        'Authorization': `Bearer ${window.SUPABASE_CONFIG.ANON_KEY}`,
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify(data)
                }
            );
            
            console.log('📥 Resposta do Supabase:', response.status, response.statusText);
            
            if (response.ok || response.status === 201) {
                // Supabase pode retornar 200 ou 201 com ou sem corpo JSON
                // Com 'Prefer: return=minimal', não haverá corpo na resposta
                console.log('✅ Lead salvo no Supabase com sucesso!');
                return true;
            } else {
                // Tentar ler o erro como JSON
                let errorMessage = 'Erro desconhecido';
                try {
                    const errorText = await response.text();
                    console.error('❌ Resposta de erro:', errorText);
                    
                    if (errorText) {
                        const errorData = JSON.parse(errorText);
                        errorMessage = errorData.message || errorData.error || errorText;
                    }
                } catch (parseError) {
                    console.error('❌ Erro ao processar resposta:', parseError);
                }
                
                // Tratar erros específicos
                if (response.status === 404) {
                    this.showError('Tabela "leads" não encontrada no Supabase. Verifique a configuração.');
                } else if (response.status === 409) {
                    this.showError('Este email já foi cadastrado.');
                } else if (response.status === 422) {
                    this.showError('Dados inválidos. Verifique os campos.');
                } else if (response.status === 401 || response.status === 403) {
                    this.showError('Erro de permissão. Verifique as políticas RLS no Supabase.');
                } else {
                    this.showError(`Erro no servidor (${response.status}). Tente novamente.`);
                }
                
                return false;
            }
        } catch (error) {
            console.error('❌ Erro de conexão com Supabase:', error);
            this.showError('Erro de conexão. Verifique sua internet e a configuração do Supabase.');
            return false;
        }
    }
    
    setLoading(loading) {
        if (loading) {
            this.submitBtn.disabled = true;
            this.submitText.style.display = 'none';
            this.submitLoading.style.display = 'inline-flex';
        } else {
            this.submitBtn.disabled = false;
            this.submitText.style.display = 'inline';
            this.submitLoading.style.display = 'none';
        }
    }
    
    liberarCanvas() {
        // Fechar modal com animação
        this.modal.classList.add('hidden');
        
        // Chamar função global para liberar canvas
        liberarCanvas();
        
        console.log('✅ Canvas liberado para uso');
    }
}

// ========================================
// FORMULÁRIO DE CAPTURA DE LEADS REMOVIDO
// ========================================
// O formulário foi completamente removido para permitir acesso direto ao canvas

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
        // Coletar nicho selecionado (radio button)
        const nichoSelecionado = document.querySelector('input[name="nicho"]:checked');
        const nichoCustom = document.getElementById('nichoCustom');
        const nicho = nichoSelecionado ? (nichoSelecionado.value === 'outro' && nichoCustom ? nichoCustom.value : nichoSelecionado.value) : '';
        
        // Coletar dores selecionadas (checkboxes)
        const doresSelecionadas = Array.from(document.querySelectorAll('input[name="dores"]:checked')).map(cb => cb.value);
        
        // Coletar dados de capacidade financeira
        const estruturaFisica = document.querySelector('input[name="estruturaFisica"]:checked');
        const tamanhoEquipe = document.querySelector('input[name="tamanhoEquipe"]:checked');
        const volumeClientes = document.querySelector('input[name="volumeClientes"]:checked');
        const ticketMedio = document.querySelector('input[name="ticketMedio"]:checked');
        const investeMarketing = document.querySelector('input[name="investeMarketing"]:checked');
        
        // Coletar canais de acesso (checkboxes)
        const canaisSelecionados = Array.from(document.querySelectorAll('input[name="canais"]:checked')).map(cb => cb.value);
        
        // Coletar serviços selecionados
        const servicosSelecionados = Array.from(document.querySelectorAll('input[name="servicos"]:checked')).map(checkbox => {
            const detalhesInput = checkbox.parentElement.querySelector('.servico-input');
            return {
                servico: checkbox.value,
                detalhes: detalhesInput ? detalhesInput.value : ''
            };
        });
        
        return {
            triada1: document.getElementById('triada1')?.checked || false,
            triada2: document.getElementById('triada2')?.checked || false,
            triada3: document.getElementById('triada3')?.checked || false,
            nicho: nicho,
            dores: doresSelecionadas.join(', '),
            capacidadeFinanceira: {
                estruturaFisica: estruturaFisica ? estruturaFisica.value : '',
                tamanhoEquipe: tamanhoEquipe ? tamanhoEquipe.value : '',
                volumeClientes: volumeClientes ? volumeClientes.value : '',
                ticketMedio: ticketMedio ? ticketMedio.value : '',
                investeMarketing: investeMarketing ? investeMarketing.value : ''
            },
            canais: canaisSelecionados.join(', '),
            servicos: servicosSelecionados,
            checks: {
                check1: document.getElementById('check1')?.checked || false,
                check2: document.getElementById('check2')?.checked || false,
                check3: document.getElementById('check3')?.checked || false,
                check4: document.getElementById('check4')?.checked || false,
                check5: document.getElementById('check5')?.checked || false,
                check6: document.getElementById('check6')?.checked || false,
                check7: document.getElementById('check7')?.checked || false,
                check8: document.getElementById('check8')?.checked || false,
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

// ========================================
// INICIALIZAÇÃO
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOMContentLoaded - Iniciando inicialização...');
    
    try {
        // Inicializar LeadCapture (modal de captura)
        console.log('🔧 Criando LeadCapture...');
        window.leadCapture = new LeadCapture();
        console.log('✅ LeadCapture criado:', !!window.leadCapture);
        
        // Verificar se o lead já foi capturado na sessão
        if (sessionStorage.getItem('leadCaptured') === 'true') {
            console.log('🔧 Lead já capturado, liberando canvas...');
            liberarCanvas();
        } else {
            console.log('🔧 Lead não capturado, modal será exibido');
        }
        
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

// Função para liberar o canvas (chamada pelo LeadCapture)
function liberarCanvas() {
    console.log('🔧 Liberando canvas...');
    
    // Verificar se DOM está pronto
    if (document.readyState !== 'complete') {
        console.log('⏳ DOM não está pronto, aguardando...');
        window.addEventListener('load', liberarCanvas, { once: true });
        return;
    }
    
    // Remover classe de bloqueio do container
    const container = document.querySelector('.container');
    if (container) {
        container.classList.remove('canvas-bloqueado');
        container.classList.add('canvas-liberado');
    }
    
    // Verificar se já foi inicializado
    if (window.canvas && window.canvasAutomatizado) {
        console.log('✅ Canvas já inicializado');
        return;
    }
    
    // Inicializar canvas após um pequeno delay para a animação
    setTimeout(() => {
        try {
            // Verificar elementos necessários
            const canvasForm = document.getElementById('canvasForm');
            if (!canvasForm) {
                console.error('❌ Elemento canvasForm não encontrado');
                return;
            }
            
            // Inicializar canvas
            console.log('🔧 Criando CanvasNichoICP...');
            window.canvas = new CanvasNichoICP();
            console.log('✅ CanvasNichoICP criado:', !!window.canvas);
            
            // Inicializar canvas automatizado
            console.log('🔧 Criando CanvasAutomatizado...');
            window.canvasAutomatizado = new CanvasAutomatizado();
            console.log('✅ CanvasAutomatizado criado:', !!window.canvasAutomatizado);
            
            console.log('✅ Canvas inicializado com sucesso!');
        } catch (error) {
            console.error('❌ Erro ao inicializar canvas:', error);
            // Tentar novamente após 1 segundo
            setTimeout(() => {
                console.log('🔄 Tentando reinicializar canvas...');
                window.canvas = null;
                window.canvasAutomatizado = null;
                liberarCanvas();
            }, 1000);
        }
    }, 300);
}

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
        
        let totalMensal = 0;
        let totalUnico = 0;
        const servicosMensais = [];
        const servicosUnicos = [];
        
        // Separar serviços mensais dos únicos
        servicosSelecionados.forEach(servico => {
            const preco = this.precos[servico] ? this.precos[servico][this.capacidadeFinanceira] : 0;
            const servicoInfo = this.servicos[servico];
            
            if (servico === 'desenvolvimento-sites') {
                // Sites e landing pages são cobrados uma única vez
                totalUnico += preco;
                servicosUnicos.push({
                    nome: servicoInfo ? servicoInfo.nome : servico,
                    preco: preco,
                    icon: servicoInfo ? servicoInfo.icon : '💻'
                });
                console.log(`🔧 calcularPrecificacao: ${servico} (único) = R$ ${preco}`);
            } else {
                // Outros serviços são mensais
                totalMensal += preco;
                servicosMensais.push({
                    nome: servicoInfo ? servicoInfo.nome : servico,
                    preco: preco,
                    icon: servicoInfo ? servicoInfo.icon : '📦'
                });
                console.log(`🔧 calcularPrecificacao: ${servico} (mensal) = R$ ${preco}`);
            }
        });
        
        // Aplicar multiplicador do nicho
        const nichoSelecionado = document.querySelector('input[name="nicho"]:checked');
        let multiplicadorNicho = 1;
        
        if (nichoSelecionado && nichoSelecionado.value !== 'outro' && this.nichos[nichoSelecionado.value]) {
            multiplicadorNicho = this.nichos[nichoSelecionado.value].multiplicador;
            console.log(`🔧 calcularPrecificacao: Multiplicador do nicho ${nichoSelecionado.value}: ${multiplicadorNicho}`);
        }
        
        totalMensal *= multiplicadorNicho;
        totalUnico *= multiplicadorNicho;
        
        console.log(`🔧 calcularPrecificacao: Total mensal: R$ ${totalMensal}, Total único: R$ ${totalUnico}`);
        
        // Calcular jornadas (apenas serviços mensais)
        const enxuta = Math.round(totalMensal * 0.6);
        const padrao = Math.round(totalMensal * 0.8);
        const completa = Math.round(totalMensal);
        
        console.log(`🔧 calcularPrecificacao: Jornadas - Enxuta: R$ ${enxuta}, Padrão: R$ ${padrao}, Completa: R$ ${completa}`);
        
        // Atualizar interface
        this.atualizarResultadoPrecificacao(servicosMensais, servicosUnicos, totalMensal, totalUnico);
        this.atualizarJornadas(enxuta, padrao, completa);
        this.atualizarResumoJornadas(enxuta, padrao, completa);
        
        console.log('✅ calcularPrecificacao: Concluído');
    }
    
    atualizarResultadoPrecificacao(servicosMensais, servicosUnicos, totalMensal, totalUnico) {
        console.log('🔧 atualizarResultadoPrecificacao: Atualizando...', {servicosMensais, servicosUnicos, totalMensal, totalUnico});
        const container = document.getElementById('resultadoPrecificacao');
        if (!container) {
            console.error('❌ Elemento resultadoPrecificacao não encontrado');
            return;
        }
        
        if (servicosMensais.length === 0 && servicosUnicos.length === 0) {
            container.innerHTML = '<p>Selecione os serviços para ver a precificação sugerida</p>';
            return;
        }
        
        let html = '<div class="precificacao-detalhada">';
        
        // Serviços mensais (recorrentes)
        if (servicosMensais.length > 0) {
            html += '<h5 style="margin-bottom: 10px; color: #333; border-bottom: 1px solid #eee; padding-bottom: 5px;">📅 Serviços Mensais (Recorrentes):</h5>';
            servicosMensais.forEach(servico => {
                html += `
                    <div class="item-precificacao">
                        <span>${servico.icon} ${servico.nome}</span>
                        <span>R$ ${servico.preco.toLocaleString('pt-BR')}/mês</span>
                    </div>
                `;
            });
            
            html += `
                <div class="total-precificacao">
                    <strong>Total Mensal: R$ ${totalMensal.toLocaleString('pt-BR')}/mês</strong>
                </div>
            `;
        }
        
        // Serviços únicos (implementação)
        if (servicosUnicos.length > 0) {
            html += '<h5 style="margin-top: 20px; margin-bottom: 10px; color: #333; border-bottom: 1px solid #eee; padding-bottom: 5px;">💻 Implementação (Parcela Única):</h5>';
            servicosUnicos.forEach(servico => {
                html += `
                    <div class="item-precificacao">
                        <span>${servico.icon} ${servico.nome}</span>
                        <span>R$ ${servico.preco.toLocaleString('pt-BR')}</span>
                    </div>
                `;
            });
            
            html += `
                <div class="total-precificacao">
                    <strong>Total Implementação: R$ ${totalUnico.toLocaleString('pt-BR')}</strong>
                </div>
            `;
        }
        
        html += '</div>';
        
        container.innerHTML = html;
        console.log('✅ atualizarResultadoPrecificacao: Precificação atualizada');
    }
    
    atualizarJornadas(enxuta, padrao, completa) {
        const pacoteBasico = document.getElementById('pacoteBasico');
        const pacoteIntermediario = document.getElementById('pacoteIntermediario');
        const pacotePremium = document.getElementById('pacotePremium');
        
        if (pacoteBasico) {
            const precoElement = pacoteBasico.querySelector('.jornada-preco');
            if (precoElement) precoElement.textContent = `R$ ${enxuta.toLocaleString('pt-BR')}`;
        }
        
        if (pacoteIntermediario) {
            const precoElement = pacoteIntermediario.querySelector('.jornada-preco');
            if (precoElement) precoElement.textContent = `R$ ${padrao.toLocaleString('pt-BR')}`;
        }
        
        if (pacotePremium) {
            const precoElement = pacotePremium.querySelector('.jornada-preco');
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
// FUNÇÕES DE EXPORTAÇÃO
// ========================================

function exportarPDF() {
    try {
        console.log('🔄 Iniciando exportação PDF estratégico...');
        
        // Verificar se window.canvas existe
        if (!window.canvas) {
            console.error('❌ window.canvas não está disponível');
            alert('❌ Canvas não inicializado. Recarregue a página e tente novamente.');
            return;
        }
        
        // Coletar dados do canvas
        const dados = window.canvas.coletarDados();
        console.log('📊 Dados coletados:', dados);
        
        // Verificar se dados foram coletados
        if (!dados || Object.keys(dados).length === 0) {
            console.error('❌ Nenhum dado coletado do canvas');
            alert('❌ Nenhum dado encontrado para exportar. Preencha o canvas primeiro.');
            return;
        }
        
        // Calcular métricas estratégicas
        const triadaScore = [dados.triada1, dados.triada2, dados.triada3].filter(Boolean).length;
        const checksCompletos = Object.values(dados.checks).filter(Boolean).length;
        const readinessScore = Math.round((checksCompletos / 8) * 100);
        const servicosCount = dados.servicos ? dados.servicos.length : 0;
        
        // Calcular score de capacidade financeira
        let capacidadeScore = 'Baixo';
        let estimatedBudget = { min: 1000, max: 3000 };
        
        if (dados.capacidadeFinanceira) {
            const { estruturaFisica, tamanhoEquipe, ticketMedio, investeMarketing } = dados.capacidadeFinanceira;
            let score = 0;
            
            if (estruturaFisica === 'propria') score += 2;
            else if (estruturaFisica === 'alugada') score += 1;
            
            if (tamanhoEquipe === '11-50' || tamanhoEquipe === '50+') score += 2;
            else if (tamanhoEquipe === '3-10') score += 1;
            
            if (ticketMedio === '2000-10000' || ticketMedio === '10000+') score += 2;
            else if (ticketMedio === '500-2000') score += 1;
            
            if (investeMarketing === 'sim') score += 1;
            
            if (score >= 6) {
                capacidadeScore = 'Alto';
                estimatedBudget = { min: 5000, max: 15000 };
            } else if (score >= 3) {
                capacidadeScore = 'Médio';
                estimatedBudget = { min: 3000, max: 8000 };
            }
        }
        
        // Calcular meta de contratos para calculadora
        const ticketMedio = dados.capacidadeFinanceira?.ticketMedio || '500-2000';
        let ticketMedioNumero = 1000;
        
        if (ticketMedio === '500-2000') ticketMedioNumero = 1250;
        else if (ticketMedio === '2000-10000') ticketMedioNumero = 6000;
        else if (ticketMedio === '10000+') ticketMedioNumero = 15000;
        
        const metaMensal = estimatedBudget.max;
        const contratosNecessarios = Math.ceil(metaMensal / ticketMedioNumero);
        
        // Gerar template HTML estratégico
        const templateHTML = gerarTemplatePDFEstrategico(dados, {
            triadaScore,
            readinessScore,
            capacidadeScore,
            estimatedBudget,
            ticketMedioNumero,
            metaMensal,
            contratosNecessarios
        });
        
        console.log('📝 Template PDF estratégico gerado');
        
        // Configurações do html2pdf
        const opt = {
            margin: 0.5,
            filename: `canvas-estrategico-${new Date().toISOString().split('T')[0]}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2,
                useCORS: true,
                allowTaint: true,
                scrollX: 0,
                scrollY: 0
            },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        
        console.log('📝 Gerando PDF estratégico...');
        
        // Criar elemento temporário com o template
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = templateHTML;
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.top = '-9999px';
        document.body.appendChild(tempDiv);
        
        // Gerar PDF do template
        html2pdf().set(opt).from(tempDiv).save().then(() => {
            // Remover elemento temporário
            document.body.removeChild(tempDiv);
            console.log('✅ PDF estratégico exportado com sucesso');
        });
        
        // Track analytics
        if (typeof window.va === 'function') {
            window.va('track', 'Export PDF Strategic');
        }
    } catch (error) {
        console.error('❌ Erro na função exportarPDF:', error);
        alert('❌ Erro inesperado ao exportar PDF: ' + error.message);
    }
}

function gerarTemplatePDFEstrategico(dados, metricas) {
    const { triadaScore, readinessScore, capacidadeScore, estimatedBudget, ticketMedioNumero, metaMensal, contratosNecessarios } = metricas;
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .pdf-container { max-width: 8.5in; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #F2b705; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #F2b705; margin-bottom: 10px; }
            .subtitle { color: #666; font-size: 14px; }
            .page { page-break-after: always; margin-bottom: 30px; }
            .page:last-child { page-break-after: avoid; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 18px; font-weight: bold; color: #F2b705; margin-bottom: 15px; border-left: 4px solid #F2b705; padding-left: 15px; }
            .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px; }
            .metric-card { background: linear-gradient(135deg, #F2b705, #E6A500); color: white; padding: 15px; border-radius: 8px; text-align: center; }
            .metric-value { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
            .metric-label { font-size: 12px; opacity: 0.9; }
            .progress-circle { width: 80px; height: 80px; border-radius: 50%; background: conic-gradient(#F2b705 ${readinessScore * 3.6}deg, #e0e0e0 0deg); display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; }
            .progress-text { background: white; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #333; }
            .triada-status { display: flex; justify-content: center; gap: 20px; margin: 20px 0; }
            .triada-item { text-align: center; }
            .triada-check { width: 30px; height: 30px; border-radius: 50%; background: #4CAF50; color: white; display: flex; align-items: center; justify-content: center; margin: 0 auto 5px; font-weight: bold; }
            .triada-uncheck { width: 30px; height: 30px; border-radius: 50%; background: #f44336; color: white; display: flex; align-items: center; justify-content: center; margin: 0 auto 5px; font-weight: bold; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .info-card { background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #F2b705; }
            .info-label { font-weight: bold; color: #666; font-size: 12px; margin-bottom: 5px; }
            .info-value { font-size: 16px; color: #333; }
            .pricing-tiers { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }
            .pricing-card { background: white; border: 2px solid #e0e0e0; padding: 15px; border-radius: 8px; text-align: center; }
            .pricing-card.recommended { border-color: #F2b705; background: #fff9e6; }
            .pricing-title { font-weight: bold; margin-bottom: 10px; }
            .pricing-value { font-size: 20px; color: #F2b705; font-weight: bold; }
            .action-checklist { margin: 20px 0; }
            .checklist-item { display: flex; align-items: center; margin-bottom: 10px; padding: 10px; background: #f8f9fa; border-radius: 5px; }
            .checklist-check { width: 20px; height: 20px; border-radius: 50%; background: #4CAF50; color: white; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-size: 12px; }
            .checklist-uncheck { width: 20px; height: 20px; border-radius: 50%; background: #e0e0e0; color: #666; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-size: 12px; }
            .calculator-cta { background: linear-gradient(135deg, #F2b705, #E6A500); color: white; padding: 25px; border-radius: 12px; text-align: center; margin: 30px 0; }
            .calculator-title { font-size: 20px; font-weight: bold; margin-bottom: 15px; }
            .calculator-metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }
            .calculator-metric { background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; }
            .calculator-button { background: white; color: #F2b705; padding: 12px 25px; border: none; border-radius: 25px; font-weight: bold; text-decoration: none; display: inline-block; margin-top: 15px; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="pdf-container">
            <!-- PÁGINA 1: RESUMO EXECUTIVO -->
            <div class="page">
                <div class="header">
                    <div class="logo">🏁 Canvas de Nicho e ICP</div>
                    <div class="subtitle">Calculadora de Precificação Inteligente | Método Pódium</div>
                </div>
                
                <div class="section">
                    <div class="progress-circle">
                        <div class="progress-text">${readinessScore}%</div>
                    </div>
                    <h2 style="text-align: center; margin-bottom: 20px;">Score de Prontidão para Prospecção</h2>
                </div>
                
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-value">${triadaScore}/3</div>
                        <div class="metric-label">Tríade Validada</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${dados.nicho || 'N/A'}</div>
                        <div class="metric-label">Nicho Selecionado</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${capacidadeScore}</div>
                        <div class="metric-label">Capacidade Financeira</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${servicosCount}</div>
                        <div class="metric-label">Serviços Definidos</div>
                    </div>
                </div>
                
                <div class="section">
                    <div class="section-title">Status da Tríade do Nicho</div>
                    <div class="triada-status">
                        <div class="triada-item">
                            <div class="${dados.triada1 ? 'triada-check' : 'triada-uncheck'}">${dados.triada1 ? '✓' : '✗'}</div>
                            <div>Sei Prestar</div>
                        </div>
                        <div class="triada-item">
                            <div class="${dados.triada2 ? 'triada-check' : 'triada-uncheck'}">${dados.triada2 ? '✓' : '✗'}</div>
                            <div>Mercado Precisa</div>
                        </div>
                        <div class="triada-item">
                            <div class="${dados.triada3 ? 'triada-check' : 'triada-uncheck'}">${dados.triada3 ? '✓' : '✗'}</div>
                            <div>Mercado Paga</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- PÁGINA 2: ANÁLISE DE NICHO E ICP -->
            <div class="page">
                <div class="section">
                    <div class="section-title">Definição de Nicho</div>
                    <div class="info-card">
                        <div class="info-label">Nicho Selecionado</div>
                        <div class="info-value">${dados.nicho || 'Não definido'}</div>
                    </div>
                </div>
                
                <div class="section">
                    <div class="section-title">Dores do Mercado Identificadas</div>
                    <div class="info-card">
                        <div class="info-value">${dados.dores || 'Não identificadas'}</div>
                    </div>
                </div>
                
                <div class="section">
                    <div class="section-title">Perfil do ICP - Capacidade Financeira</div>
                    <div class="info-grid">
                        <div class="info-card">
                            <div class="info-label">Estrutura Física</div>
                            <div class="info-value">${dados.capacidadeFinanceira?.estruturaFisica || 'Não definida'}</div>
                        </div>
                        <div class="info-card">
                            <div class="info-label">Tamanho da Equipe</div>
                            <div class="info-value">${dados.capacidadeFinanceira?.tamanhoEquipe || 'Não definido'}</div>
                        </div>
                        <div class="info-card">
                            <div class="info-label">Volume de Clientes/Mês</div>
                            <div class="info-value">${dados.capacidadeFinanceira?.volumeClientes || 'Não definido'}</div>
                        </div>
                        <div class="info-card">
                            <div class="info-label">Ticket Médio</div>
                            <div class="info-value">${dados.capacidadeFinanceira?.ticketMedio || 'Não definido'}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- PÁGINA 3: ESTRATÉGIA E PORTFÓLIO -->
            <div class="page">
                <div class="section">
                    <div class="section-title">Estratégia de Acesso</div>
                    <div class="info-card">
                        <div class="info-label">Canais Selecionados</div>
                        <div class="info-value">${dados.canais || 'Não definidos'}</div>
                    </div>
                </div>
                
                <div class="section">
                    <div class="section-title">Portfólio de Serviços</div>
                    ${dados.servicos && dados.servicos.length > 0 ? dados.servicos.map(servico => `
                        <div class="info-card" style="margin-bottom: 10px;">
                            <div class="info-label">${servico.servico}</div>
                            <div class="info-value">${servico.detalhes || 'Sem detalhes adicionais'}</div>
                        </div>
                    `).join('') : '<div class="info-card"><div class="info-value">Nenhum serviço selecionado</div></div>'}
                </div>
                
                <div class="section">
                    <div class="section-title">Precificação Sugerida</div>
                    <div class="pricing-tiers">
                        <div class="pricing-card">
                            <div class="pricing-title">Conservadora</div>
                            <div class="pricing-value">R$ ${Math.round(estimatedBudget.min * 0.7).toLocaleString()}</div>
                        </div>
                        <div class="pricing-card recommended">
                            <div class="pricing-title">Padrão</div>
                            <div class="pricing-value">R$ ${estimatedBudget.min.toLocaleString()}</div>
                        </div>
                        <div class="pricing-card">
                            <div class="pricing-title">Premium</div>
                            <div class="pricing-value">R$ ${Math.round(estimatedBudget.max * 0.8).toLocaleString()}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- PÁGINA 4: PLANO DE AÇÃO -->
            <div class="page">
                <div class="section">
                    <div class="section-title">Checklist de Validação</div>
                    <div class="action-checklist">
                        <div class="checklist-item">
                            <div class="${dados.checks.check1 ? 'checklist-check' : 'checklist-uncheck'}">${dados.checks.check1 ? '✓' : '○'}</div>
                            <div>Tríade do nicho validada</div>
                        </div>
                        <div class="checklist-item">
                            <div class="${dados.checks.check2 ? 'checklist-check' : 'checklist-uncheck'}">${dados.checks.check2 ? '✓' : '○'}</div>
                            <div>Nicho específico e bem definido</div>
                        </div>
                        <div class="checklist-item">
                            <div class="${dados.checks.check3 ? 'checklist-check' : 'checklist-uncheck'}">${dados.checks.check3 ? '✓' : '○'}</div>
                            <div>Dores do mercado claramente identificadas</div>
                        </div>
                        <div class="checklist-item">
                            <div class="${dados.checks.check4 ? 'checklist-check' : 'checklist-uncheck'}">${dados.checks.check4 ? '✓' : '○'}</div>
                            <div>Capacidade financeira validada</div>
                        </div>
                        <div class="checklist-item">
                            <div class="${dados.checks.check5 ? 'checklist-check' : 'checklist-uncheck'}">${dados.checks.check5 ? '✓' : '○'}</div>
                            <div>Acesso ao decisor confirmado</div>
                        </div>
                        <div class="checklist-item">
                            <div class="${dados.checks.check6 ? 'checklist-check' : 'checklist-uncheck'}">${dados.checks.check6 ? '✓' : '○'}</div>
                            <div>Serviços selecionados e bem definidos</div>
                        </div>
                        <div class="checklist-item">
                            <div class="${dados.checks.check7 ? 'checklist-check' : 'checklist-uncheck'}">${dados.checks.check7 ? '✓' : '○'}</div>
                            <div>Precificação calculada baseada na capacidade financeira</div>
                        </div>
                        <div class="checklist-item">
                            <div class="${dados.checks.check8 ? 'checklist-check' : 'checklist-uncheck'}">${dados.checks.check8 ? '✓' : '○'}</div>
                            <div>Pronto para começar a prospectar</div>
                        </div>
                    </div>
                </div>
                
                <div class="calculator-cta">
                    <div class="calculator-title">📊 PRÓXIMO PASSO: CALCULE SUAS LIGAÇÕES</div>
                    <div class="calculator-metrics">
                        <div class="calculator-metric">
                            <div style="font-size: 14px; margin-bottom: 5px;">Ticket Médio</div>
                            <div style="font-size: 18px; font-weight: bold;">R$ ${ticketMedioNumero.toLocaleString()}</div>
                        </div>
                        <div class="calculator-metric">
                            <div style="font-size: 14px; margin-bottom: 5px;">Meta Sugerida</div>
                            <div style="font-size: 18px; font-weight: bold;">R$ ${metaMensal.toLocaleString()}/mês</div>
                        </div>
                        <div class="calculator-metric">
                            <div style="font-size: 14px; margin-bottom: 5px;">Contratos Necessários</div>
                            <div style="font-size: 18px; font-weight: bold;">${contratosNecessarios}</div>
                        </div>
                    </div>
                    <div style="margin: 20px 0;">
                        <strong>Acesse a Calculadora de Contratos Pódium para calcular quantas ligações você precisa fazer para atingir sua meta!</strong>
                    </div>
                    <a href="https://calculadora-contratos-podium.vercel.app/" class="calculator-button" target="_blank">
                        🚀 Acessar Calculadora Pódium
                    </a>
                </div>
                
                <div class="footer">
                    <div>Canvas de Nicho e ICP - Método Pódium | Exportado em ${new Date().toLocaleDateString('pt-BR')}</div>
                    <div>Calculadora de Precificação Inteligente | Versão 1.0</div>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
}

function exportarExcel() {
    try {
        console.log('🔄 Iniciando exportação Excel/CSV estratégico...');
        
        // Verificar se window.canvas existe
        if (!window.canvas) {
            console.error('❌ window.canvas não está disponível');
            alert('❌ Canvas não inicializado. Recarregue a página e tente novamente.');
            return;
        }
        
        // Coletar dados do canvas
        const dados = window.canvas.coletarDados();
        console.log('📊 Dados coletados:', dados);
        
        // Verificar se dados foram coletados
        if (!dados || Object.keys(dados).length === 0) {
            console.error('❌ Nenhum dado coletado do canvas');
            alert('❌ Nenhum dado encontrado para exportar. Preencha o canvas primeiro.');
            return;
        }
        
        // Calcular métricas estratégicas
        const triadaScore = [dados.triada1, dados.triada2, dados.triada3].filter(Boolean).length;
        const checksCompletos = Object.values(dados.checks).filter(Boolean).length;
        const readinessScore = Math.round((checksCompletos / 8) * 100);
        const servicosCount = dados.servicos ? dados.servicos.length : 0;
        
        // Calcular score de capacidade financeira
        let capacidadeScore = 'Baixo';
        if (dados.capacidadeFinanceira) {
            const { estruturaFisica, tamanhoEquipe, ticketMedio, investeMarketing } = dados.capacidadeFinanceira;
            let score = 0;
            
            if (estruturaFisica === 'propria') score += 2;
            else if (estruturaFisica === 'alugada') score += 1;
            
            if (tamanhoEquipe === '11-50' || tamanhoEquipe === '50+') score += 2;
            else if (tamanhoEquipe === '3-10') score += 1;
            
            if (ticketMedio === '2000-10000' || ticketMedio === '10000+') score += 2;
            else if (ticketMedio === '500-2000') score += 1;
            
            if (investeMarketing === 'sim') score += 1;
            
            if (score >= 6) capacidadeScore = 'Alto';
            else if (score >= 3) capacidadeScore = 'Médio';
        }
        
        // Criar CSV estruturado estratégico
        let csv = 'CANVAS DE NICHO E ICP - MÉTODO PÓDIUM - RELATÓRIO ESTRATÉGICO\n';
        csv += `Data de Exportação,${new Date().toLocaleDateString('pt-BR')}\n`;
        csv += `Versão do Canvas,1.0\n`;
        csv += `Score de Prontidão,${readinessScore}%\n\n`;
        
        // SEÇÃO 1: DEFINIÇÃO DE NICHO
        csv += 'SEÇÃO 1: DEFINIÇÃO DE NICHO\n';
        csv += `Tríade Validada,${triadaScore}/3\n`;
        csv += `Nicho Selecionado,${dados.nicho || 'Não definido'}\n`;
        csv += `Dores Identificadas,"${dados.dores || 'Não definidas'}"\n\n`;
        
        // SEÇÃO 2: PERFIL DO ICP
        csv += 'SEÇÃO 2: PERFIL DO ICP\n';
        if (dados.capacidadeFinanceira) {
            csv += `Estrutura Física,${dados.capacidadeFinanceira.estruturaFisica || 'Não definida'}\n`;
            csv += `Tamanho da Equipe,${dados.capacidadeFinanceira.tamanhoEquipe || 'Não definido'}\n`;
            csv += `Volume de Clientes/Mês,${dados.capacidadeFinanceira.volumeClientes || 'Não definido'}\n`;
            csv += `Ticket Médio,${dados.capacidadeFinanceira.ticketMedio || 'Não definido'}\n`;
            csv += `Investe em Marketing,${dados.capacidadeFinanceira.investeMarketing || 'Não definido'}\n`;
        } else {
            csv += 'Capacidade Financeira,Não definida\n';
        }
        csv += `Score de Capacidade Financeira,${capacidadeScore}\n\n`;
        
        // SEÇÃO 3: ESTRATÉGIA DE ACESSO
        csv += 'SEÇÃO 3: ESTRATÉGIA DE ACESSO\n';
        const canaisArray = dados.canais ? dados.canais.split(', ') : [];
        const coldCallPrioritario = canaisArray.includes('cold-call') ? 'Sim' : 'Não';
        csv += `Canal Prioritário,Cold Call (${coldCallPrioritario})\n`;
        csv += `Canais Selecionados,"${dados.canais || 'Nenhum selecionado'}"\n`;
        csv += `Total de Canais,${canaisArray.length}\n\n`;
        
        // SEÇÃO 4: PORTFÓLIO DE SERVIÇOS
        csv += 'SEÇÃO 4: PORTFÓLIO DE SERVIÇOS\n';
        if (dados.servicos && dados.servicos.length > 0) {
            dados.servicos.forEach((servico, index) => {
                csv += `Serviço ${index + 1},${servico.servico}\n`;
                csv += `Detalhes Serviço ${index + 1},"${servico.detalhes || ''}"\n`;
            });
        } else {
            csv += 'Serviços Selecionados,Nenhum serviço selecionado\n';
        }
        csv += `Total de Serviços,${servicosCount}\n\n`;
        
        // SEÇÃO 5: PLANO DE AÇÃO
        csv += 'SEÇÃO 5: PLANO DE AÇÃO\n';
        const checklistItems = [
            { id: 'check1', desc: 'Tríade do nicho validada' },
            { id: 'check2', desc: 'Nicho específico e bem definido' },
            { id: 'check3', desc: 'Dores do mercado claramente identificadas' },
            { id: 'check4', desc: 'Capacidade financeira validada' },
            { id: 'check5', desc: 'Acesso ao decisor confirmado' },
            { id: 'check6', desc: 'Serviços selecionados e bem definidos' },
            { id: 'check7', desc: 'Precificação calculada baseada na capacidade financeira' },
            { id: 'check8', desc: 'Pronto para começar a prospectar' }
        ];
        
        checklistItems.forEach((item, index) => {
            const status = dados.checks[item.id] ? 'Concluído' : 'Pendente';
            csv += `Item ${index + 1},${item.desc}\n`;
            csv += `Status ${index + 1},${status}\n`;
        });
        
        csv += `\nTaxa de Conclusão,${readinessScore}%\n`;
        csv += `Próximo Passo,Calcular meta de ligações na Calculadora Pódium\n`;
        csv += `URL Calculadora,https://calculadora-contratos-podium.vercel.app/\n`;
        
        console.log('📝 CSV estratégico gerado');
        
        // Download do arquivo
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `canvas-estrategico-${new Date().toISOString().split('T')[0]}.csv`;
        
        // Adicionar ao DOM temporariamente
        document.body.appendChild(link);
        link.click();
        
        // Limpar
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        
        console.log('✅ CSV estratégico exportado com sucesso');
        
        // Track analytics
        if (typeof window.va === 'function') {
            window.va('track', 'Export Excel Strategic');
        }
    } catch (error) {
        console.error('❌ Erro na função exportarExcel:', error);
        alert('❌ Erro ao exportar Excel/CSV: ' + error.message);
    }
}

function exportarJSON() {
    try {
        console.log('🔄 Iniciando exportação JSON estratégico...');
        
        // Verificar se window.canvas existe
        if (!window.canvas) {
            console.error('❌ window.canvas não está disponível');
            alert('❌ Canvas não inicializado. Recarregue a página e tente novamente.');
            return;
        }
        
        // Coletar dados do canvas
        const dados = window.canvas.coletarDados();
        console.log('📊 Dados coletados:', dados);
        
        // Verificar se dados foram coletados
        if (!dados || Object.keys(dados).length === 0) {
            console.error('❌ Nenhum dado coletado do canvas');
            alert('❌ Nenhum dado encontrado para exportar. Preencha o canvas primeiro.');
            return;
        }
        
        // Calcular métricas estratégicas
        const triadaScore = [dados.triada1, dados.triada2, dados.triada3].filter(Boolean).length;
        const checksCompletos = Object.values(dados.checks).filter(Boolean).length;
        const readinessScore = Math.round((checksCompletos / 8) * 100);
        const servicosCount = dados.servicos ? dados.servicos.length : 0;
        
        // Calcular score de capacidade financeira
        let capacidadeScore = 'Baixo';
        let estimatedBudget = { min: 1000, max: 3000 };
        
        if (dados.capacidadeFinanceira) {
            const { estruturaFisica, tamanhoEquipe, ticketMedio, investeMarketing } = dados.capacidadeFinanceira;
            let score = 0;
            
            if (estruturaFisica === 'propria') score += 2;
            else if (estruturaFisica === 'alugada') score += 1;
            
            if (tamanhoEquipe === '11-50' || tamanhoEquipe === '50+') score += 2;
            else if (tamanhoEquipe === '3-10') score += 1;
            
            if (ticketMedio === '2000-10000' || ticketMedio === '10000+') score += 2;
            else if (ticketMedio === '500-2000') score += 1;
            
            if (investeMarketing === 'sim') score += 1;
            
            if (score >= 6) {
                capacidadeScore = 'Alto';
                estimatedBudget = { min: 5000, max: 15000 };
            } else if (score >= 3) {
                capacidadeScore = 'Médio';
                estimatedBudget = { min: 3000, max: 8000 };
            }
        }
        
        // Calcular meta de contratos para calculadora
        const ticketMedio = dados.capacidadeFinanceira?.ticketMedio || '500-2000';
        let ticketMedioNumero = 1000;
        
        if (ticketMedio === '500-2000') ticketMedioNumero = 1250;
        else if (ticketMedio === '2000-10000') ticketMedioNumero = 6000;
        else if (ticketMedio === '10000+') ticketMedioNumero = 15000;
        
        const metaMensal = estimatedBudget.max;
        const contratosNecessarios = Math.ceil(metaMensal / ticketMedioNumero);
        
        // Criar estrutura JSON estratégica
        const jsonEstrategico = {
            metadata: {
                exportDate: new Date().toISOString(),
                version: "1.0",
                source: "Canvas de Nicho e ICP - Método Pódium",
                readinessScore: readinessScore,
                completionPercentage: readinessScore
            },
            businessIntelligence: {
                nicheValidation: {
                    triadaScore: `${triadaScore}/3`,
                    validated: triadaScore === 3,
                    selectedNiche: dados.nicho || null,
                    customNiche: dados.nichoCustom || null
                },
                marketPainPoints: dados.dores ? dados.dores.split(', ').map(dor => ({
                    pain: dor.trim(),
                    priority: 'high',
                    selected: true
                })) : []
            },
            icpProfile: {
                financialCapacity: {
                    structure: dados.capacidadeFinanceira?.estruturaFisica || null,
                    teamSize: dados.capacidadeFinanceira?.tamanhoEquipe || null,
                    clientVolume: dados.capacidadeFinanceira?.volumeClientes || null,
                    averageTicket: dados.capacidadeFinanceira?.ticketMedio || null,
                    marketingInvestment: dados.capacidadeFinanceira?.investeMarketing || null,
                    capacityScore: capacidadeScore.toLowerCase(),
                    estimatedBudget: {
                        min: estimatedBudget.min,
                        max: estimatedBudget.max,
                        currency: "BRL"
                    }
                }
            },
            accessStrategy: {
                channels: dados.canais ? dados.canais.split(', ').map((canal, index) => ({
                    channel: canal.trim(),
                    priority: index + 1,
                    isPodiumMethod: canal.trim() === 'cold-call'
                })) : [],
                recommendedApproach: dados.canais && dados.canais.includes('cold-call') ? 'outbound-first' : 'mixed'
            },
            servicePortfolio: dados.servicos ? dados.servicos.map(servico => ({
                service: servico.servico,
                details: servico.detalhes || '',
                pricing: {
                    conservative: Math.round(estimatedBudget.min * 0.7),
                    standard: Math.round(estimatedBudget.min),
                    premium: Math.round(estimatedBudget.max * 0.8),
                    currency: "BRL",
                    period: "monthly"
                }
            })) : [],
            actionPlan: {
                validationChecklist: {
                    items: [
                        { id: "check1", description: "Tríade do nicho validada", completed: dados.checks.check1 || false },
                        { id: "check2", description: "Nicho específico e bem definido", completed: dados.checks.check2 || false },
                        { id: "check3", description: "Dores do mercado claramente identificadas", completed: dados.checks.check3 || false },
                        { id: "check4", description: "Capacidade financeira validada", completed: dados.checks.check4 || false },
                        { id: "check5", description: "Acesso ao decisor confirmado", completed: dados.checks.check5 || false },
                        { id: "check6", description: "Serviços selecionados e bem definidos", completed: dados.checks.check6 || false },
                        { id: "check7", description: "Precificação calculada baseada na capacidade financeira", completed: dados.checks.check7 || false },
                        { id: "check8", description: "Pronto para começar a prospectar", completed: dados.checks.check8 || false }
                    ],
                    completionRate: readinessScore / 100
                },
                nextSteps: [
                    readinessScore < 100 ? "Completar validações pendentes no canvas" : "Iniciar prospecção via Cold Call",
                    "Preparar pitch de vendas personalizado",
                    "Calcular meta de ligações na Calculadora Pódium"
                ],
                calculatorIntegration: {
                    suggestedGoal: metaMensal,
                    averageTicket: ticketMedioNumero,
                    contractsNeeded: contratosNecessarios,
                    calculatorUrl: "https://calculadora-contratos-podium.vercel.app/"
                }
            }
        };
        
        console.log('📝 JSON estratégico gerado:', jsonEstrategico);
        
        // Download do arquivo
        const jsonString = JSON.stringify(jsonEstrategico, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `canvas-estrategico-${new Date().toISOString().split('T')[0]}.json`;
        
        // Adicionar ao DOM temporariamente
        document.body.appendChild(link);
        link.click();
        
        // Limpar
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        
        console.log('✅ JSON estratégico exportado com sucesso');
        
        // Track analytics
        if (typeof window.va === 'function') {
            window.va('track', 'Export JSON Strategic');
        }
    } catch (error) {
        console.error('❌ Erro na função exportarJSON:', error);
        alert('❌ Erro ao exportar JSON: ' + error.message);
    }
}

// Inicialização já feita acima - removendo duplicação
