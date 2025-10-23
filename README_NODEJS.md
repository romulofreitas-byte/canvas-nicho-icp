# 🚀 Canvas de Nicho e ICP - Método Pódium (Versão Node.js)

## 📋 Visão Geral

Esta é a versão **Node.js com Express** do Canvas de Nicho e ICP - Método Pódium. Uma aplicação web completa com servidor backend, APIs REST e integração com Supabase.

## ✨ Funcionalidades

- 🔐 **Autenticação por senha** - API REST para verificação de senha
- 🎯 **Tríade do Nicho** - Validação dos 3 pilares fundamentais
- 📝 **Canvas Interativo** - 6 seções de preenchimento estratégico
- 💾 **Auto-save** - Salvamento automático a cada 30 segundos
- ☁️ **Supabase Integration** - Persistência na nuvem via API
- 📱 **Responsivo** - Funciona em desktop, tablet e mobile
- 🖨️ **Impressão** - Geração de versão impressa
- 📊 **Analytics** - Vercel Analytics integrado
- 🔄 **APIs REST** - Endpoints para todas as operações

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 14+ instalado
- Conta no Supabase (para persistência de dados)
- Navegador web moderno

### Instalação
```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente (opcional)
# Edite o arquivo config.local.js se necessário

# Iniciar servidor
npm start

# Para desenvolvimento (com auto-reload)
npm run dev
```

### Acesso
- **Aplicação principal:** http://localhost:3000
- **Arquivo de teste:** http://localhost:3000/test
- **Health check:** http://localhost:3000/api/health

## 🔧 Configuração

### Variáveis de Ambiente
O servidor usa as seguintes configurações (definidas em `config.local.js`):

```javascript
{
    SUPABASE_URL: "https://wmsxiuxscmogbechxlty.supabase.co",
    SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    CANVAS_PASSWORD: "mundopodium",
    PORT: 3000,
    NODE_ENV: "development"
}
```

### Supabase
1. Execute o script `supabase-security-policies.sql` no Supabase
2. As credenciais já estão configuradas no `config.local.js`
3. Teste a conexão preenchendo e salvando um canvas

## 📡 APIs Disponíveis

### Autenticação
- `POST /api/verify-password` - Verificar senha de acesso

### Canvas
- `POST /api/save-canvas` - Salvar dados do canvas
- `GET /api/get-canvas/:fingerprint` - Obter dados do canvas

### Estatísticas
- `GET /api/stats` - Estatísticas gerais do sistema
- `GET /api/health` - Health check do servidor

## 🎯 Metodologia Pódium

### A Tríade do Nicho
Antes de escolher um nicho, você PRECISA validar estes três pilares:

1. **Eu sei prestar** - Tenho expertise e capacidade técnica
2. **Mercado precisa** - Existe uma dor real e urgente
3. **Mercado paga** - Há orçamento e disposição para investir

### Seções do Canvas
1. **Nicho** - Segmento de mercado específico
2. **Dores Principais** - 3 principais problemas do mercado
3. **Capacidade Financeira** - Orçamento e disposição para pagar
4. **Acesso ao Decisor** - Como encontrar e contatar
5. **Entregáveis** - Jornadas de serviços/soluções
6. **Precificação** - Preços estratégicos para cada jornada

## 📊 Tecnologias Utilizadas

- **Backend:** Node.js, Express.js
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Database:** Supabase (PostgreSQL)
- **Deploy:** Vercel, Heroku, Railway, etc.
- **Analytics:** Vercel Analytics
- **Autenticação:** Password local + API REST

## 🎨 Cores do Método Pódium

- **Amarelo Pódium:** `#F2b705`
- **Preto:** `#000000`
- **Branco:** `#FFFFFF`
- **Verde WhatsApp:** `#25D366`

## 📱 Comunidade

Junte-se à nossa comunidade gratuita no WhatsApp:
[🚀 Entrar na Comunidade](https://chat.whatsapp.com/L4camOPOJMxDb8et6M80oN)

## 🚀 Deploy

### Vercel
```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Heroku
```bash
# Criar app no Heroku
heroku create canvas-nicho-icp-podium

# Configurar variáveis de ambiente
heroku config:set VITE_SUPABASE_URL=...
heroku config:set VITE_SUPABASE_ANON_KEY=...
heroku config:set CANVAS_PASSWORD=mundopodium

# Deploy
git push heroku main
```

### Railway
```bash
# Conectar repositório GitHub
# Railway fará deploy automático
```

## 🔍 Estrutura do Projeto

```
canvas-nicho-icp/
├── server.js                 # Servidor Express principal
├── package.json              # Dependências e scripts
├── config.local.js           # Configurações locais
├── public/                   # Arquivos estáticos
│   ├── index.html           # Versão estática
│   ├── index-server.html    # Versão Node.js
│   ├── test-local.html      # Arquivo de teste
│   ├── styles.css           # Estilos CSS
│   ├── script.js            # JavaScript estático
│   ├── script-server.js     # JavaScript para Node.js
│   └── config.js            # Configuração frontend
├── supabase-security-policies.sql  # Script SQL
└── README_NODEJS.md         # Este arquivo
```

## 🧪 Testes

### Teste Local
```bash
# Iniciar servidor
npm start

# Acessar aplicação
curl http://localhost:3000/api/health
```

### Teste de APIs
```bash
# Verificar senha
curl -X POST http://localhost:3000/api/verify-password \
  -H "Content-Type: application/json" \
  -d '{"password":"mundopodium"}'

# Health check
curl http://localhost:3000/api/health
```

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.

## 🆘 Suporte

- **Problemas técnicos:** Abra uma issue no repositório
- **Dúvidas sobre metodologia:** Consulte a comunidade WhatsApp
- **Suporte comercial:** Entre em contato com a equipe Pódium

---

**Desenvolvido para a Primeira Fase do Método Pódium: Definição de Nicho e ICP** 🚀
