<#
Resize App Store screenshots to an EXACT pixel size (cover-crop, no distortion).

Apple's iPhone screenshot slots need precise dimensions:
  6.5" display : 1242 x 2688  or  1284 x 2778
  6.9" display : 1290 x 2796  or  1320 x 2868

Phone screenshots (e.g. iPhone 13 mini 1080x2340, or 17 Pro Max 1320x2868)
often don't match the slot you're uploading into. This scales each PNG to
fill the target exactly and crops the tiny overflow (no black bars, no stretch).

USAGE (PowerShell):
  powershell -ExecutionPolicy Bypass -File scripts\resize-store-screenshots.ps1 -In "C:\path\to\pngs"
  # default target is 1284 x 2778; override with -Width / -Height:
  powershell -ExecutionPolicy Bypass -File scripts\resize-store-screenshots.ps1 -In "C:\path\to\pngs" -Width 1320 -Height 2868

Output goes to a subfolder "<In>\resized_<W>x<H>".
#>
param(
  [Parameter(Mandatory = $true)][string]$In,
  [string]$Out = "",
  [int]$Width = 1284,
  [int]$Height = 2778
)

Add-Type -AssemblyName System.Drawing

if (-not (Test-Path $In)) { throw "Input folder not found: $In" }
if (-not $Out) { $Out = Join-Path $In ("resized_{0}x{1}" -f $Width, $Height) }
New-Item -ItemType Directory -Force -Path $Out | Out-Null

$files = Get-ChildItem -Path $In -Filter *.png -File
if (-not $files) { Write-Host "No .png files found in $In"; return }

foreach ($f in $files) {
  $src = [System.Drawing.Image]::FromFile($f.FullName)
  try {
    # 24-bit RGB canvas = NO alpha channel (App Store rejects any transparency,
    # even fully-opaque). Default Bitmap is 32bpp ARGB, so force 24bpp here.
    $canvas = New-Object System.Drawing.Bitmap($Width, $Height, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
    $g = [System.Drawing.Graphics]::FromImage($canvas)
    $g.Clear([System.Drawing.Color]::Black)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

    # cover-fit: scale so the image fills the target, crop the overflow
    $scale = [Math]::Max($Width / $src.Width, $Height / $src.Height)
    $dw = [int][Math]::Ceiling($src.Width * $scale)
    $dh = [int][Math]::Ceiling($src.Height * $scale)
    $dx = [int](($Width - $dw) / 2)
    $dy = [int](($Height - $dh) / 2)

    $g.DrawImage($src, $dx, $dy, $dw, $dh)
    $g.Dispose()

    $outPath = Join-Path $Out $f.Name
    $canvas.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $canvas.Dispose()
    Write-Host ("OK  {0}  ({1}x{2} -> {3}x{4})" -f $f.Name, $src.Width, $src.Height, $Width, $Height)
  }
  finally { $src.Dispose() }
}

Write-Host ""
Write-Host "Done. Resized files in: $Out"
