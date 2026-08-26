# DSH 启动脚本
# Usage:
#   .\.guide\dsh-start.ps1              # 启动 (dev)
#   .\.guide\dsh-start.ps1 restart      # 重启
#   .\.guide\dsh-start.ps1 stop         # 停止
#   .\.guide\dsh-start.ps1 -Env prod    # prod 环境启动

param(
    [ValidateSet("start", "restart", "stop")]
    [string]$Action = "start",
    [ValidateSet("dev", "test", "prod")]
    [string]$Env
)

$ErrorActionPreference = "Stop"

# --- 加载 YAML 模块 ---
if (-not (Get-Module -ListAvailable -Name powershell-yaml)) {
    Install-Module -Name powershell-yaml -Force -Scope CurrentUser -AllowClobber
}
Import-Module powershell-yaml

# --- 读取并合并配置 ---
$projectConfig = Join-Path (Split-Path $PSScriptRoot -Parent) ".dsh\startup.yaml"
$userConfig    = Join-Path $env:USERPROFILE ".dsh\startup.yaml"

$config = @{}
if (Test-Path $projectConfig) {
    $config = ConvertFrom-Yaml (Get-Content $projectConfig -Raw -Encoding UTF8) -Ordered
}
if (Test-Path $userConfig) {
    $userCfg = ConvertFrom-Yaml (Get-Content $userConfig -Raw -Encoding UTF8) -Ordered
    foreach ($key in $userCfg.Keys) { $config[$key] = $userCfg[$key] }
}

# 环境覆盖
$activeEnv = $Env
if (-not $activeEnv -and $config.env) { $activeEnv = $config.env }
if (-not $activeEnv) { $activeEnv = "dev" }

if ($config.environments -and $config.environments[$activeEnv]) {
    foreach ($key in $config.environments[$activeEnv].Keys) {
        $config[$key] = $config.environments[$activeEnv][$key]
    }
}

# --- 注入环境变量 ---
$DSH_ROOT = $config.dsh.root
$PORT     = [int]$config.dsh.port
# 支持单 patch 或 patches 数组
$PATCHES = @()
if ($config.dsh.patches) { $PATCHES = @($config.dsh.patches) }
elseif ($config.dsh.patch) { $PATCHES = @($config.dsh.patch) }

$env:REDIS_URL             = $config.redis.url
$env:REDIS_PASSWORD        = $config.redis.password
$env:REDIS_DB              = [string]$config.redis.db
$env:REDIS_CONNECT_TIMEOUT = [string]$config.redis.connect_timeout
$env:REDIS_COMMAND_TIMEOUT = [string]$config.redis.command_timeout

if ($config.api.deepseek_key) { $env:DEEPSEEK_API_KEY = $config.api.deepseek_key }

# --- DSH 生命周期 ---
function Stop-DSH {
    $conns = Get-NetTCPConnection -LocalPort $PORT -State Listen -ErrorAction SilentlyContinue
    if ($conns) {
        $conns | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
        Start-Sleep -Seconds 2
        Write-Host ("[STOP] port " + $PORT + " terminated") -ForegroundColor Yellow
    } else {
        Write-Host ("[STOP] port " + $PORT + " not running") -ForegroundColor Gray
    }
}

function Test-DSH {
    try {
        $r = Invoke-WebRequest -Uri ("http://127.0.0.1:" + $PORT + "/") -TimeoutSec 5 -UseBasicParsing
        return $r.StatusCode -eq 200
    } catch { return $false }
}

function Start-DSH {
    foreach ($p in $PATCHES) {
        if (-not (Test-Path $p)) {
            Write-Host ("[ERROR] Patch not found: " + $p) -ForegroundColor Red; exit 1
        }
    }
    Write-Host ("[START] DSH (" + $activeEnv + ") ...") -ForegroundColor Green

    $patchArgs = @()
    foreach ($p in $PATCHES) { $patchArgs += "--patch"; $patchArgs += $p }

    Push-Location $DSH_ROOT
    try {
        $allArgs = @("dsh", "web") + $patchArgs + @("--no-open")
        Start-Process -FilePath "pnpm" -ArgumentList $allArgs `
            -WorkingDirectory $DSH_ROOT -WindowStyle Minimized

        for ($i = 0; $i -lt 15; $i++) {
            Start-Sleep -Seconds 2
            if (Test-DSH) {
                Write-Host ("  http://127.0.0.1:" + $PORT) -ForegroundColor Cyan; return
            }
        }
        Write-Host "[WARN] Still starting, refresh browser later" -ForegroundColor Yellow
    } finally { Pop-Location }
}

# --- 主逻辑 ---
switch ($Action) {
    "stop"    { Stop-DSH }
    "restart" { Stop-DSH; Start-DSH }
    "start"   { if (Test-DSH) { Write-Host ("[INFO] Running at http://127.0.0.1:" + $PORT) -ForegroundColor Cyan } else { Start-DSH } }
}
