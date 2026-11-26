[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('copilot', 'antigravity', 'opencode')]
    [string]$Agent,

    [Parameter(Mandatory = $true)]
    [string]$Title,

    [string]$UserRequest = '',
    [string[]]$Conclusion = @(),
    [string[]]$ChangedFiles = @(),
    [string]$FollowUp = '',

    [string]$Root = ''
)

$ErrorActionPreference = 'Stop'

if (-not $Root) {
    if ($PSScriptRoot) { $Root = Split-Path -Parent $PSScriptRoot }
    elseif ($MyInvocation.MyCommand.Path) { $Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path) }
    else { $Root = (Get-Location).Path }
}

$logDir = Join-Path $Root 'docs\代理溝通'
$path = Join-Path $logDir "$Agent.md"

if (-not (Test-Path -LiteralPath $path)) {
    throw "找不到代理紀錄檔：$path"
}

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$text = [System.IO.File]::ReadAllText($path)
$newline = if ($text.Contains("`r`n")) { "`r`n" } else { "`n" }

$stamp = Get-Date -Format 'yyyy-MM-dd HH:mm'
$entry = @()
$entry += "### $stamp｜$Title"
$entry += ''
$entry += '- 使用者需求：' + $(if ($UserRequest) { $UserRequest } else { '無' })
$entry += '- 結論／決定：' + $(if ($Conclusion.Count -gt 0) { $Conclusion -join '；' } else { '無' })
$entry += '- 異動檔案：' + $(if ($ChangedFiles.Count -gt 0) { $ChangedFiles -join '、' } else { '無' })
$entry += '- 待辦／需其他代理支援：' + $(if ($FollowUp) { $FollowUp } else { '無' })
$entry += ''

$marker = '## 紀錄'
$idx = $text.IndexOf($marker)
if ($idx -ge 0) {
    $afterHeading = $idx + $marker.Length
    $lineEnd = $text.IndexOfAny([char[]]@("`r", "`n"), $afterHeading)
    if ($lineEnd -lt 0) {
        $insertPos = $text.Length
    }
    elseif ($text[$lineEnd] -eq "`r" -and ($lineEnd + 1) -lt $text.Length -and $text[$lineEnd + 1] -eq "`n") {
        $insertPos = $lineEnd + 2
    }
    else {
        $insertPos = $lineEnd + 1
    }
    $newText = $text.Substring(0, $insertPos) + ($entry -join $newline) + $newline + $text.Substring($insertPos)
}
else {
    $newText = $text.TrimEnd() + $newline + $newline + ($entry -join $newline) + $newline
}

[System.IO.File]::WriteAllText($path, $newText, $utf8NoBom)
Write-Host "已寫入：$path"

$digestScript = Join-Path $PSScriptRoot 'watch-agent-logs.ps1'
if (Test-Path -LiteralPath $digestScript) {
    & $digestScript -Root $Root -Once
}
