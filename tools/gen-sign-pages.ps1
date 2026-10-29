# ============================================================
# gen-sign-pages.ps1 — 生成 12 个星座独立页 /<id>/index.html
# 用法（任意位置执行）：
#   powershell -ExecutionPolicy Bypass -File tools\gen-sign-pages.ps1
# 说明：星座页是「薄壳」，详情与今日星象由 js/render.js + js/sign-page.js 渲染；
#       本脚本只负责每页独有的 title / meta / OG / 面包屑 / 相邻导航。
# 注意：$signs 表需与 js/data.js 保持一致（改数据后重新执行本脚本）。
# ============================================================

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$site = 'https://2579902254.github.io/zodiac-query'

$signs = @(
  @{ id = 'aries';       name = '白羊座'; en = 'Aries';       symbol = '♈'; range = '03.21 — 04.19'; element = '火象'; modality = '基本宫'; ruler = '火星';   keyword = '开创 · 冲锋 · 纯粹' },
  @{ id = 'taurus';      name = '金牛座'; en = 'Taurus';      symbol = '♉'; range = '04.20 — 05.20'; element = '土象'; modality = '固定宫'; ruler = '金星';   keyword = '稳固 · 感官 · 拥有' },
  @{ id = 'gemini';      name = '双子座'; en = 'Gemini';      symbol = '♊'; range = '05.21 — 06.21'; element = '风象'; modality = '变动宫'; ruler = '水星';   keyword = '好奇 · 连接 · 变奏' },
  @{ id = 'cancer';      name = '巨蟹座'; en = 'Cancer';      symbol = '♋'; range = '06.22 — 07.22'; element = '水象'; modality = '基本宫'; ruler = '月亮';   keyword = '守护 · 记忆 · 归处' },
  @{ id = 'leo';         name = '狮子座'; en = 'Leo';         symbol = '♌'; range = '07.23 — 08.22'; element = '火象'; modality = '固定宫'; ruler = '太阳';   keyword = '荣耀 · 创造 · 慷慨' },
  @{ id = 'virgo';       name = '处女座'; en = 'Virgo';       symbol = '♍'; range = '08.23 — 09.22'; element = '土象'; modality = '变动宫'; ruler = '水星';   keyword = '精修 · 服务 · 秩序' },
  @{ id = 'libra';       name = '天秤座'; en = 'Libra';       symbol = '♎'; range = '09.23 — 10.23'; element = '风象'; modality = '基本宫'; ruler = '金星';   keyword = '平衡 · 关系 · 优雅' },
  @{ id = 'scorpio';     name = '天蝎座'; en = 'Scorpio';     symbol = '♏'; range = '10.24 — 11.22'; element = '水象'; modality = '固定宫'; ruler = '冥王星'; keyword = '深度 · 蜕变 · 掌控' },
  @{ id = 'sagittarius'; name = '射手座'; en = 'Sagittarius'; symbol = '♐'; range = '11.23 — 12.21'; element = '火象'; modality = '变动宫'; ruler = '木星';   keyword = '远行 · 信念 · 自由' },
  @{ id = 'capricorn';   name = '摩羯座'; en = 'Capricorn';   symbol = '♑'; range = '12.22 — 01.19'; element = '土象'; modality = '基本宫'; ruler = '土星';   keyword = '攀登 · 责任 · 长线' },
  @{ id = 'aquarius';    name = '水瓶座'; en = 'Aquarius';    symbol = '♒'; range = '01.20 — 02.18'; element = '风象'; modality = '固定宫'; ruler = '天王星'; keyword = '革新 · 群体 · 未来' },
  @{ id = 'pisces';      name = '双鱼座'; en = 'Pisces';      symbol = '♓'; range = '02.19 — 03.20'; element = '水象'; modality = '变动宫'; ruler = '海王星'; keyword = '共感 · 想象 · 消融' }
)

