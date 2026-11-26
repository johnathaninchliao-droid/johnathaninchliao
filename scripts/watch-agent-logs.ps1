[CmdletBinding()]
param(
    [string]$Root = '',
    [switch]$Once,
    [int]$IntervalSeconds = 5
)

$ErrorActionPreference = 'Stop'

if (-not $Root) {
    if ($PSScriptRoot) { $Root = Split-Path -Parent $PSScriptRoot }
    elseif ($MyInvocation.MyCommand.Path) { $Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path) }
    else { $Root = (Get-Location).Path }
}

$logDir = Join-Path $Root 'docs\代理溝通'
$sourceNames = @('00_現況與需求.md', 'copilot.md', 'antigravity.md', 'opencode.md')
$sourceFiles = $sourceNames | ForEach-Object { Join-Path $logDir $_ }
$digestPath = Join-Path $logDir '最新動態.md'
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Read-Text([string]$path) {
    if (Test-Path -LiteralPath $path) {
        return [System.IO.File]::ReadAllText($path)
    }
    return ''
}

function Get-SectionLines([string]$text, [string]$heading) {
    $lines = $text -split "`r?`n"
    $start = -1
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match '^##\s' -and $lines[$i].Contains($heading)) {
            $start = $i + 1
            break
        }
    }
    if ($start -lt 0) { return @() }

    $result = @()
    for ($i = $start; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match '^##\s') { break }
        if ($lines[$i].Trim()) { $result += $lines[$i].TrimEnd() }
    }
    return $result
}

function Get-NewestEntry([string]$text, [string]$label) {
    $lines = $text -split "`r?`n"
    $recordStart = -1
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match '^##\s' -and $lines[$i].Contains('紀錄')) {
            $recordStart = $i + 1
            break
        }
    }

    $start = -1
    $searchFrom = 0
    if ($recordStart -ge 0) { $searchFrom = $recordStart }
    for ($i = $searchFrom; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match '^###\s' -and -not $lines[$i].Contains('YYYY-MM-DD｜簡短標題')) {
            $start = $i
            break
        }
    }
    if ($start -lt 0) { return @("### $label", '', '- （尚無紀錄）', '') }

    $title = $lines[$start] -replace '^###\s*', ''
    $result = @("### $label｜$title", '')
    for ($i = $start + 1; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        if ($i -gt $start -and ($line -match '^###\s' -or $line -match '^##\s')) { break }
        if ($line.Trim() -and -not $line.Contains('尚無紀錄')) { $result += $line.TrimEnd() }
        if ($result.Count -ge 7) { break }
    }
    $result += ''
    return $result
}

function Update-Digest {
    if (-not (Test-Path -LiteralPath $logDir)) {
        return
    }

    $shared = Read-Text (Join-Path $logDir '00_現況與需求.md')
    $copilot = Read-Text (Join-Path $logDir 'copilot.md')
    $antigravity = Read-Text (Join-Path $logDir 'antigravity.md')
    $opencode = Read-Text (Join-Path $logDir 'opencode.md')

    $out = @()
    $out += '# 代理溝通｜最新動態'
    $out += ''
    $out += '自動產生：' + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
    $out += '來源：`docs/代理溝通/00_現況與需求.md`、`copilot.md`、`antigravity.md`、`opencode.md`'
    $out += ''

    $out += '## 使用者需求（最新）'
    $needs = @(Get-SectionLines $shared '使用者目前的需求')
    if ($needs.Count -gt 0) { $out += $needs } else { $out += '- （尚無紀錄）' }
    $out += ''

    $out += '## 異常與支援需求'
    $issues = @(Get-SectionLines $shared '異常與支援需求')
    if ($issues.Count -gt 0) { $out += $issues } else { $out += '- （尚無紀錄）' }
    $out += ''

    $out += '## 各代理最新紀錄'
    $out += @(Get-NewestEntry $copilot 'Copilot')
    $out += @(Get-NewestEntry $antigravity 'Antigravity')
    $out += @(Get-NewestEntry $opencode 'OpenCode')

    $out += '## 目前流程階段'
    $stages = @(Get-SectionLines $shared '目前流程階段')
    if ($stages.Count -gt 0) { $out += $stages } else { $out += '- （尚無紀錄）' }
    $out += ''

    [System.IO.File]::WriteAllText($digestPath, ($out -join "`n"), $utf8NoBom)
    Write-Host "已更新：$digestPath"
}

Update-Digest

if (-not $Once) {
    Write-Host "監聽中：$logDir（每 $IntervalSeconds 秒檢查一次，Ctrl+C 結束）"
    $last = ''
    while ($true) {
        $current = ($sourceFiles | ForEach-Object { Read-Text $_ }) -join [char]0
        if ($current -ne $last) {
            Update-Digest
            $last = $current
        }
        Start-Sleep -Seconds $IntervalSeconds
    }
}
