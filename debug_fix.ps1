$filePath = 'c:\Users\sonka\OneDrive\Desktop\Trading\src\app\api\predict\route.ts'
$lines = Get-Content $filePath
$line3 = $lines[2]
Write-Host "Raw Line 3: [$line3]"
$bytes = [System.Text.Encoding]::UTF8.GetBytes($line3)
$hex = ($bytes | ForEach-Object { '{0:X2}' -f $_ }) -join ' '
Write-Host "Hex: $hex"

# Force set line 3 to be exactly a clean import
$lines[2] = "import { cookies } from 'next/headers';"
$lines | Set-Content $filePath -Encoding UTF8
Write-Host "File patched with clean line 3."