# ---------- 页面模板（{{TOKEN}} 由文末循环替换） ----------
$tplHead = @'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{{NAME}} {{EN_UP}} · 星座档案 | CELESTIAL QUERY</title>
  <meta name="description" content="{{NAME}}（{{RANGE}}）{{ELEMENT}} · {{MODALITY}}，守护星 {{RULER}}。性格关键词：{{KEYWORD}}。查看 {{NAME}} 的性格参数、星图连线、幸运色与今日星象。" />
  <meta name="theme-color" content="#04070f" />
  <link rel="canonical" href="{{SITE}}/{{ID}}/" />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="CELESTIAL QUERY" />
  <meta property="og:locale" content="zh_CN" />
  <meta property="og:title" content="{{NAME}} {{EN}} · 星座档案" />
  <meta property="og:description" content="{{NAME}}（{{RANGE}}）{{ELEMENT}} · {{MODALITY}}，守护星 {{RULER}}。关键词 {{KEYWORD}}。" />
  <meta property="og:url" content="{{SITE}}/{{ID}}/" />
  <meta property="og:image" content="{{SITE}}/og/{{ID}}.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{{NAME}} {{EN}} · 星座档案" />
  <meta name="twitter:description" content="{{NAME}}（{{RANGE}}）{{ELEMENT}} · {{MODALITY}}，关键词 {{KEYWORD}}。" />
  <meta name="twitter:image" content="{{SITE}}/og/{{ID}}.png" />
  <link
    rel="icon"
    href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23050a13'/%3E%3Cpath d='M16 4l2.6 8.4L27 15l-8.4 2.6L16 26l-2.6-8.4L5 15l8.4-2.6z' fill='%234fe3ff'/%3E%3C/svg%3E"
  />
  <link rel="stylesheet" href="../css/style.css" />
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "{{NAME}} {{EN}} · 星座档案",
      "description": "{{NAME}}（{{RANGE}}）{{ELEMENT}} · {{MODALITY}}，守护星 {{RULER}}，关键词 {{KEYWORD}}。",
      "image": "{{SITE}}/og/{{ID}}.png",
      "inLanguage": "zh-CN",
      "url": "{{SITE}}/{{ID}}/",
      "isPartOf": { "@type": "WebSite", "name": "CELESTIAL QUERY", "url": "{{SITE}}/" }
    }
  </script>
</head>
'@


$tplBody = @'
<body data-sign="{{ID}}">
  <canvas id="starfield" aria-hidden="true"></canvas>
  <div class="bg-nebula" aria-hidden="true"></div>
  <div class="bg-grid" aria-hidden="true"></div>
  <div class="bg-scan" aria-hidden="true"></div>
  <div class="bg-vignette" aria-hidden="true"></div>

  <header class="hud">
    <div class="hud__brand">
      <span class="hud__mark" aria-hidden="true">✦</span>
      <a class="hud__title" href="../">CELESTIAL QUERY</a>
      <span class="hud__tag">v1.1</span>
    </div>
    <nav class="hud__nav" aria-label="站点导航">
      <a href="../">首页 / HOME</a>
      <a href="../match/">配对矩阵</a>
      <a href="../#signindex">十二宫</a>
    </nav>
    <div class="hud__meta">
      <span class="hud__led" aria-hidden="true"></span>
      <span>STAR-LINK ONLINE</span>
      <span class="hud__sep" aria-hidden="true">/</span>
      <span id="sys-clock">00:00:00</span>
    </div>
  </header>

  <main class="shell">
    <nav class="crumbs" aria-label="面包屑">
      <a href="../">首页</a><span aria-hidden="true">/</span>
      <a href="../#signindex">黄道十二宫</a><span aria-hidden="true">/</span>
      <b>{{NAME}}</b>
    </nav>

    <section class="signhero">
      <p class="eyebrow"><span class="eyebrow__line" aria-hidden="true"></span>{{ELEMENT}} · {{MODALITY}} · {{RANGE}}</p>
      <h1><span aria-hidden="true">{{SYMBOL}}</span>{{NAME}}<em>{{EN}}</em></h1>
      <p>{{NAME}}（{{RANGE}}）核心关键词：{{KEYWORD}}。守护星 {{RULER}}，属{{ELEMENT}}{{MODALITY}}。本页包含性格参数、星图连线与今日星象；想比较两个星座的相性，可打开<a class="link" data-pair-link href="../match/">星座配对矩阵</a>。</p>
    </section>

    <article class="panel detail" id="detail" aria-live="polite"></article>

    <section class="panel transmission" id="transmission" aria-live="polite"></section>

    <nav class="signnav" aria-label="相邻星座">
      <a href="../{{PREV_ID}}/"><span>◀ PREV · 上一宫</span><b><i aria-hidden="true">{{PREV_SYMBOL}}</i>{{PREV_NAME}}</b></a>
      <a class="is-center" data-pair-link href="../match/"><span>PAIRING</span><b>星座配对矩阵 →</b></a>
      <a href="../{{NEXT_ID}}/"><span>NEXT · 下一宫 ▶</span><b><i aria-hidden="true">{{NEXT_SYMBOL}}</i>{{NEXT_NAME}}</b></a>
    </nav>

    <section class="disclaimer" aria-labelledby="disclaimer-title">
      <div class="disclaimer__head">
        <span class="disclaimer__icon" aria-hidden="true">⚠</span>
        <h2 class="disclaimer__title" id="disclaimer-title">免责声明 / DISCLAIMER</h2>
      </div>
      <ul class="disclaimer__list">
        <li><b>娱乐属性</b>星座日期划分、性格描述与「星象参数」（能量 / 情感 / 直觉 / 理性）均为内容化创作，仅供娱乐与自我探索参考，不构成任何形式的预测、诊断或专业建议。</li>
        <li><b>非科学依据</b>占星学不属于科学体系，本站内容不具备科学有效性，请勿据此作出健康、财务、婚恋、职业等任何重要决策。</li>
        <li><b>日期口径</b>星座交界日采用常见西方占星资料的通行划分，不同流派或个别年份可能存在 1 天差异。</li>
        <li><b>星图说明</b>星图为形状示意图，并非精确天文星表坐标，不可用于天文观测或导航。</li>
        <li><b>隐私说明</b>全部解析在浏览器本地完成，出生日期不会被上传、收集或存储。</li>
        <li><b>责任限制</b>本站为个人技术演示项目，内容按「现状」提供，对因使用本站内容所产生的任何直接或间接后果不承担责任。</li>
      </ul>
      <p class="disclaimer__foot">继续使用本站即表示你已阅读并同意上述说明。</p>
    </section>
  </main>

  <footer class="foot">
    <span>CELESTIAL QUERY</span>
    <span class="foot__sep" aria-hidden="true">//</span>
    <span>资料基于传统占星体系整理 · 仅供娱乐参考 · 不构成任何专业建议</span>
    <nav class="foot__nav" aria-label="页脚导航">
      <a href="../">首页</a>
      <a href="../match/">配对矩阵</a>
      <a href="../sitemap.xml">站点地图</a>
    </nav>
  </footer>

  <script src="../js/data.js"></script>
  <script src="../js/starfield.js"></script>
  <script src="../js/render.js"></script>
  <script src="../js/sign-page.js"></script>
