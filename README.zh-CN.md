<div align="center">

# Next-Xboard

**基于 Apple iOS 26 流体玻璃（Liquid Glass）美学的次世代 Xboard / V2Board 前端客户端**

[![Next.js](https://img.shields.io/badge/Next.js-16.3.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Supported-2496ed?style=flat-square&logo=docker)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

[English](README.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja-JP.md) | [한국어](README.ko-KR.md)

</div>

---

## 📖 项目简介

**Next-Xboard** 是一套专为 **Xboard** 与 **V2Board** 后端打造的高性能、高颜值现代化 Web 客户端。

项目基于 **Next.js 16 (Turbopack)**、**React 19** 与 **Tailwind CSS v4** 构建，在行业中率先引入前沿的 **Apple iOS 26 流体玻璃（Liquid Glass）** 空间计算拟物设计语言。它不仅带来了温润的磨砂毛玻璃透光材质、苹果物理弹簧动效、完整的 iPhone 灵动岛 / PWA 全屏安全区自适应，还提供原生级四语国际化支持（中、英、日、韩），为代理订阅面板带来了前所未有的视听与交互体验。

---

## ✨ 核心亮点与功能优势

### 🔮 1. iOS 26 流体玻璃美学设计系统 (Fluid Glass Design)
- **次世代空间材质**：采用物理级高饱和度毛玻璃混色（`backdrop-filter: blur(28px) saturate(210%)`）、棱镜折射顶缘反光线（Prismatic Top Sheen Line）、深浅双模自适应高光与柔和环境弥散阴影。
- **物理弹簧微动效**：核心交互全面注入苹果物理阻尼减速曲线（`cubic-bezier(0.16, 1, 0.3, 1)`），并启用 GPU 硬件合成层加速（`will-change: transform`），顺滑跟手。
- **液态水滴分段控制器 (Liquid Glass Segmented Dock)**：滑块在胶囊轨道中自由流动平移，用于顶栏导航、商品周期切换与订单状态筛选。
- **PWA 全屏与 iPhone 灵动岛智能适配**：原生兼容 `env(safe-area-inset-top)` 与 `env(safe-area-inset-bottom)`。在 iPhone 14 Pro/15/16 等机型添加到主屏幕（Standalone 模式）时，顶部浮动胶囊导航自动向下避让灵动岛与状态栏时间，绝不遮挡。
- **规范级 356px 弹窗通知系统 (Toast System)**：固定 356px 宽度并在内容过长时自动分行折行，杜绝长短不一与横向爆屏。

### 📊 2. 一体化多维动态控制台 (Unified Dashboard)
- **实时流量监控环**：动态环形可视化图表，精确展示已上传、已下载及总剩余流量百分比与 GB 刻度。
- **订阅生命周期卡片**：直观倒计时距离套餐重置与到期的天数、订阅名称及当前可用状态。
- **一键导入客户端抽屉 (One-Click Subscription Drawer)**：
  - 支持一键快捷唤起唤醒主流客户端：**Shadowrocket (小火箭)**、**Clash**、**Surge**、**Quantumult X**、**Loon**、**Sing-box** 与 **V2Ray**；
  - 一键复制原始订阅链接；
  - 内置高清二维码生成器，便于移动端扫码快速录入。
- **节点服务器列表与实时网络诊断**：
  - 完整呈现所有接入点节点名称、倍率标签与协议类型；
  - 支持即时 Ping 延迟测速诊断。
- **通知公告中心（支持无限加载与懒加载）**：
  - 支持下拉无缝流式加载（Infinite Scroll），无需生硬翻页即可一口气平滑浏览历史公告，彻底告别列表卡顿。

### 🛍️ 3. 套餐商店与闭环订单体系 (Shop & Orders)
- **周期平滑切换**：支持月付、季付、年付三种计费周期，带流体滑块过渡动画。
- **优惠码实时计算**：输入优惠券实时向后端校验有效性，即刻结算优惠减免金额与折后实付价。
- **交互式收银台对话框**：支持**支付宝**与**账户余额支付**，下单时自动判断余额充沛度并智能引导。
- **订单历史与全生命周期管理**：
  - 完整查看订单详情（订单号、套餐、周期、原价、折扣抵扣、实付、下单时间）；
  - 待支付订单一键继续跳转收银台支付；
  - 待支付订单一键取消；
  - 4 列等宽流体玻璃状态筛选器（全部、待支付、已完成、已取消），切换时列表带柔和微模糊淡入过渡。

### 📚 4. 知识库与浸入式阅读器 (Knowledge Base)
- **分类筛选与全文瞬时搜索**：支持按知识分类胶囊快速筛选，输入关键字瞬时过滤标题与正文。
- **专用文章阅读视图**：
  - 优雅的排版，标注文档阅读预计所需耗时；
  - Markdown 渲染，内置代码块高亮与右上角一键复制；
  - 手机端专属沉浸式阅读模式，支持快速返回列表。

### 👤 5. 个人中心与推广返利体系 (Profile & Affiliate)
- **账户安全与基本设置**：
  - 查看账户余额、注册邮箱；
  - 模态框安全修改登录密码；
  - 一键重置订阅 UUID 密钥，带二次防误触确认提示；
  - Telegram 机器人绑定指令引导；
  - 提醒设置开关（到期前邮件/消息提醒、流量剩余不足提醒）。
- **推广返利与邀请管理**：
  - 实时佣金指标看板：返利比例、待入账佣金、可提现余额与历史累计总收益；
  - 一键将佣金划转至账户余额，直接用于新购套餐；
  - 申请佣金提现（自动对接工单系统）；
  - 邀请码管理面板：一键生成新邀请码并支持一键复制分享链接。

### 🎫 6. 工单客服支持体系 (Tickets)
- 在线创建服务工单，按紧急程度分级；
- 实时查阅工单会话沟通记录与处理进度（开启中 / 已关闭）。

### 🌐 7. 原生多语言国际化 (i18n)
- 完整原生支持 4 种主流语言：
  - 🇺🇸 **English**（英语）
  - 🇨🇳 **简体中文**
  - 🇯🇵 **日本語**（日语）
  - 🇰🇷 **한국어**（韩语）
- 依据浏览器首选语言自动智能识别，并通过 Cookie 持久化记忆，切换语言页面零刷新瞬时重绘。

---

## 🛠️ 技术架构栈

| 模块分层 | 采用技术 |
| :--- | :--- |
| **基础框架** | [Next.js 16.3 (App Router / Turbopack)](https://nextjs.org/) |
| **视图层** | [React 19.2](https://react.dev/) |
| **开发语言** | [TypeScript 5](https://www.typescriptlang.org/) |
| **样式引擎** | [Tailwind CSS v4](https://tailwindcss.com/) + CSS 原生变量 |
| **状态管理** | [Zustand v5](https://github.com/pmndrs/zustand) |
| **图标与字体** | [Lucide React](https://lucide.dev/), [SF Pro 苹果系统字体族](https://developer.apple.com/fonts/) |
| **弹窗与通知** | [Sonner](https://sonner.emilkowal.ski/) (定制 iOS 规格), [@ebay/nice-modal-react](https://github.com/eBay/nice-modal-react) |
| **容器打包** | Docker 多阶段构建（Alpine 镜像，体积仅约 120MB） |

---

## 🚀 快速上手与部署指南

### 环境前置要求
- **Node.js**：`20.10.0` 或更高版本
- **pnpm**：`10.x` 或更高版本（推荐）
- 一个已正常运行的 **Xboard** 或 **V2Board** 后端服务

---

### 部署方式 1：Docker 容器部署（推荐）

#### 使用 Docker CLI 直接启动
```bash
docker run -d \
  --name next-xboard \
  --restart unless-stopped \
  -p 3000:3000 \
  -e XBOARD_API_URL="https://your-xboard-domain.com" \
  ghcr.io/aquamarine-z/next-xboard:latest
```

#### 使用 Docker Compose 部署
1. 在服务器任意目录创建 `docker-compose.yml` 文件：
```yaml
services:
  next-xboard:
    image: ghcr.io/aquamarine-z/next-xboard:latest
    container_name: next-xboard
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      # 替换为您的 Xboard 后端 API 接口地址（末尾无需斜杠）
      - XBOARD_API_URL=https://your-xboard-domain.com
      # 可选：备用后端地址（主后端异常时自动故障转移）
      - XBOARD_BACKUP_API_URL=
      - PORT=3000
      - NODE_ENV=production
```

2. 启动容器：
```bash
docker compose up -d
```

在浏览器中打开 `http://<服务器IP>:3000` 即可访问。

---

### 部署方式 2：本地源码运行与二次开发

1. **克隆仓库代码**：
```bash
git clone https://github.com/aquamarine-z/next-xboard.git
cd next-xboard
```

2. **安装项目依赖**：
```bash
pnpm install
```

3. **配置本地环境变量**：
复制示例配置文件：
```bash
cp .env.example .env.local
```
编辑 `.env.local` 文件：
```env
# 你的 Xboard 真实后端 API 地址（不要带末尾斜杠）
XBOARD_API_URL=https://your-xboard-domain.com

# 可选的备用后端地址
XBOARD_BACKUP_API_URL=

PORT=3000
NODE_ENV=development
```

4. **启动 Turbopack 开发环境**：
```bash
pnpm dev
```
打开浏览器访问 [http://localhost:3000](http://localhost:3000)，修改代码即可享受毫秒级热更新。

5. **编译生产制品**：
```bash
pnpm build
pnpm start
```

---

## ⚙️ 环境变量配置一览

| 变量名 | 含义说明 | 默认值 | 是否必填 |
| :--- | :--- | :--- | :---: |
| `XBOARD_API_URL` | Xboard / V2Board 后端 API 的基础域名地址 | `https://cloud.example.com` | **必填** |
| `XBOARD_BACKUP_API_URL` | 备用后端 API 地址（用于灾备或故障无缝切换） | `""` | 选填 |
| `PORT` | Next.js 独立服务端监听的端口 | `3000` | 选填 |
| `NODE_ENV` | 运行环境模式（`development` 开发 / `production` 生产） | `production` | 选填 |

---

## 📱 PWA 原生应用模式说明

Next-Xboard 具备完整的 Progressive Web App 标准支持：
- 在 iPhone Safari 中访问，点击底栏 **分享** -> **添加到主屏幕**；
- 在 Android Chrome 中访问，点击菜单 **安装应用**；
- 即可脱离浏览器地址栏，享受宛如 App Store 原生下载的全面屏流体玻璃沉浸感体验。

---

## 🤝 贡献与反馈

非常欢迎提交 Issue 或 Pull Request 帮助完善项目！
如有任何问题或需求建议，请访问项目的 [GitHub Issues](https://github.com/aquamarine-z/next-xboard/issues) 进行交流。

---

## 📄 开源许可证

本项目遵循 [MIT License](LICENSE) 开源许可协议。
