# TRINITI Unified Development Launch Script for Windows
# Starts both backend and frontend servers simultaneously

param(
    [switch]$BackendOnly,
    [switch]$FrontendOnly,
    [switch]$Verbose
)

# Configuration
$BackendPort = 3000
$FrontendPort = 3001
$BackendUrl = "http://localhost:$BackendPort"
$FrontendUrl = "http://localhost:$FrontendPort"

# Colors for output
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"
$Cyan = "Cyan"

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    }
    catch {
        return $false
    }
}

function Wait-ForPort {
    param(
        [int]$Port,
        [string]$ServiceName,
        [int]$Timeout = 30
    )
    Write-ColorOutput "⏳ Waiting for $ServiceName to start on port $Port..." $Yellow

    $startTime = Get-Date
    while ((Get-Date) -lt ($startTime.AddSeconds($Timeout))) {
        if (Test-Port $Port) {
            Write-ColorOutput "✅ $ServiceName is ready on port $Port" $Green
            return $true
        }
        Start-Sleep -Seconds 1
    }

    Write-ColorOutput "❌ $ServiceName failed to start within $Timeout seconds" $Red
    return $false
}

function Start-Backend {
    Write-ColorOutput "🚀 Starting TRINITI Backend Server..." $Cyan

    # Check if Python is available
    try {
        $pythonVersion = python --version 2>&1
        Write-ColorOutput "🐍 Using Python: $pythonVersion" $Green
    }
    catch {
        Write-ColorOutput "❌ Python not found. Please install Python 3.8+ and try again." $Red
        exit 1
    }

    # Check if backend directory exists
    if (-not (Test-Path "backend")) {
        Write-ColorOutput "📁 Creating backend directory..." $Yellow
        New-Item -ItemType Directory -Name "backend" -Force | Out-Null
    }

    # Check if virtual environment exists
    if (-not (Test-Path "backend\.venv")) {
        Write-ColorOutput "🔧 Creating Python virtual environment..." $Yellow
        Set-Location backend
        python -m venv .venv
        Set-Location ..
    }

    # Start backend server
    $backendScript = @"
        Set-Location backend
        .venv\Scripts\Activate.ps1
        Write-Host "🚀 Starting TRINITI Backend Server on port $BackendPort..." -ForegroundColor Green
        cd ..
        python backend_server.py
"@

    Start-Process powershell -ArgumentList "-Command", $backendScript -NoNewWindow
}

function Start-Frontend {
    Write-ColorOutput "🎨 Starting TRINITI Frontend Server..." $Cyan

    # Check if Node.js is available
    try {
        $nodeVersion = node --version
        Write-ColorOutput "📦 Using Node.js: $nodeVersion" $Green
    }
    catch {
        Write-ColorOutput "❌ Node.js not found. Please install Node.js 16+ and try again." $Red
        exit 1
    }

    # Check if frontend directory exists
    if (-not (Test-Path "frontend")) {
        Write-ColorOutput "❌ Frontend directory not found. Please ensure you're in the correct project directory." $Red
        exit 1
    }

    # Check if node_modules exists
    if (-not (Test-Path "frontend\node_modules")) {
        Write-ColorOutput "📦 Installing frontend dependencies..." $Yellow
        Set-Location frontend
        npm install
        Set-Location ..
    }

    # Start frontend server
    $frontendScript = @"
        Set-Location frontend
        Write-Host "🎨 Starting TRINITI Frontend Server on port $FrontendPort..." -ForegroundColor Green
        npm run dev
"@

    Start-Process powershell -ArgumentList "-Command", $frontendScript -NoNewWindow
}

function Show-Status {
    Write-ColorOutput "`n📊 TRINITI Development Environment Status:" $Cyan
    Write-ColorOutput "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" $Cyan

    $backendStatus = if (Test-Port $BackendPort) { "✅ Running" } else { "❌ Stopped" }
    $frontendStatus = if (Test-Port $FrontendPort) { "✅ Running" } else { "❌ Stopped" }

    Write-ColorOutput "Backend Server  ($BackendUrl): $backendStatus" $Green
    Write-ColorOutput "Frontend Server ($FrontendUrl): $frontendStatus" $Green

    Write-ColorOutput "`n🔗 Quick Links:" $Cyan
    Write-ColorOutput "• Frontend: $FrontendUrl" $Yellow
    Write-ColorOutput "• Backend API: $BackendUrl" $Yellow
    Write-ColorOutput "• API Documentation: $BackendUrl/docs" $Yellow
    Write-ColorOutput "• Health Check: $BackendUrl/health" $Yellow

    Write-ColorOutput "`n💡 Tips:" $Cyan
    Write-ColorOutput "• Press Ctrl+C in any terminal to stop that service" $Yellow
    Write-ColorOutput "• Use -Verbose flag for detailed output" $Yellow
    Write-ColorOutput "• Use -BackendOnly or -FrontendOnly to start specific services" $Yellow
}

# Main execution
Write-ColorOutput "🚀 TRINITI Development Environment Launcher" $Cyan
Write-ColorOutput "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" $Cyan

# Check current directory
$currentDir = Get-Location
Write-ColorOutput "📍 Working Directory: $currentDir" $Yellow

# Start services based on parameters
if ($BackendOnly) {
    Write-ColorOutput "🎯 Starting Backend Only..." $Yellow
    Start-Backend
    Wait-ForPort $BackendPort "Backend Server"
}
elseif ($FrontendOnly) {
    Write-ColorOutput "🎯 Starting Frontend Only..." $Yellow
    Start-Frontend
    Wait-ForPort $FrontendPort "Frontend Server"
}
else {
    Write-ColorOutput "🎯 Starting Full Development Environment..." $Yellow

    # Start both services
    Start-Backend
    Start-Frontend

    # Wait for services to start
    $backendReady = Wait-ForPort $BackendPort "Backend Server"
    $frontendReady = Wait-ForPort $FrontendPort "Frontend Server"

    if ($backendReady -and $frontendReady) {
        Write-ColorOutput "`n🎉 TRINITI Development Environment is ready!" $Green
    }
    else {
        Write-ColorOutput "`n⚠️  Some services failed to start. Check the output above." $Red
    }
}

# Show final status
Show-Status

Write-ColorOutput "`n🔄 Services are running. Press Ctrl+C in any terminal to stop." $Yellow
