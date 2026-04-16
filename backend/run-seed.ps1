$pythonPath = "C:\Users\USER\AppData\Local\Programs\Python\Python310\python.exe"
$backendDir = "C:\Users\USER\Desktop\newproject\backend"

Write-Host "Starting seed data script..." -ForegroundColor Cyan

$process = Start-Process $pythonPath -ArgumentList "seed_data.py" -WorkingDirectory $backendDir -NoNewWindow -Wait -PassThru

if ($process.ExitCode -eq 0) {
    Write-Host "Seed data completed successfully!" -ForegroundColor Green
} else {
    Write-Host "Seed failed with exit code: $($process.ExitCode)" -ForegroundColor Red
}