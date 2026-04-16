$ErrorActionPreference = 'SilentlyContinue'
$proc = Start-Process powershell -ArgumentList "-Command cd C:\Users\USER\Desktop\newproject\backend; python -m uvicorn app.main:app --port 8001 --host 127.0.0.1" -PassThru -WindowStyle Hidden
Start-Sleep 3
if ($proc.HasExited) {
    Write-Host "Process exited with code: $($proc.ExitCode)"
} else {
    Write-Host "Process running with PID: $($proc.Id)"
    try {
        $response = Invoke-WebRequest -Uri "http://127.0.0.1:8001/health" -TimeoutSec 5 -UseBasicParsing
        Write-Host "Response: $($response.Content)"
    } catch {
        Write-Host "Error: $_"
    }
    Stop-Process $proc.Id -Force -ErrorAction SilentlyContinue
}