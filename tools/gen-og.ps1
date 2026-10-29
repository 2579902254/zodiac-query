# ============================================================
# gen-og.ps1 — 生成 14 张 1200×630 分享图（og/*.png）
# 用法（Windows PowerShell 5.1+，依赖 System.Drawing）：
#   powershell -ExecutionPolicy Bypass -File tools\gen-og.ps1
# 说明：首页 / 配对页 / 12 星座页 各一张；如需浏览器渲染版本，
#       可截图 og/card.html（?sign=aries | ?page=match）。
# ============================================================

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $root 'og'
if (-not (Test-Path -LiteralPath $outDir)) {
  New-Item -ItemType Directory -Path $outDir | Out-Null
}

function Convert-HslToColor {
  param([double]$H, [double]$S, [double]$L, [int]$Alpha = 255)

  $c = (1 - [Math]::Abs(2 * $L - 1)) * $S
  $x = $c * (1 - [Math]::Abs((($H / 60) % 2) - 1))
  $m = $L - $c / 2

  $r = 0; $g = 0; $b = 0
  if ($H -lt 60) { $r = $c; $g = $x }
  elseif ($H -lt 120) { $r = $x; $g = $c }
  elseif ($H -lt 180) { $g = $c; $b = $x }
  elseif ($H -lt 240) { $g = $x; $b = $c }
  elseif ($H -lt 300) { $r = $x; $b = $c }
  else { $r = $c; $b = $x }

  return [System.Drawing.Color]::FromArgb(
    $Alpha,
    [int][Math]::Round(($r + $m) * 255),
    [int][Math]::Round(($g + $m) * 255),
    [int][Math]::Round(($b + $m) * 255)
  )
}