</body>
</html>
'@

# ---------- 生成 ----------
$tpl = $tplHead + "`n" + $tplBody
$count = $signs.Count
$utf8 = New-Object System.Text.UTF8Encoding($false)

for ($i = 0; $i -lt $count; $i++) {
  $s = $signs[$i]
  $prev = $signs[($i - 1 + $count) % $count]
  $next = $signs[($i + 1) % $count]

  $map = @{
    '{{SITE}}'        = $site
    '{{ID}}'          = $s.id
    '{{NAME}}'        = $s.name
    '{{EN}}'          = $s.en
    '{{EN_UP}}'       = $s.en.ToUpper()
    '{{SYMBOL}}'      = $s.symbol
    '{{RANGE}}'       = $s.range
    '{{ELEMENT}}'     = $s.element
    '{{MODALITY}}'    = $s.modality
    '{{RULER}}'       = $s.ruler
    '{{KEYWORD}}'     = $s.keyword
    '{{PREV_ID}}'     = $prev.id
    '{{PREV_NAME}}'   = $prev.name
    '{{PREV_SYMBOL}}' = $prev.symbol
    '{{NEXT_ID}}'     = $next.id
    '{{NEXT_NAME}}'   = $next.name
    '{{NEXT_SYMBOL}}' = $next.symbol
  }

  $html = $tpl
  foreach ($key in $map.Keys) {
    $html = $html.Replace($key, [string]$map[$key])
  }

  if ($html -match '\{\{[A-Z_]+\}\}') {
    throw ("模板存在未替换的占位符：{0}（星座 {1}）" -f $Matches[0], $s.id)
  }

  $dir = Join-Path $root $s.id
  if (-not (Test-Path -LiteralPath $dir)) {
    New-Item -ItemType Directory -Path $dir | Out-Null
  }

  $file = Join-Path $dir 'index.html'
  [System.IO.File]::WriteAllText($file, $html, $utf8)
  Write-Host ("  ok  {0,-13} -> ./{1}/index.html" -f $s.id, $s.id)
}

Write-Host ("完成：已生成 {0} 个星座独立页。" -f $count)

