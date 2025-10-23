// JavaScript simplificado para teste
console.log('🔧 JavaScript carregado');

// Classe básica para teste
class TesteCanvas {
    constructor() {
        console.log('🔧 TesteCanvas criado');
        this.init();
    }
    
    init() {
        console.log('🔧 TesteCanvas inicializado');
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOMContentLoaded - Iniciando teste...');
    
    try {
        window.testeCanvas = new TesteCanvas();
        console.log('✅ TesteCanvas criado:', !!window.testeCanvas);
        console.log('🎉 Inicialização completa!');
    } catch (error) {
        console.error('❌ Erro durante inicialização:', error);
    }
});
