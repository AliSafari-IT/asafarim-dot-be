# Ensure running as Administrator
$principal = New-Object Security.Principal.WindowsPrincipal(
    [Security.Principal.WindowsIdentity]::GetCurrent()
)

if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "Restarting script as Administrator..."
    Start-Process powershell "-ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
    exit
}

$port = 5103

Write-Host "Checking for processes using port $port..."

# Get the PIDs currently occupying the port BEFORE app starts
$Conns = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue

if ($Conns) {
    $Pids = $Conns | Select-Object -ExpandProperty OwningProcess -Unique

    foreach ($p in $Pids) {
        if ($p -gt 0) {
            Write-Host "Killing existing process PID $p (holding port $port)..."
            Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
        }
    }
} else {
    Write-Host "Port $port is already free."
}

Write-Host "Port $port is ready."
