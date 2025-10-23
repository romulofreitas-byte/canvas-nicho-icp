# Servidor HTTP simples em PowerShell
# Execute este script para servir os arquivos localmente

param(
    [int]$Port = 8000,
    [string]$Path = "."
)

Write-Host "🚀 Iniciando servidor HTTP na porta $Port" -ForegroundColor Green
Write-Host "📁 Servindo arquivos de: $Path" -ForegroundColor Blue
Write-Host "🌐 Acesse: http://localhost:$Port" -ForegroundColor Yellow
Write-Host "⏹️  Pressione Ctrl+C para parar" -ForegroundColor Red
Write-Host ""

# Criar listener HTTP
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")

try {
    $listener.Start()
    Write-Host "✅ Servidor iniciado com sucesso!" -ForegroundColor Green
    
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $localPath = $request.Url.LocalPath
        if ($localPath -eq "/") {
            $localPath = "/index.html"
        }
        
        $filePath = Join-Path $Path $localPath.TrimStart('/')
        
        if (Test-Path $filePath) {
            $content = Get-Content $filePath -Raw -Encoding UTF8
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($content)
            
            # Determinar tipo de conteúdo
            $extension = [System.IO.Path]::GetExtension($filePath).ToLower()
            switch ($extension) {
                ".html" { $contentType = "text/html; charset=utf-8" }
                ".css" { $contentType = "text/css" }
                ".js" { $contentType = "application/javascript" }
                ".json" { $contentType = "application/json" }
                ".png" { $contentType = "image/png" }
                ".jpg" { $contentType = "image/jpeg" }
                ".gif" { $contentType = "image/gif" }
                default { $contentType = "text/plain" }
            }
            
            $response.ContentType = $contentType
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
            
            Write-Host "📄 $($request.HttpMethod) $localPath - 200 OK" -ForegroundColor Green
        } else {
            $errorContent = "404 - Arquivo não encontrado: $localPath"
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($errorContent)
            
            $response.StatusCode = 404
            $response.ContentType = "text/plain; charset=utf-8"
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
            
            Write-Host "❌ $($request.HttpMethod) $localPath - 404 Not Found" -ForegroundColor Red
        }
        
        $response.Close()
    }
} catch {
    Write-Host "❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    $listener.Stop()
    Write-Host "🛑 Servidor parado" -ForegroundColor Yellow
}
