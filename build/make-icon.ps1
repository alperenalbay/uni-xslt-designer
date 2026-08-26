# Uygulama ikonu üretici: turkuaz zemin + beyaz elmas (UNI Tasarım markası)
Add-Type -AssemblyName System.Drawing

$size = 256
$bmp = New-Object System.Drawing.Bitmap($size, $size)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear([System.Drawing.Color]::Transparent)

function RoundRect([System.Drawing.Graphics]$gr, [float]$x, [float]$y, [float]$w, [float]$h, [float]$r, [System.Drawing.Brush]$b) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddArc($x, $y, 2*$r, 2*$r, 180, 90)
  $path.AddArc($x+$w-2*$r, $y, 2*$r, 2*$r, 270, 90)
  $path.AddArc($x+$w-2*$r, $y+$h-2*$r, 2*$r, 2*$r, 0, 90)
  $path.AddArc($x, $y+$h-2*$r, 2*$r, 2*$r, 90, 90)
  $path.CloseFigure()
  $gr.FillPath($b, $path)
}

$bg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255,13,148,136))
RoundRect $g 8 8 240 240 52 $bg

$white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$state = $g.Save()
$g.TranslateTransform(128, 128)
$g.RotateTransform(45)
$g.FillRectangle($white, -58, -58, 116, 116)
$g.Restore($state)

$out = Join-Path $PSScriptRoot "icon.png"
$bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
Write-Host "OK: $out"