function New-OgCard {
  param(
    [string]$Path,
    [string]$Symbol,
    [string]$Title,
    [string]$Label,
    [string]$Desc,
    [string]$Url,
    [int]$Hue,
    [string]$Tag
  )

  $w = 1200
  $h = 630
  $bmp = New-Object System.Drawing.Bitmap($w, $h)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
  $g.Clear([System.Drawing.Color]::FromArgb(255, 4, 7, 15))

  # 光晕
  $glow = New-Object System.Drawing.Drawing2D.GraphicsPath
  $glow.AddEllipse(-320, -470, 980, 980)
  $brush = New-Object System.Drawing.Drawing2D.PathGradientBrush($glow)
  $brush.CenterColor = Convert-HslToColor -H $Hue -S 0.9 -L 0.6 -Alpha 78
  $brush.SurroundColors = @([System.Drawing.Color]::Transparent)
  $g.FillPath($brush, $glow)

  $glow2 = New-Object System.Drawing.Drawing2D.GraphicsPath
  $glow2.AddEllipse(660, 300, 900, 900)
  $brush2 = New-Object System.Drawing.Drawing2D.PathGradientBrush($glow2)
  $brush2.CenterColor = Convert-HslToColor -H (($Hue + 40) % 360) -S 0.9 -L 0.58 -Alpha 44
  $brush2.SurroundColors = @([System.Drawing.Color]::Transparent)
  $g.FillPath($brush2, $glow2)

  # 网格
  $gridPen = New-Object System.Drawing.Pen((Convert-HslToColor -H $Hue -S 0.7 -L 0.6 -Alpha 16), 1)
  for ($x = 0; $x -le $w; $x += 60) { $g.DrawLine($gridPen, $x, 0, $x, $h) }
  for ($y = 0; $y -le $h; $y += 60) { $g.DrawLine($gridPen, 0, $y, $w, $y) }

  # 边框与角标
  $framePen = New-Object System.Drawing.Pen((Convert-HslToColor -H $Hue -S 0.8 -L 0.6 -Alpha 82), 1)
  $g.DrawRectangle($framePen, 26, 26, $w - 53, $h - 53)

  $cornerPen = New-Object System.Drawing.Pen((Convert-HslToColor -H $Hue -S 0.9 -L 0.66 -Alpha 220), 2)
  $g.DrawLine($cornerPen, 26, 26, 60, 26)
  $g.DrawLine($cornerPen, 26, 26, 26, 60)
  $g.DrawLine($cornerPen, $w - 27, $h - 27, $w - 61, $h - 27)
  $g.DrawLine($cornerPen, $w - 27, $h - 27, $w - 27, $h - 61)

  $mono = New-Object System.Drawing.Font('Consolas', 15)
  $monoSm = New-Object System.Drawing.Font('Consolas', 14)
  $cjk = New-Object System.Drawing.Font('Microsoft YaHei', 62, [System.Drawing.FontStyle]::Bold)
  $cjkSm = New-Object System.Drawing.Font('Microsoft YaHei', 20)
  $symbolFont = New-Object System.Drawing.Font('Segoe UI Symbol', 140)

  $accent = Convert-HslToColor -H $Hue -S 0.92 -L 0.68
  $accentDim = Convert-HslToColor -H $Hue -S 0.9 -L 0.74 -Alpha 235
  $muted = [System.Drawing.Color]::FromArgb(255, 168, 196, 214)
  $ink = [System.Drawing.Color]::FromArgb(255, 232, 244, 255)

  $bAccent = New-Object System.Drawing.SolidBrush($accent)
  $bAccentDim = New-Object System.Drawing.SolidBrush($accentDim)
  $bMuted = New-Object System.Drawing.SolidBrush($muted)
  $bInk = New-Object System.Drawing.SolidBrush($ink)
  $bSoft = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(225, 214, 234, 248))

  # 顶部品牌行
  $g.DrawString('* CELESTIAL QUERY', $mono, $bAccentDim, 74, 66)
  $tagSize = $g.MeasureString($Tag, $monoSm)
  $g.DrawString($Tag, $monoSm, $bMuted, ($w - 74 - $tagSize.Width), 68)

  # 符号
  $g.DrawString($Symbol, $symbolFont, $bAccent, 74, 150)

  # 文字块
  $textX = 330
  $g.DrawString($Label, $mono, $bMuted, $textX, 214)
  $g.DrawString($Title, $cjk, $bInk, ($textX - 6), 246)
  $g.DrawString($Desc, $cjkSm, $bSoft, $textX, 356)

  # 底部分隔线 + 信息
  $linePen = New-Object System.Drawing.Pen((Convert-HslToColor -H $Hue -S 0.8 -L 0.6 -Alpha 72), 1)
  $g.DrawLine($linePen, 74, 528, $w - 74, 528)
  $g.DrawString($Url, $monoSm, $bMuted, 74, 548)
  $stat = '12 SIGNS  /  144 COMBOS  /  100% LOCAL'
  $statSize = $g.MeasureString($stat, $monoSm)
  $g.DrawString($stat, $monoSm, $bAccentDim, ($w - 74 - $statSize.Width), 548)

  $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)

  $g.Dispose()
  $bmp.Dispose()
  $mono.Dispose()
  $monoSm.Dispose()
  $cjk.Dispose()
  $cjkSm.Dispose()
  $symbolFont.Dispose()
  $gridPen.Dispose()
  $framePen.Dispose()
  $cornerPen.Dispose()
  $linePen.Dispose()
  $brush.Dispose()
  $brush2.Dispose()
  $glow.Dispose()
  $glow2.Dispose()
  $bAccent.Dispose()
  $bAccentDim.Dispose()
  $bMuted.Dispose()
  $bInk.Dispose()
  $bSoft.Dispose()
}

