param(
    [switch]$SkipDeploy,
    [switch]$Simulate
)

$Root       = $PSScriptRoot
$Blockchain = Join-Path $Root "blockchain"
$OracleDir  = Join-Path $Root "oracle"
$EnvFile    = Join-Path $OracleDir ".env"
$HardhatBin = Join-Path $Blockchain "node_modules\.bin\hardhat"

function Write-Step($msg) {
    Write-Host ""
    Write-Host ">> $msg" -ForegroundColor Cyan
}

function Write-OK($msg) {
    Write-Host "[OK] $msg" -ForegroundColor Green
}

function Write-Fail($msg) {
    Write-Host "[ERROR] $msg" -ForegroundColor Red
    exit 1
}

# Check .env
Write-Step "Checking oracle/.env..."
if (-not (Test-Path $EnvFile)) {
    Write-Fail "oracle/.env not found. Fill in your credentials first."
}
Write-OK "oracle/.env found."

# Check local hardhat binary
Write-Step "Checking local Hardhat installation in blockchain/..."
if (-not (Test-Path $HardhatBin)) {
    Write-Host "   Running npm install in blockchain/..." -ForegroundColor Yellow
    Push-Location $Blockchain
    npm install
    Pop-Location
}
Write-OK "Hardhat binary found."

# Start Hardhat node in a new window using the LOCAL binary
Write-Step "Starting local Hardhat node..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Blockchain'; .\node_modules\.bin\hardhat node"

Write-Host "   Waiting for node to be ready..." -ForegroundColor Yellow
$rpcUrl = "http://127.0.0.1:8545"
$ready  = $false
for ($i = 0; $i -lt 20; $i++) {
    Start-Sleep -Seconds 2
    try {
        $body     = '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
        $response = Invoke-RestMethod -Uri $rpcUrl -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
        if ($response.result) { $ready = $true; break }
    } catch {}
    Write-Host "   ..." -NoNewline
}

if (-not $ready) {
    Write-Fail "Hardhat node did not start within 40 seconds."
}
Write-OK "Hardhat node ready at $rpcUrl"

# Deploy contract
if (-not $SkipDeploy) {
    Write-Step "Deploying IoTCircuitBreaker..."

    $deployOutput = & powershell -Command "cd '$Blockchain'; .\node_modules\.bin\hardhat run scripts/deploy.js --network localhost" 2>&1
    Write-Host $deployOutput

    $addressLine = $deployOutput | Where-Object { $_ -match "Contract deployed to:" }
    if (-not $addressLine) {
        Write-Fail "Could not find contract address in deploy output."
    }

    $contractAddress = ($addressLine -replace ".*Contract deployed to:\s*", "").Trim()
    Write-OK "Contract deployed at: $contractAddress"

    Write-Step "Updating CONTRACT_ADDRESS in oracle/.env..."
    $envContent = Get-Content $EnvFile
    $envContent = $envContent -replace '(?m)^CONTRACT_ADDRESS=.*$', "CONTRACT_ADDRESS=`"$contractAddress`""
    Set-Content $EnvFile $envContent -Encoding UTF8
    Write-OK "oracle/.env updated."

} else {
    Write-Host "   (Skipping deploy - reusing address from .env)" -ForegroundColor Yellow
}

# Start ESP32 simulator if -Simulate flag is set
if ($Simulate) {
    Write-Step "Starting ESP32 simulator (test-mqtt.js)..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Root'; node test-mqtt.js"
    Write-OK "Simulator running in separate window (publishes every 3s)."
}

# Start oracle
Write-Step "Starting oracle (MQTT -> Blockchain)..."
Write-Host ""
Write-Host "  Hardhat is running in a separate window." -ForegroundColor DarkGray
if ($Simulate) {
    Write-Host "  ESP32 simulator is running in a separate window." -ForegroundColor DarkGray
}
Write-Host "  Press Ctrl+C here to stop the oracle." -ForegroundColor DarkGray
Write-Host ""

Set-Location $Root
node oracle/index.js