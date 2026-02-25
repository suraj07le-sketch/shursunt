# fix_dns.ps1
# This script sets the DNS of the active network interface to Google Public DNS (8.8.8.8, 8.8.4.4)
# Requirement: Run as Administrator (we will instruct the user)

$interfaces = Get-NetAdapter | Where-Object { $_.Status -eq "Up" }

foreach ($interface in $interfaces) {
    Write-Host "Setting Google DNS for interface: $($interface.Name)..."
    Set-DnsClientServerAddress -InterfaceAlias $interface.Name -ServerAddresses ("8.8.8.8","8.8.4.4")
}

Write-Host "DNS Updated! Flushing DNS Cache..."
ipconfig /flushdns

Write-Host "Done! Please restart your browser and try logging in again."
