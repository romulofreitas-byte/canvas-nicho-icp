@echo off
echo ========================================
echo Canvas de Nicho e ICP - Metodo Podium
echo Versao Node.js com Express
echo ========================================
echo.

echo Verificando Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao encontrado!
    echo Por favor, instale o Node.js em: https://nodejs.org
    pause
    exit /b 1
)

echo.
echo Instalando dependencias...
npm install

echo.
echo Iniciando servidor...
echo.
echo Aplicacao disponivel em:
echo - Principal: http://localhost:3000
echo - Teste: http://localhost:3000/test
echo - API Health: http://localhost:3000/api/health
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

npm start
