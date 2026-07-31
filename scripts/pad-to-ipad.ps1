<#
Pad screenshots onto an EXACT canvas size (e.g. iPad 2048x2732) without
distortion. The source image is scaled to fit (contain) and centered on a
solid background colour; the leftover margins are filled with that colour.

Output is written as 24-bit PNG (NO alpha channel) — App Store Connect rejects
screenshots that contain an alpha channel / transparency.

USAGE (PowerShell):
  powershell -ExecutionPolicy Bypass -File scripts\pad-to-ipad.ps1 -In "C:\path\to\pngs"
  # defaults: 2048 x 2732 canvas, background #1d140c (app dark brown)
  powershell -ExecutionPolicy Bypass -File scripts\pad-to-ipad.ps1 -In "C:\path" -Width 2048 -Height 2732 -Bg "#1d140c"

Output goes to "<In>\ipad_<W>x<H>".
#>
param(
  [Parameter(Mandatory = $true)][string]$In,
  [string]$Out = "",
  [int]$Width = 2048,
  [int]$Height = 2732,
  [string]$Bg = "#1d140c",
  # scale the image to this fraction of the canvas (1.0 = touch top/bottom).
  [double]$Fit = 0.99
)

Add-Type -AssemblyName System.Drawing

function ConvertFrom-Hex([string]$hex) {
  $hex = $hex.TrimStart('#')
  [System.Drawing.Color]::FromArgb(
    [Convert]::ToInt32($hex.Substring(0, 2), 16),
    [Convert]::ToInt32($hex.Substring(2, 2), 16),
    [Convert]::ToInt32($hex.Substring(4, 2), 16))
}

if (-not (Test-Path $In)) { throw "Input folder not found: $In" }
if (-not $Out) { $Out = Join-Path $In ("ipad_{0}x{1}" -f $Width, $Height) }
New-Item -ItemType Directory -Force -Path $Out | Out-Null

$bgColor = ConvertFrom-Hex $Bg
$files = Get-ChildItem -Path $In -Filter *.png -File
if (-not $files) { Write-Host "No .png files found in $In"; return }

foreach ($f in $files) {
  $src = [System.Drawing.Image]::FromFile($f.FullName)
  try {
    # 24bpp canvas = no alpha channel
    $canvas = New-Object System.Drawing.Bitmap $Width, $Height, ([System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
    $g = [System.Drawing.Graphics]::FromImage($canvas)
    $g.Clear($bgColor)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

    # contain-fit (scale down/up to fit inside the canvas * Fit)
    $scale = [Math]::Min(($Width * $Fit) / $src.Width, ($Height * $Fit) / $src.Height)
    $dw = [int][Math]::Round($src.Width * $scale)
    $dh = [int][Math]::Round($src.Height * $scale)
    $dx = [int](($Width - $dw) / 2)
    $dy = [int](($Height - $dh) / 2)

    $g.DrawImage($src, $dx, $dy, $dw, $dh)
    $g.Dispose()

    $outPath = Join-Path $Out $f.Name
    $canvas.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $canvas.Dispose()
    Write-Host ("OK  {0}  ({1}x{2} -> {3}x{4}, 24-bit)" -f $f.Name, $src.Width, $src.Height, $Width, $Height)
  }
  finally { $src.Dispose() }
}

Write-Host ""
Write-Host "Done. iPad screenshots in: $Out"