$signs = @(
  @{ id = 'aries';       name = '白羊座'; en = 'Aries';       symbol = '♈'; range = '03.21 - 04.19'; element = '火象'; modality = '基本宫'; ruler = '火星';   hue = 10 },
  @{ id = 'taurus';      name = '金牛座'; en = 'Taurus';      symbol = '♉'; range = '04.20 - 05.20'; element = '土象'; modality = '固定宫'; ruler = '金星';   hue = 42 },
  @{ id = 'gemini';      name = '双子座'; en = 'Gemini';      symbol = '♊'; range = '05.21 - 06.21'; element = '风象'; modality = '变动宫'; ruler = '水星';   hue = 190 },
  @{ id = 'cancer';      name = '巨蟹座'; en = 'Cancer';      symbol = '♋'; range = '06.22 - 07.22'; element = '水象'; modality = '基本宫'; ruler = '月亮';   hue = 208 },
  @{ id = 'leo';         name = '狮子座'; en = 'Leo';         symbol = '♌'; range = '07.23 - 08.22'; element = '火象'; modality = '固定宫'; ruler = '太阳';   hue = 30 },
  @{ id = 'virgo';       name = '处女座'; en = 'Virgo';       symbol = '♍'; range = '08.23 - 09.22'; element = '土象'; modality = '变动宫'; ruler = '水星';   hue = 158 },
  @{ id = 'libra';       name = '天秤座'; en = 'Libra';       symbol = '♎'; range = '09.23 - 10.23'; element = '风象'; modality = '基本宫'; ruler = '金星';   hue = 300 },
  @{ id = 'scorpio';     name = '天蝎座'; en = 'Scorpio';     symbol = '♏'; range = '10.24 - 11.22'; element = '水象'; modality = '固定宫'; ruler = '冥王星'; hue = 348 },
  @{ id = 'sagittarius'; name = '射手座'; en = 'Sagittarius'; symbol = '♐'; range = '11.23 - 12.21'; element = '火象'; modality = '变动宫'; ruler = '木星';   hue = 20 },
  @{ id = 'capricorn';   name = '摩羯座'; en = 'Capricorn';   symbol = '♑'; range = '12.22 - 01.19'; element = '土象'; modality = '基本宫'; ruler = '土星';   hue = 168 },
  @{ id = 'aquarius';    name = '水瓶座'; en = 'Aquarius';    symbol = '♒'; range = '01.20 - 02.18'; element = '风象'; modality = '固定宫'; ruler = '天王星'; hue = 196 },
  @{ id = 'pisces';      name = '双鱼座'; en = 'Pisces';      symbol = '♓'; range = '02.19 - 03.20'; element = '水象'; modality = '变动宫'; ruler = '海王星'; hue = 272 }
)

$cards = @(
  @{
    file   = 'home.png'
    symbol = '✦'
    title  = '星轨星座查询终端'
    label  = 'CELESTIAL QUERY / STAR-LINK'
    desc   = '十二宫档案 · 12×12 配对矩阵 · 每日星象'
    url    = '2579902254.github.io/zodiac-query/'
    hue    = 190
    tag    = 'STAR-LINK TERMINAL  v1.1'
  },
  @{
    file   = 'match.png'
    symbol = '⚖'
    title  = '星座配对矩阵'
    label  = 'PAIRING MATRIX / 12 x 12'
    desc   = '元素 × 三形态 · 144 组组合相性读数'
    url    = '2579902254.github.io/zodiac-query/match/'
    hue    = 196
    tag    = 'COMPATIBILITY GRID  v1.1'
  }
)

foreach ($s in $signs) {
  $cards += @{
    file   = ('{0}.png' -f $s.id)
    symbol = $s.symbol
    title  = $s.name
    label  = ('{0} / {1}' -f $s.en.ToUpper(), $s.range)
    desc   = ('{0} · {1} · 守护星 {2}' -f $s.element, $s.modality, $s.ruler)
    url    = ('2579902254.github.io/zodiac-query/{0}/' -f $s.id)
    hue    = $s.hue
    tag    = 'ZODIAC ARCHIVE  v1.1'
  }
}

foreach ($card in $cards) {
  $path = Join-Path $outDir $card.file
  New-OgCard -Path $path -Symbol $card.symbol -Title $card.title -Label $card.label `
    -Desc $card.desc -Url $card.url -Hue $card.hue -Tag $card.tag

  $img = [System.Drawing.Image]::FromFile($path)
  Write-Host ('  ok  og/{0}  {1}x{2}  {3:N0} KB' -f $card.file, $img.Width, $img.Height, ((Get-Item -LiteralPath $path).Length / 1KB))
  $img.Dispose()
}

Write-Host ('完成：已生成 {0} 张分享图。' -f $cards.Count)

