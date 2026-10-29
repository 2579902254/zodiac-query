# CELESTIAL QUERY · 星轨星座查询终端

一个纯静态的星座查询网站：深空 + HUD 风格的科技感界面，输入生日即可解析对应的黄道星座档案。

![tech](https://img.shields.io/badge/stack-HTML%20%2F%20CSS%20%2F%20Vanilla%20JS-4fe3ff) ![deps](https://img.shields.io/badge/dependencies-0-9b7bff)

## 打开方式

无需安装依赖、无需构建、无需网络：

- 直接双击 `index.html`（推荐 Chrome / Edge / Firefox 新版）
- 或在本目录起一个静态服务器：

```powershell
# Python
python -m http.server 8080
# 浏览器访问 http://localhost:8080
```

## 功能

| 功能 | 说明 |
| --- | --- |
| 生日查询 | 选择 1900—2100 年任意日期，解析对应星座；不可选未来范围外的日期 |
| 边界精确 | 每个星座的起止日期逐日判定，含摩羯座跨年边界（12.22 — 次年 01.19） |
| 黄道路盘 | 12 星座环形排列，点击 / 方向键切换，中心实时显示符号与名称 |
| 星图连线 | 每个星座一套星点坐标，SVG 逐段绘制动画（形状示意，非精确星表） |
| 星象参数 | 能量 / 情感 / 直觉 / 理性四项进度条，切换时重新计数动画 |
| 深空背景 | Canvas 星场：视差、闪烁、偶发流星，随窗口尺寸自适应 |
| 深度链接 | URL 加 `#leo`、`#pisces` 等可直接定位并分享某个星座 |
| 响应式 | 桌面双栏 / 平板单栏 / 移动端堆叠，≤560px 精简 HUD |
| 无障碍 | 语义化标签、`aria-pressed`、键盘方向键切换、`prefers-reduced-motion` 降级 |

## 目录结构

```
zodiac-query/
├── index.html          # 页面骨架：HUD / 查询表单 / 轮盘 / 详情 / 免责声明
├── css/
│   └── style.css       # 设计变量、背景层、轮盘、详情、免责声明、动画、响应式
├── js/
│   ├── data.js         # 12 星座数据（日期、元素、守护星、文案、星图坐标）
│   ├── starfield.js    # Canvas 星场（DPR 适配、视差、流星、性能暂停）
│   └── app.js          # 轮盘生成、星图 SVG、生日解析、详情渲染
├── .nojekyll           # 告知 GitHub Pages 跳过 Jekyll 处理
└── README.md           # 使用说明 / 部署 / 免责声明
```

## 设计要点

- **配色**：以 `--hue` 为唯一色相变量，选中不同星座时全局强调色联动（面板角标、轮盘辉光、参数条）。
- **质感**：玻璃拟态面板 + 切角裁切（`clip-path`）+ 网格/扫描线/暗角四层叠加，营造终端 HUD 观感。
- **动效**：星图用 `stroke-dashoffset` 逐段绘制；参数条使用宽度过渡；轮盘外环慢速反向旋转。
- **性能**：星点数量按视口面积计算（上限 300），DPR 上限 2，页面隐藏时暂停 `requestAnimationFrame`。

## 自定义

- 改 12 星座文案 / 日期 / 星图坐标：编辑 `js/data.js`，注意 `start` 与 `end` 必须与 `range` 文案一致。
- 换主色调：修改 `css/style.css` 中 `:root` 的 `--hue`（默认 190），或直接调整 `js/data.js` 里各星座的 `hue` 值。
- 加星座：向 `ZODIAC_SIGNS` 数组追加对象即可（轮盘按数组长度等分圆周，目前按 12 宫写死文案）。

## 部署到 GitHub Pages

本站是纯静态站点：无构建、无依赖、无后端，资源全部为相对路径，可直接托管在 GitHub Pages 上（也兼容 Cloudflare Pages / Netlify / 对象存储静态网站）。

```powershell
cd zodiac-query
git init -b main
git add .
git commit -m "feat: celestial query zodiac site"
git remote add origin https://github.com/<你的用户名>/zodiac-query.git
git push -u origin main
```

然后在仓库 **Settings → Pages → Build and deployment**：

- **Source**：选择 `Deploy from a branch`（零构建的静态站推荐这条）
- **Branch**：选择 `main`，目录选择 `/ (root)`，点 **Save**
- 约 30 秒 ~ 1 分钟上线：`https://<你的用户名>.github.io/zodiac-query/`

> 仓库内不放 CI 工作流：本站无构建步骤，分支部署即可，且不会因 `GITHUB_TOKEN` 无 Pages 创建权限而产生失败记录。
> 若你更想用 Actions 发布，可自行添加 `actions/configure-pages` + `upload-pages-artifact` + `deploy-pages` 工作流，并在 Source 处选 `GitHub Actions`。


部署注意事项：

- 项目部署在子路径（`/zodiac-query/`）下也正常，因为 CSS/JS 均为相对引用。
- 路由使用 `#hash`（如 `.../#pisces`），服务器始终只请求 `index.html`，**无需配置 404 / SPA 重写规则**。
- 仓库已包含 `.nojekyll`，让 GitHub Pages 跳过 Jekyll 处理，避免以下划线开头的文件被忽略。
- 请通过 `https://` 访问：`file://` 下浏览器会限制 `history.replaceState`（代码已 try/catch，但地址栏不会同步星座 hash）。
- 更新站点：改完文件后 `git add . ; git commit -m "update" ; git push`，Pages 会自动重新构建。

## 免责声明

- **娱乐属性**：星座日期划分、性格描述与「星象参数」（能量 / 情感 / 直觉 / 理性）均为内容化创作，**仅供娱乐与自我探索参考**，不构成任何形式的预测、诊断或专业建议。
- **非科学依据**：占星学不属于科学体系，本站内容不具备科学有效性，请勿据此作出健康、财务、婚恋、职业等任何重要决策。
- **日期口径**：星座交界日采用常见西方占星资料的通行划分，不同流派或个别年份可能存在 1 天差异。
- **星图说明**：星图为形状示意图，并非精确天文星表坐标，不可用于天文观测或导航。
- **隐私说明**：全部解析在浏览器本地完成，出生日期不会被上传、收集或存储。
- **责任限制**：本站为个人技术演示项目，内容按「现状」提供，对因使用本站内容所产生的任何直接或间接后果不承担责任。

页面底部（页脚上方）已内置同一份免责声明；继续使用本站即表示同意上述说明。
