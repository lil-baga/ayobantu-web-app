# Helper: combine all migrations into one file for Supabase Cloud SQL Editor
$files = Get-ChildItem -Path "supabase\migrations\*.sql" | Sort-Object Name
$content = @()

foreach ($file in $files) {
    $content += "-- ===================="
    $content += "-- File: $($file.Name)"
    $content += "-- ===================="
    $content += ""
    $content += Get-Content -Path $file.FullName
    $content += ""
    $content += ""
}

$content | Out-File -Encoding UTF8 "supabase\all_migrations.sql"
Write-Host "Created supabase\all_migrations.sql - ready to paste into Supabase SQL Editor"
