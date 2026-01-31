#requires -Version 5.1
<#
Expose FamilyMind dev server (WSL2) to your LAN so you can open it from your phone.

- Forwards Windows :5000 -> WSL2 :5000 using netsh portproxy
- Opens Windows Firewall TCP 5000 inbound
- Prints the URL to open on your phone

Run:
  powershell -ExecutionPolicy Bypass -File .\scripts\expose-mobile.ps1
#>

param(
  [int]$Port = 5000,
  [string]$WslDistro = "",
  [switch]$Remove
)

function Ensure-Admin {
  $isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
  if (-not $isAdmin) {
    Write-Host "Re-launching as Administrator..." -ForegroundColor Yellow
    $argsList = @('-ExecutionPolicy','Bypass','-File',"`"$PSCommandPath`"")
    if ($Port) { $argsList += @('-Port', $Port) }
    if ($WslDistro) { $argsList += @('-WslDistro', $WslDistro) }
    if ($Remove) { $argsList += @('-Remove') }
    Start-Process powershell -Verb RunAs -ArgumentList $argsList
    exit 0
  }
}

function Get-WslIp {
  $cmd = if ($WslDistro) { "wsl -d $WslDistro hostname -I" } else { "wsl hostname -I" }
  $out = cmd /c $cmd 2>$null
  if (-not $out) { throw "Failed to get WSL IP. Is WSL installed and the distro running?" }
  # Take first token
  return ($out -split "\s+")[0].Trim()
}

function Get-WindowsLanIp {
  $ips = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
    Where-Object {
      $_.IPAddress -and
      $_.IPAddress -notlike '127.*' -and
      $_.IPAddress -notlike '169.254*' -and
      $_.IPAddress -notlike '172.16.*' -and
      $_.IPAddress -notlike '172.17.*' -and
      $_.IPAddress -notlike '172.18.*' -and
      $_.IPAddress -notlike '172.19.*' -and
      $_.IPAddress -notlike '172.2*'  # avoid WSL/Hyper-V ranges
    } |
    Select-Object -ExpandProperty IPAddress

  if ($ips -and $ips.Count -gt 0) { return $ips[0] }

  # fallback
  $ip2 = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -and $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254*' } | Select-Object -First 1 -ExpandProperty IPAddress)
  return $ip2
}

Ensure-Admin

$ruleName = "FamilyMind $Port"

if ($Remove) {
  Write-Host "Removing portproxy + firewall rule for port $Port..." -ForegroundColor Yellow
  cmd /c "netsh interface portproxy delete v4tov4 listenaddress=0.0.0.0 listenport=$Port" | Out-Null
  try { Remove-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue | Out-Null } catch {}
  Write-Host "Done." -ForegroundColor Green
  exit 0
}

$wslIp = Get-WslIp
Write-Host "WSL IP: $wslIp" -ForegroundColor Cyan

# Replace existing rule if present
cmd /c "netsh interface portproxy delete v4tov4 listenaddress=0.0.0.0 listenport=$Port" | Out-Null
cmd /c "netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=$Port connectaddress=$wslIp connectport=$Port" | Out-Null

# Firewall rule (idempotent)
$existing = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
if (-not $existing) {
  New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -Action Allow -Protocol TCP -LocalPort $Port | Out-Null
}

$winIp = Get-WindowsLanIp
Write-Host "Windows LAN IP: $winIp" -ForegroundColor Cyan
Write-Host "\nOpen on your phone:" -ForegroundColor Green
Write-Host "  http://$winIp`:$Port" -ForegroundColor Green
Write-Host "\nIf it doesn't load: confirm your phone is on the same Wi-Fi, and that the FamilyMind dev server is running." -ForegroundColor DarkGray
