<div align="center">

# Next-Xboard

**Apple iOS 26 리퀴드 글래스(Liquid Glass) 미학을 적용한 차세대 Xboard / V2Board 프론트엔드 클라이언트**

[![Next.js](https://img.shields.io/badge/Next.js-16.3.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Supported-2496ed?style=flat-square&logo=docker)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

[English](README.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja-JP.md) | [한국어](README.ko-KR.md)

</div>

---

## 📖 프로젝트 소개

**Next-Xboard**는 **Xboard** 및 **V2Board** 백엔드 플랫폼을 위해 특별히 설계된 고성능, 초현대적 감성의 모던 웹 프론트엔드 클라이언트입니다.

**Next.js 16 (Turbopack)**, **React 19**, **Tailwind CSS v4**를 기반으로 개발되었으며, 미래지향적인 **Apple iOS 26 리퀴드 글래스(Liquid Glass / 유체 유리)** 디자인 시스템을 전격 도입하였습니다. 은은한 반투명 반투과 글래스 재질, 애플의 정밀한 물리 스프링 모션, iPhone 다이내믹 아일랜드(Dynamic Island) 및 PWA 독립 실행 모드 전용 세이프 에어리어(Safe-Area) 자동 대응, 한국어·영어·중국어·일본어 4개국어 원어민급 다국어 지원을 통해 차원이 다른 구독 관리 경험을 제공합니다.

---

## ✨ 핵심 기능 및 특장점

### 🔮 1. iOS 26 리퀴드 글래스 디자인 시스템 (Fluid Glass System)
- **차세대 공간 컴퓨팅 소재**：고채도 블러 가공 소재(`backdrop-filter: blur(28px) saturate(210%)`), 프리즘 상단 반사선(Prismatic Top Sheen Line), 정교한 라이트/다크 모드 패리티 및 깊이감 있는 앰비언트 섀도우.
- **물리 기반 스프링 인터랙션**：애플 특유의 자연스러운 감속 곡선(`cubic-bezier(0.16, 1, 0.3, 1)`)과 GPU 가속 레이어(`will-change: transform`)를 통해 버벅임 없는 부드러운 반응성을 선사합니다.
- **리퀴드 글래스 세그먼트 도크 (Segmented Dock)**：물방울처럼 매끄럽게 활성 위치로 이동하는 인디케이터 캡슐을 통해 탭 전환, 요금제 주기 선택, 주문 상태 필터링을 조작합니다.
- **PWA & 다이내믹 아일랜드 자동 최적화**：`env(safe-area-inset-top)`와 `env(safe-area-inset-bottom)`를 자동 감지합니다. iPhone 14 Pro / 15 / 16 등에서 홈 화면에 추가(PWA 전체 화면 모드) 시, 상단 플로팅 캡슐 내비게이션이 자동으로 알맞게 내려와 다이내믹 아일랜드 및 상태 표시줄과 겹치지 않습니다.
- **표준 356px 토스트 알림 (Toast Notification)**：356px 고정 너비 규격을 채택하여 내용이 길어질 경우 깔끔하게 자동 줄바꿈되며, 레이아웃 깨짐을 방지합니다.

### 📊 2. 통합 대시보드 (Unified Dashboard)
- **실시간 트래픽 모니터링 링**：업로드, 다운로드, 잔여 트래픽을 한눈에 파악할 수 있는 고해상도 원형 게이지.
- **구독 상태 & 갱신 카운트다운**：요금제 등급명, 다음 갱신일까지 남은 일수, 계정 활성화 상태를 직관적으로 표시.
- **원클릭 클라이언트 구독 연동 서랍 (Subscription Drawer)**：
  - **Shadowrocket**, **Clash**, **Surge**, **Quantumult X**, **Loon**, **Sing-box**, **V2Ray** 등 주요 프록시 앱으로의 원클릭 다이렉트 등록.
  - 구독 URL 원클릭 복사.
  - 모바일 기기 간편 스캔을 위한 고화질 QR 코드 생성기 내장.
- **노드 서버 목록 및 실시간 레이턴시 진단**：
  - 모든 엣지 노드의 배율, 연결 태그, 지원 프로토콜을 한눈에 표시.
  - 실시간 Ping 지연 속도 진단 기능.
- **공지사항 센터 (무한 스크롤 및 지연 로딩 지원)**：
  - 스크롤을 내리면 지난 중요 공지사항을 끊김 없이 부드럽게 이어서 불러오며, 페이지 이동 시의 딜레이를 완전히 제거했습니다.

### 🛍️ 3. 요금제 상점 및 주문 관리 (Shop & Orders)
- **주기 전환 애니메이션**：월간, 분기, 연간 결제 주기를 유체 슬라이더 모션으로 신속하게 전환.
- **실시간 프로모션 쿠폰 검증**：쿠폰 코드 입력 시 백엔드 유효성을 즉시 검증하여 할인 금액 및 최종 결제액 자동 산출.
- **인터랙티브 결제 모달**：**알리페이(Alipay)** 및 **계정 잔액 결제** 지원, 잔액 부족 시 스마트 안내.
- **주문 상세 내역 서랍 & 생애주기 관리**：
  - 주문 번호, 상품명, 기간, 원가, 할인, 최종 결제액, 생성 시각 상세 조회.
  - 결제 대기 중인 주문 원클릭 결제 재개 및 즉시 취소 지원.
  - 4열 균등 리퀴드 글래스 상태 필터(전체, 결제 대기, 완료, 취소됨)를 탑재하고, 전환 시 부드러운 페이드 인 그라디언트 트랜지션 적용.

### 📚 4. 지식 베이스 및 리더 모드 (Knowledge Base)
- **카테고리 필터 & 전문 검색**：카테고리 캡슐 필터 및 키워드 기반 제목/본문 즉시 검색.
- **전용 아티클 리더 뷰**：
  - 예상 읽기 시간 표시.
  - 코드 블록 하이라이트 및 원클릭 복사 버튼이 포함된 마크다운 렌더러.
  - 모바일 기기에 최적화된 리더 모드와 손쉬운 목록 복귀 내비게이션.

### 👤 5. 마이페이지 & 추천 제휴 프로그램 (Profile & Affiliate)
- **계정 및 보안 설정**：
  - 계정 잔액, 가입 이메일 확인.
  - 팝업 대화상자를 통한 안전한 비밀번호 변경.
  - 실수 방지 모달이 포함된 구독 토큰/보안키 원클릭 재설정.
  - Telegram 봇 연동 안내 지원.
  - 알림 스위치 (만료 임박 알림, 트래픽 소진 알림).
- **추천 커미션 및 초대 코드 관리**：
  - 실시간 제휴 지표 대시보드：커미션 비율, 적립 대기 금액, 출금 가능 잔액, 누적 총 수익.
  - 커미션을 계정 잔액으로 즉시 전환하여 신규 플랜 구매에 사용 가능.
  - 고객센터 티켓 연동 커미션 출금 신청.
  - 초대 코드 즉시 생성 및 추천 링크 원클릭 클립보드 복사.

### 🎫 6. 고객센터 1:1 문의 티켓 (Tickets)
- 중요도 레벨을 지정하여 실시간 문의 티켓 등록.
- 대화 스레드 기록 및 진행 상태(진행 중 / 해결 완료) 실시간 확인.

### 🌐 7. 네이티브 다국어 지원 (i18n)
- 4개 주요 언어 기본 탑재：
  - 🇺🇸 **English** (영어)
  - 🇨🇳 **简体中文** (중국어 간체)
  - 🇯🇵 **日本語** (일본어)
  - 🇰🇷 **한국어**
- 브라우저 기본 언어 자동 인식, 쿠키 기반 설정 저장, 페이지 새로고침 없는 즉각적인 언어 전환 지원.

---

## 🛠️ 기술 스택 및 아키텍처

| 계층 | 기술 |
| :--- | :--- |
| **프레임워크** | [Next.js 16.3 (App Router / Turbopack)](https://nextjs.org/) |
| **UI 라이브러리** | [React 19.2](https://react.dev/) |
| **개발 언어** | [TypeScript 5](https://www.typescriptlang.org/) |
| **스타일링** | [Tailwind CSS v4](https://tailwindcss.com/) + CSS Native Variables |
| **상태 관리** | [Zustand v5](https://github.com/pmndrs/zustand) |
| **아이콘 & 폰트** | [Lucide React](https://lucide.dev/), [SF Pro Apple 시스템 서체군](https://developer.apple.com/fonts/) |
| **알림 & 모달** | [Sonner](https://sonner.emilkowal.ski/) (커스텀 iOS 규격), [@ebay/nice-modal-react](https://github.com/eBay/nice-modal-react) |
| **컨테이너** | Docker 멀티 스테이지 빌드 (Alpine 이미지, 약 120MB 초경량) |

---

## 🚀 빠른 시작 및 배포 가이드

### 사전 요구사항
- **Node.js**：`20.10.0` 이상
- **pnpm**：`10.x` 이상 권장
- 정상 운영 중인 **Xboard** 또는 **V2Board** 백엔드 서버

---

### 배포 방법 1：Docker 컨테이너 배포 (권장)

#### Docker CLI 명령어로 즉시 실행
```bash
docker run -d \
  --name next-xboard \
  --restart unless-stopped \
  -p 3000:3000 \
  -e XBOARD_API_URL="https://your-xboard-domain.com" \
  ghcr.io/aquamarine-z/next-xboard:latest
```

#### Docker Compose 사용 배포
1. 서버의 원하는 디렉토리에 `docker-compose.yml` 파일을 작성합니다：
```yaml
services:
  next-xboard:
    image: ghcr.io/aquamarine-z/next-xboard:latest
    container_name: next-xboard
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      # 운영 중인 실제 Xboard 백엔드 API 주소 (끝에 슬래시 제외)
      - XBOARD_API_URL=https://your-xboard-domain.com
      # 선택 사항: 보조 백업 백엔드 주소 (장애 발생 시 자동 전환)
      - XBOARD_BACKUP_API_URL=
      - PORT=3000
      - NODE_ENV=production
```

2. 서비스를 시작합니다：
```bash
docker compose up -d
```

웹 브라우저에서 `http://<서버IP>:3000`에 접속합니다.

---

### 배포 방법 2：로컬 소스코드 실행 및 개발

1. **저장소 복제**：
```bash
git clone https://github.com/aquamarine-z/next-xboard.git
cd next-xboard
```

2. **의존성 설치**：
```bash
pnpm install
```

3. **환경 변수 구성**：
샘플 설정 파일을 복사합니다：
```bash
cp .env.example .env.local
```
`.env.local` 파일을 수정합니다：
```env
# Xboard 백엔드 API 주소 (끝에 슬래시 제외)
XBOARD_API_URL=https://your-xboard-domain.com

# 선택 사항: 보조 백엔드 주소
XBOARD_BACKUP_API_URL=

PORT=3000
NODE_ENV=development
```

4. **Turbopack 개발 서버 실행**：
```bash
pnpm dev
```
브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 실시간 핫 리로드를 확인합니다.

5. **프로덕션 빌드 및 실행**：
```bash
pnpm build
pnpm start
```

---

## ⚙️ 환경 변수 안내

| 변수명 | 설명 | 기본값 | 필수 여부 |
| :--- | :--- | :--- | :---: |
| `XBOARD_API_URL` | Xboard / V2Board 백엔드 API 베이스 URL | `https://cloud.example.com` | **필수** |
| `XBOARD_BACKUP_API_URL` | 장애 대비용 보조 백엔드 API 주소 | `""` | 선택 |
| `PORT` | Next.js 서버가 수신할 포트 번호 | `3000` | 선택 |
| `NODE_ENV` | 애플리케이션 환경 모드 (`development` / `production`) | `production` | 선택 |

---

## 📱 PWA (프로그레시브 웹 앱) 안내

Next-Xboard는 PWA 웹 앱 표준 규격을 완벽하게 충족합니다：
- iPhone Safari에서 접속 후 하단 **공유** -> **홈 화면에 추가**를 탭합니다.
- Android Chrome에서 접속 후 메뉴의 **앱 설치**를 탭합니다.
- 브라우저 상하단 바가 사라진 독립형 전체 화면에서 iOS 26 리퀴드 글래스 앱 감성을 그대로 누리실 수 있습니다.

---

## 🤝 기여하기

버그 리포트, 기능 제안 및 풀 리퀘스트를 언제나 환영합니다!
문의 사항은 [GitHub Issues](https://github.com/aquamarine-z/next-xboard/issues)를 이용해 주세요.

---

## 📄 라이선스

이 프로젝트는 [MIT License](LICENSE)에 따라 라이선스가 부여됩니다.
