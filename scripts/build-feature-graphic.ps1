Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Drawing.Drawing2D

$W = 1024
$H = 500
$out = 'C:\Users\ahauschild\shelfed\store\play\feature-graphic-1024x500.png'
if (-not (Test-Path (Split-Path $out))) { New-Item -ItemType Directory -Path (Split-Path $out) -Force | Out-Null }

$bmp = New-Object System.Drawing.Bitmap $W, $H
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

# Warm dark wood gradient background (top left -> bottom right)
$rect = New-Object System.Drawing.Rectangle 0, 0, $W, $H
$c1 = [System.Drawing.ColorTranslator]::FromHtml('#3e2410')
$c2 = [System.Drawing.ColorTranslator]::FromHtml('#1a0e05')
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $c1, $c2, 25.0)
$g.FillRectangle($brush, $rect)
$brush.Dispose()

# Subtle wood-grain streaks (horizontal thin lines)
$rand = New-Object System.Random 42
for ($i = 0; $i -lt 60; $i++) {
    $y = $rand.Next(0, $H)
    $alpha = $rand.Next(6, 18)
    $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb($alpha, 40, 20, 8)), 1
    $g.DrawLine($pen, 0, $y, $W, $y + $rand.Next(-4, 5))
    $pen.Dispose()
}

# Shelf plank across the middle-lower area (like the app's shelves)
$plankTop = 340
$plankH = 32
$plankRect = New-Object System.Drawing.Rectangle 0, $plankTop, $W, $plankH
$plankBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $plankRect,
    [System.Drawing.ColorTranslator]::FromHtml('#7a4a22'),
    [System.Drawing.ColorTranslator]::FromHtml('#5a3618'),
    90.0)
$g.FillRectangle($plankBrush, $plankRect)
$plankBrush.Dispose()

# Plank shadow line
$shadowPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(120, 0, 0, 0)), 2
$g.DrawLine($shadowPen, 0, ($plankTop + $plankH), $W, ($plankTop + $plankH))
$shadowPen.Dispose()

# Book spines standing on the shelf (right side of graphic)
$spineColors = @('#a7563d','#5e7a3c','#3f6079','#d8a548','#8a5a2b','#574a78','#2c4a3a','#b89b73')
$spineBottom = $plankTop
$spineStartX = 640
$x = $spineStartX
for ($i = 0; $i -lt 9; $i++) {
    $spineW = $rand.Next(28, 56)
    $spineH = $rand.Next(150, 240)
    $spineY = $spineBottom - $spineH
    $col = [System.Drawing.ColorTranslator]::FromHtml($spineColors[$i % $spineColors.Length])
    $spineRect = New-Object System.Drawing.Rectangle $x, $spineY, $spineW, $spineH

    # Vertical gradient shine on each spine
    $sb = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $spineRect,
        [System.Drawing.Color]::FromArgb(255, [Math]::Min(255, $col.R + 25), [Math]::Min(255, $col.G + 25), [Math]::Min(255, $col.B + 25)),
        [System.Drawing.Color]::FromArgb(255, [Math]::Max(0, $col.R - 30), [Math]::Max(0, $col.G - 30), [Math]::Max(0, $col.B - 30)),
        0.0)
    $g.FillRectangle($sb, $spineRect)
    $sb.Dispose()

    # Gold band on each book
    $bandY = $spineY + [int]($spineH * 0.72)
    $bandBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#d8a548'))
    $g.FillRectangle($bandBrush, $x + 4, $bandY, $spineW - 8, 3)
    $bandBrush.Dispose()

    # Top edge highlight
    $edgePen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(60, 255, 240, 200)), 1
    $g.DrawLine($edgePen, $x, $spineY, $x + $spineW, $spineY)
    $edgePen.Dispose()

    $x += $spineW + 2
    if ($x -gt $W - 30) { break }
}

# Vignette on the right so text on left pops
$vignetteBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Rectangle 0, 0, $W, $H),
    [System.Drawing.Color]::FromArgb(0, 0, 0, 0),
    [System.Drawing.Color]::FromArgb(90, 0, 0, 0),
    0.0)
$g.FillRectangle($vignetteBrush, (New-Object System.Drawing.Rectangle 0, 0, $W, $H))
$vignetteBrush.Dispose()

# Wordmark "Shelfed" - large serif cream
$creamColor = [System.Drawing.ColorTranslator]::FromHtml('#f3e7d2')
$titleFont = New-Object System.Drawing.Font 'Georgia', 96, ([System.Drawing.FontStyle]::Bold)
$titleBrush = New-Object System.Drawing.SolidBrush $creamColor

# Subtle text shadow for depth
$shadowBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(140, 0, 0, 0))
$g.DrawString('Shelfed', $titleFont, $shadowBrush, 62, 122)
$shadowBrush.Dispose()

$g.DrawString('Shelfed', $titleFont, $titleBrush, 60, 120)
$titleFont.Dispose()
$titleBrush.Dispose()

# Tagline
$tagFont = New-Object System.Drawing.Font 'Segoe UI', 22, ([System.Drawing.FontStyle]::Regular)
$tagColor = [System.Drawing.Color]::FromArgb(220, 240, 210, 140)
$tagBrush = New-Object System.Drawing.SolidBrush $tagColor
$g.DrawString('Your lifelong collection of', $tagFont, $tagBrush, 66, 245)
$g.DrawString('movies, series and books.', $tagFont, $tagBrush, 66, 278)
$tagFont.Dispose()
$tagBrush.Dispose()

# Save
$bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()

"Saved: $out"
"Size: $((Get-Item $out).Length) bytes"
