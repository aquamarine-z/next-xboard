<div align="center">

# Next-Xboard

**Apple iOS 26 リキッドガラス（Fluid Glass）美学を採用した次世代 Xboard / V2Board フロントエンドクライアント**

[![Next.js](https://img.shields.io/badge/Next.js-16.3.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Supported-2496ed?style=flat-square&logo=docker)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

[English](README.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja-JP.md) | [한국어](README.ko-KR.md)

</div>

---

## 📖 プロジェクト概要

**Next-Xboard** は、**Xboard** および **V2Board** バックエンドのために特別に設計された、超モダンで高性能な Web フロントエンドクライアントです。

**Next.js 16 (Turbopack)**、**React 19**、**Tailwind CSS v4** をベースにゼロから構築されており、未来的な **Apple iOS 26 リキッドガラス（Fluid Glass / 流体ガラス）** デザインシステムを業界で初めて本格導入しました。擦りガラスの柔らかな光の屈折、Apple 独自の物理スプリングアニメーション、iPhone のダイナミックアイランド（Dynamic Island）および PWA スタンドアロンモードへの自動セーフエリア対応、そして日・英・中・韓の完全なネイティブ多言語対応をワンストップで実現します。

---

## ✨ 主な特長とメリット

### 🔮 1. iOS 26 流体ガラスデザインシステム
- **次世代の空間マテリアル**：高度な擦りガラス背景（`backdrop-filter: blur(28px) saturate(210%)`）、プリズム反射トップエッジライン、洗練されたライト／ダーク両モード対応、繊細なアンビエントシャドウ。
- **物理演算ベースのスプリングアニメーション**：すべてのインタラクションに Apple の自然な減速カーブ（`cubic-bezier(0.16, 1, 0.3, 1)`）を採用し、GPU ハードウェア合成レイヤー（`will-change: transform`）で高フレームレートを実現。
- **リキッドガラス・セグメントドック**：水滴のように滑らかにスライドするアクティブインジケーターを備えたカプセル型コントローラー。
- **PWA & Dynamic Island 自動最適化**：`env(safe-area-inset-top)` および `env(safe-area-inset-bottom)` を自動検出。iPhone 14 Pro / 15 / 16 などのホーム画面追加（PWA スタンドアロン）時、上部フローティングカプセルナビゲーションが自動的に下方にオフセットし、ダイナミックアイランドや時刻表示との干渉を完全に防ぎます。
- **統一 356px iOS トースト通知システム**：横幅を 356px に統一し、長文テキストや URL も自動で折り返し表示する高品位なバナー仕様。

### 📊 2. 包括的な統合ダッシュボード
- **リアルタイムトラフィックモニターリング**：アップロード・ダウンロード・残り容量を直感的に把握できる美しい円形プログレスチャート。
- **サブスクリプション有効期限カード**：更新までの残り日数、プラン名、現在の有効状態をカウントダウン表示。
- **ワンクリック登録インポートドロワー**：
  - 主要クライアント（**Shadowrocket**、**Clash**、**Surge**、**Quantumult X**、**Loon**、**Sing-box**、**V2Ray**）へのワンクリック直接インポート。
  - サブスクリプション URL のワンタップコピー。
  - スマートフォン等でのスキャンに便利な高解像度 QR コード生成機能。
- **ノードサーバー一覧＆リアルタイム遅延測定**：
  - 各エッジサーバーの接続プロトコル、速度倍率、オンライン状態を可視化。
  - インタラクティブな Ping 測定機能。
- **お知らせセンター（無限スクロール・遅延読み込み対応）**：
  - 下スクロールで過去の重要なお知らせをシームレスに逐次読み込み。ページ遷移のストレスなく快適に閲覧可能。

### 🛍️ 3. プランショップ＆注文管理
- **サイクル切り替え**：月払い、3ヶ月払い、年払いを流体スライドアニメーションで直感的に切り替え。
- **クーポン即時検証**：プロモーションコードを入力すると瞬時に割引額と決済金額を自動再計算。
- **インタラクティブ決済ダイアログ**：**Alipay（アリペイ）** および **アカウント残高払い** に対応。
- **注文詳細ドロワー＆ライフサイクル管理**：
  - 注文番号、契約期間、定価、割引額、支払ステータスを一覧表示。
  - 未払い注文のワンタップキャンセルや支払い再開に対応。
  - 4列等幅のリキッドガラスステータスフィルター（すべて、支払い待ち、完了、キャンセル済み）を搭載し、リスト切り替え時にフェードグラデーションアニメーションが連動。

### 📚 4. ナレッジベース＆リーダーモード
- **カテゴリフィルター＆全文検索**：カテゴリバッジによる素早い絞り込みやキーワード検索に対応。
- **専用記事リーダービュー**：
  - 読了目安時間の表示。
  - コードハイライトとワンクリックコードコピー機能を備えた Markdown レンダリング。
  - モバイル端末に最適化された読書体験とスムーズな戻るナビゲーション。

### 👤 5. マイページ＆アフィリエイト報酬管理
- **アカウント＆セキュリティ設定**：
  - 残高、登録メールアドレスの確認。
  - パスワード変更モーダル。
  - 誤操作防止ダイアログ付きのワンクリック購読トークン・セキュリティリセット。
  - Telegram ボット連携案内。
  - 通知設定（期限切れリマインダー、容量枯渇アラート）。
- **紹介・アフィリエイトプログラム**：
  - 報酬レート、未確定報酬、出金可能額、累計獲得額をリアルタイム表示。
  - 報酬をアカウント残高へ即時チャージして新プラン購入に利用可能。
  - チケット連動の出金申請。
  - 招待コードの即時発行およびワンタップリンクコピー。

### 🎫 6. サポートチケット
- 優先度を指定してサポートチケットを作成・送信。
- チケットのやり取り履歴や対応状況（対応中 / 解決済み）をリアルタイムに確認。

### 🌐 7. ネイティブ国際化（i18n）対応
- 4言語に標準対応：
  - 🇺🇸 **英語** (`en-US`)
  - 🇨🇳 **簡体字中国語** (`zh-CN`)
  - 🇯🇵 **日本語** (`ja-JP`)
  - 🇰🇷 **韓国語** (`ko-KR`)
- ブラウザ言語の自動判定、Cookie による言語設定の保存、リロード不要のシームレスな言語切り替えをサポート。

---

## 🛠️ 技術スタック

| レイヤー | 採用技術 |
| :--- | :--- |
| **フレームワーク** | [Next.js 16.3 (App Router / Turbopack)](https://nextjs.org/) |
| **UI ライブラリ** | [React 19.2](https://react.dev/) |
| **言語** | [TypeScript 5](https://www.typescriptlang.org/) |
| **スタイリング** | [Tailwind CSS v4](https://tailwindcss.com/) + CSS 変数 |
| **状態管理** | [Zustand v5](https://github.com/pmndrs/zustand) |
| **アイコン・フォント** | [Lucide React](https://lucide.dev/), [SF Pro Apple フォントファミリ](https://developer.apple.com/fonts/) |
| **通知・モーダル** | [Sonner](https://sonner.emilkowal.ski/) (iOS 特注仕様), [@ebay/nice-modal-react](https://github.com/eBay/nice-modal-react) |
| **コンテナ** | Docker マルチステージビルド（Alpine イメージ、容量わずか約 120MB） |

---

## 🚀 インストール＆デプロイ方法

### 前提条件
- **Node.js**：`20.10.0` 以上
- **pnpm**：`10.x` 以上推奨
- 正常に稼働している **Xboard** または **V2Board** バックエンドサーバー

---

### 方法 1：Docker によるデプロイ（推奨）

#### Docker CLI による起動
```bash
docker run -d \
  --name next-xboard \
  --restart unless-stopped \
  -p 3000:3000 \
  -e XBOARD_API_URL="https://your-xboard-domain.com" \
  ghcr.io/aquamarine-z/next-xboard:latest
```

#### Docker Compose による起動
1. 任意のディレクトリに `docker-compose.yml` を作成します：
```yaml
services:
  next-xboard:
    image: ghcr.io/aquamarine-z/next-xboard:latest
    container_name: next-xboard
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      # ご利用の Xboard バックエンド API アドレス（末尾のスラッシュなし）
      - XBOARD_API_URL=https://your-xboard-domain.com
      # 任意：バックアップ用サーバーアドレス
      - XBOARD_BACKUP_API_URL=
      - PORT=3000
      - NODE_ENV=production
```

2. サービスを起動します：
```bash
docker compose up -d
```

ブラウザで `http://<サーバーのIP>:3000` にアクセスしてください。

---

### 方法 2：ローカル開発およびソースコードビルド

1. **リポジトリをクローン**：
```bash
git clone https://github.com/aquamarine-z/next-xboard.git
cd next-xboard
```

2. **依存関係をインストール**：
```bash
pnpm install
```

3. **環境変数を設定**：
サンプル設定ファイルをコピーします：
```bash
cp .env.example .env.local
```
`.env.local` を編集します：
```env
# Xboard バックエンド URL（末尾スラッシュなし）
XBOARD_API_URL=https://your-xboard-domain.com

# 任意：予備バックエンド URL
XBOARD_BACKUP_API_URL=

PORT=3000
NODE_ENV=development
```

4. **開発サーバーを起動**：
```bash
pnpm dev
```
ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。Turbopack による超高速ホットリロードを体験できます。

5. **本番用ビルド＆起動**：
```bash
pnpm build
pnpm start
```

---

## ⚙️ 環境変数一覧

| 変数名 | 説明 | デフォルト値 | 必須 |
| :--- | :--- | :--- | :---: |
| `XBOARD_API_URL` | Xboard / V2Board バックエンド API のベース URL | `https://cloud.example.com` | **必須** |
| `XBOARD_BACKUP_API_URL` | フェイルオーバー用の予備バックエンド URL | `""` | 任意 |
| `PORT` | Next.js サーバーがリッスンするポート番号 | `3000` | 任意 |
| `NODE_ENV` | アプリケーションの実行環境（`development` / `production`） | `production` | 任意 |

---

## 📱 PWA（プログレッシブウェブアプリ）対応

Next-Xboard は PWA 標準に完全対応しています：
- iPhone の Safari からアクセスし、下部メニューの **共有** -> **ホーム画面に追加** をタップ。
- Android の Chrome からアクセスし、メニューの **アプリをインストール** をタップ。
- ネイティブアプリと同様の全画面表示とリキッドガラスの美しい操作感をお楽しみいただけます。

---

## 🤝 コントリビューション

バグ報告や機能提案の Issue、プルリクエストを心より歓迎いたします。
詳しくは [GitHub Issues](https://github.com/aquamarine-z/next-xboard/issues) をご覧ください。

---

## 📄 ライセンス

このプロジェクトは [MIT License](LICENSE) の下で公開されています。
