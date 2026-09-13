<div align="center">

# Next-Xboard

**A Next-Generation, Apple iOS 26 Fluid Glass Aesthetic Frontend Client for Xboard & V2Board**

[![Next.js](https://img.shields.io/badge/Next.js-16.3.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Supported-2496ed?style=flat-square&logo=docker)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

[English](README.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja-JP.md) | [한국어](README.ko-KR.md)

</div>

---

## 📖 Overview

**Next-Xboard** is an ultra-modern, high-performance web client crafted specifically for **Xboard** and **V2Board** backend subscription platforms. 

Built from the ground up using **Next.js 16 (Turbopack)**, **React 19**, and **Tailwind CSS v4**, Next-Xboard pioneers the futuristic **Apple iOS 26 Fluid Glass (Liquid Glass)** design system. It brings spatial depth, frosted translucency, tactile spring physics, dynamic safe-area adaptation for iPhone Dynamic Island / PWA standalone mode, and native multi-language internationalization (English, Chinese, Japanese, Korean) into one unified experience.

---

## ✨ Feature Highlights & Advantages

### 🔮 1. iOS 26 Fluid Glass Design System
- **Next-Gen Spatial Materials**: Translucent frosted panels (`backdrop-filter: blur(28px) saturate(210%)`), prismatic specular rim gradients, subtle ambient depth shadows, and refined dark/light mode parity.
- **Physics-Based Spring Transitions**: Interactive controls feature Apple's signature deceleration curves (`cubic-bezier(0.16, 1, 0.3, 1)`) with GPU-accelerated compositing (`will-change: transform`).
- **Liquid Glass Segmented Docks**: Horizontal pill runners with gliding water-droplet active indicators for seamless switching across tabs and cycle selectors.
- **PWA & Dynamic Island Auto-Adaptation**: Automatically respects `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`. The top floating capsule navigation gracefully moves down to clear the iPhone 14 Pro/15/16 Dynamic Island in standalone full-screen mode without overlapping.
- **Standardized 356px iOS Toast Banners**: Fixed 356px notification capsules with automatic multi-line wrapping and overflow protection.

### 📊 2. Comprehensive Unified Dashboard
- **Live Traffic Monitor Ring**: Radial progress visualizer displaying uploaded, downloaded, and remaining traffic with exact percentage and gigabyte precision.
- **Subscription Lifecycle Card**: Instant countdown to subscription renewal, plan tier name, and validity status.
- **One-Click Subscription Import Drawer**:
  - One-click deep link launch for **Shadowrocket**, **Clash**, **Surge**, **Quantumult X**, **Loon**, **Sing-box**, and **V2Ray**.
  - One-click subscription URL copy.
  - Built-in High-Resolution QR code generator for rapid mobile device scanning.
- **Node Server Grid & Live Latency Test**:
  - Displays all edge node servers with speed multipliers, connection tags, and protocols.
  - Interactive ping/latency diagnostics.
- **Announcement Center with Infinite Scroll**:
  - Integrated notification list with progressive lazy load/infinite scroll, allowing users to browse through multiple pages of announcements effortlessly without freezing or pagination lag.

### 🛍️ 3. Shop & Order Management System
- **Cycle Switcher**: Seamless switching between Monthly, Quarterly, and Yearly billing periods with fluid sliding animation.
- **Smart Promo Code Deduction**: Real-time coupon validity verification with immediate discount calculation.
- **Interactive Checkout Modal**: Seamless checkout supporting **Alipay** and **Account Balance** payments with live balance check.
- **Order History & Management Drawer**:
  - View full order details (Trade Number, Plan Name, Period, Original Price, Discount, Final Amount, Status).
  - One-click cancellation for pending orders.
  - Instant redirection to payment gateway for pending orders.
  - 4-column Liquid Glass status filter (**All**, **Pending**, **Completed**, **Cancelled**) with smooth content transition animations.

### 📚 4. Knowledge Base & Reader Mode
- **Category Filter & Full-Text Search**: Filter tutorials by category or instantly search through titles and article content.
- **Dedicated Article Reader View**:
  - Clean typographic layout with estimated reading time.
  - Markdown syntax highlighting with one-click code copy buttons.
  - Native iOS-style mobile reading mode with back-to-list navigation and tactile feedback.

### 👤 5. User Profile & Affiliate Program
- **Account & Security Controls**:
  - View account email and balance.
  - Password change modal with validation.
  - One-click subscription token & security reset with confirmation modal.
  - Telegram bot binding integration helper.
  - Notification toggles for expiration reminders and traffic quota warnings.
- **Affiliate Commission & Invite Codes**:
  - Real-time commission stats: commission rate, pending commission, available balance, and total earned.
  - Commission transfer to account balance for immediate purchases.
  - Commission withdrawal application via ticket system.
  - Built-in invite code generator with 1-click clipboard copy.

### 🎫 6. Support Ticket System
- Submit support tickets with priority levels.
- View ticket conversation history with real-time status updates (Open / Closed).

### 🌐 7. Native Internationalization (i18n)
- Out-of-the-box multilingual support:
  - 🇺🇸 **English** (`en-US`)
  - 🇨🇳 **简体中文** (`zh-CN`)
  - 🇯🇵 **日本語** (`ja-JP`)
  - 🇰🇷 **한국어** (`ko-KR`)
- Smart browser locale detection with cookie-based persistence and zero-refresh language switching.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16.3 (App Router & Turbopack)](https://nextjs.org/) |
| **UI Library** | [React 19.2](https://react.dev/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + CSS Variables |
| **State Management** | [Zustand v5](https://github.com/pmndrs/zustand) |
| **Icons & Fonts** | [Lucide React](https://lucide.dev/), [SF Pro Typography](https://developer.apple.com/fonts/) |
| **Notifications** | [Sonner](https://sonner.emilkowal.ski/) (Apple Customized) |
| **Modals** | [@ebay/nice-modal-react](https://github.com/eBay/nice-modal-react) |
| **QR Code** | [qrcode](https://github.com/soldair/node-qrcode) |
| **Deployment** | Docker (Alpine Multi-stage, ~120MB image) |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `20.10.0` or higher
- **pnpm**: `10.x` or higher (recommended)
- An active **Xboard** or **V2Board** backend server

---

### Option 1: Docker Deployment (Recommended)

#### Quick Run with Docker CLI
```bash
docker run -d \
  --name next-xboard \
  --restart unless-stopped \
  -p 3000:3000 \
  -e XBOARD_API_URL="https://your-xboard-domain.com" \
  ghcr.io/aquamarine-z/next-xboard:latest
```

#### Run with Docker Compose
1. Create a `docker-compose.yml` file:
```yaml
services:
  next-xboard:
    image: ghcr.io/aquamarine-z/next-xboard:latest
    container_name: next-xboard
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      # Replace with your real Xboard backend API URL
      - XBOARD_API_URL=https://your-xboard-domain.com
      # Optional: secondary backup URL for high-availability failover
      - XBOARD_BACKUP_API_URL=
      - PORT=3000
      - NODE_ENV=production
```

2. Start the container:
```bash
docker compose up -d
```

Visit `http://localhost:3000` in your browser.

---

### Option 2: Manual Local Development

1. **Clone the repository**:
```bash
git clone https://github.com/aquamarine-z/next-xboard.git
cd next-xboard
```

2. **Install dependencies**:
```bash
pnpm install
```

3. **Configure Environment Variables**:
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Edit `.env.local`:
```env
# Your Xboard Backend URL (without trailing slash)
XBOARD_API_URL=https://your-xboard-domain.com

# Optional backup URL
XBOARD_BACKUP_API_URL=

PORT=3000
NODE_ENV=development
```

4. **Run the Development Server**:
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application with instant Turbopack Fast Refresh.

5. **Build for Production**:
```bash
pnpm build
pnpm start
```

---

## ⚙️ Environment Variables

| Variable | Description | Default | Required |
| :--- | :--- | :--- | :---: |
| `XBOARD_API_URL` | The base URL of your Xboard / V2Board API endpoint | `https://cloud.example.com` | **Yes** |
| `XBOARD_BACKUP_API_URL` | Secondary backup backend URL for failover | `""` | No |
| `PORT` | The port on which the Next.js server listens | `3000` | No |
| `NODE_ENV` | Application environment mode (`development` or `production`) | `production` | No |

---

## 📱 Progressive Web App (PWA)

Next-Xboard is fully configured as a standalone Progressive Web App:
- Open the web client in Safari on iOS or Chrome on Android.
- Tap **Share** -> **Add to Home Screen**.
- Enjoy a full-screen, native application experience with dedicated app icon, splash behavior, and dynamic safe-area inset protection.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check the [Issues page](https://github.com/aquamarine-z/next-xboard/issues).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
