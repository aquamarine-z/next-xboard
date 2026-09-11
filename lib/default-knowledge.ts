import type { XboardKnowledge } from "@/types/xboard";

export const DEFAULT_KNOWLEDGE_ARTICLES: XboardKnowledge[] = [
  {
    id: 1,
    category: "iOS / iPadOS",
    title: "Shadowrocket (小火箭) 极速配置与使用教程",
    updated_at: Math.floor(Date.now() / 1000) - 86400 * 2,
    body: `
# Shadowrocket (小火箭) 极速配置指南

Shadowrocket 是一款在 iOS / iPadOS 平台广受好评的高性能代理工具。以下是将其连接至本服务的完整步骤。

## 获取订阅链接

1. 登录本站控制台，进入「仪表盘」。
2. 在「当前订阅套餐」卡片中，点击「一键导入订阅」弹窗，或点击「复制订阅链接」。

## 一键导入至 Shadowrocket

1. 在本站仪表盘点击「一键导入订阅」后，选择 **Shadowrocket** 快捷按钮。
2. 浏览器将唤起 Shadowrocket 应用并自动填入订阅地址与节点列表。

## 手动导入（备用方式）

如果唤起失败，请按以下步骤手动添加：

1. 打开 Shadowrocket 应用，点击右上角的 \`+\` 加号。
2. 在「类型」一栏选择 **Subscribe**。
3. 在「URL」栏中粘贴刚才复制的订阅链接。
4. 备注可填入 \`Aqua VPS\`，点击右上角「完成」。
5. Shadowrocket 将自动拉取所有可用节点服务器。

## 连接与分流模式推荐

1. 在全局路由设置中，建议选择 **配置 (Config)** 模式：
   - 国内网站与应用自动直连，不消耗套餐流量。
   - 海外网站自动走节点加速。
2. 点击第一行的开关开启代理，首次连接时系统会提示添加 VPN 配置，输入锁屏密码允许即可。
`,
  },
  {
    id: 2,
    category: "Windows / macOS",
    title: "Clash Verge / Clash Meta 快速上手配置指南",
    updated_at: Math.floor(Date.now() / 1000) - 86400 * 3,
    body: `
# Clash Verge / Clash Meta 桌面端完整教程

Clash Verge 是现代跨平台桌面客户端的首选工具，界面美观、内核强大且支持完整的智能分流。

## 安装客户端

- Windows 用户推荐下载并安装 Clash Verge Rev 最新安装包。
- macOS 用户支持 Apple Silicon (M1/M2/M3/M4) 及 Intel 原生架构。

## 导入订阅配置

1. 登录本平台，在仪表盘点击「一键导入订阅」→ 选择 **Clash**。
2. 如果浏览器未能自动唤起，可点击「复制订阅链接」。
3. 打开 Clash Verge，点击左侧导航栏的 **订阅 (Profiles)**。
4. 在上方输入框粘贴订阅链接，点击 **导入 (Import)**。

## 启用代理与模式设置

1. 在订阅列表中右键刚导入的配置，点击「使用 (Select)」。
2. 点击左侧 **代理 (Proxies)**，在策略组中选择延迟最低或测速最佳的节点。
3. 点击左侧 **设置 (Settings)**，开启 **系统代理 (System Proxy)**。
4. 如需全局加速或游戏加速，可一键开启 **Tun 模式**。
`,
  },
  {
    id: 3,
    category: "Universal Core",
    title: "Sing-box 全平台通用核心客户端配置指南",
    updated_at: Math.floor(Date.now() / 1000) - 86400 * 5,
    body: `
# Sing-box 客户端配置指南

Sing-box 是下一代通用代理平台核心，具备极高的并发性能与极低的内存占用，原生支持各类新一代传输协议。

## 获取专属订阅

1. 进入本站控制台「仪表盘」。
2. 点击「一键导入」中的 **Sing-box** 链接直接唤起，或使用 Sing-box 专用订阅链接。

## 客户端配置与载入

1. 打开 Sing-box 客户端（iOS / macOS / Android / Windows）。
2. 进入 **Profiles (配置)** 页面，点击右上角 \`+\` 按钮。
3. 选择 **Remote Profile (远程配置)**，填入配置名称及订阅链接。
4. 开启 **Auto Update (自动更新)**，更新间隔建议设为 1440 分钟（24 小时）。
5. 保存并启用该配置。

## 启动连接

1. 返回 Dashboard 主页面，点击中央的大圆形开关启动。
2. 在策略组中根据需要选择节点。
`,
  },
  {
    id: 4,
    category: "macOS / iOS",
    title: "Surge 旗舰级代理与分流规则配置教程",
    updated_at: Math.floor(Date.now() / 1000) - 86400 * 7,
    body: `
# Surge 旗舰级网络工具配置

Surge 专为 Apple 生态设计，提供行业顶级的高级网络调试与托管分流能力。

## 一键导入托管配置

1. 在本站仪表盘中点击「一键导入」中的 **Surge** 选项。
2. 系统将自动唤起 Surge 并询问是否安装托管配置。
3. 确认托管配置 URL 正确后点击「安装」。

## 启用 Outbound 策略组

1. 打开 Surge，进入 Policy 策略管理。
2. 推荐选择 **PROXIES** 或 **AUTO** 自动延迟优选策略。
3. 勾选 **Enhanced Mode (增强模式)** 可让系统所有非原生代理流量均受 Surge 规则接管。
`,
  },
  {
    id: 5,
    category: "iOS / iPadOS",
    title: "Quantumult X 分流规则与策略组配置教程",
    updated_at: Math.floor(Date.now() / 1000) - 86400 * 8,
    body: `
# Quantumult X (圈 X) 极速配置说明

Quantumult X 具备高度可定制的分流重写和脚本引擎。

## 引用服务器订阅

1. 打开 Quantumult X，点击右下角风车图标进入设置。
2. 找到「节点」模块下的 **节点 (Server Resources)**。
3. 点击右上角 \`+\` 按钮：
   - 标签：\`Aqua VPS\`
   - 资源路径：填入本站订阅链接
4. 点击右上角保存，并在弹窗中选择更新。

## 选择策略与分流

1. 长按主界面右下角的大圆环按钮，切换运行模式为 **规则分流**。
2. 点击节点栏展开节点列表，选择心仪的接入点即可。
`,
  },
  {
    id: 6,
    category: "常见问题 FAQ",
    title: "常见连接异常与故障排查自检手册",
    updated_at: Math.floor(Date.now() / 1000) - 86400 * 1,
    body: `
# 常见问题与故障排除指南 (FAQ)

遇到连接问题？请先参考以下高频解决方案进行快速自检。

## 订阅链接导入提示“网络连接超时”或“解析失败”？

- **检查网络环境**：请确保您在导入订阅时没有处于严格受限的局域网环境中。
- **重置安全密钥**：如果旧链接被阻断，可进入本站「账户设置」点击「重置订阅安全密钥」，重新复制新的订阅链接导入。

## 节点有延迟（绿色数字），但无法打开任何国外网页？

- **系统时间偏差**：现代 TLS 加密协议对系统本地时间要求极高。如果设备时间与标准北京时间相差超过 60 秒，会导致握手全部失败。请进入系统设置开启「自动设置时间」。
- **DNS 污染残留**：尝试重启客户端，或在客户端设置中清空本地 DNS 缓存。

## 流量已扣除但页面未刷新？

- 仪表盘流量为异步汇总上报，一般在节点断开连接后 5~15 分钟内计入统计。可下拉刷新或重新登录查看最新数据。

## 节点列表为空？

- 请确认您的套餐是否已生效且未处于欠费过期状态。如果刚完成购买，请在客户端中手动执行一次「更新订阅」。
`,
  },
];

export function getDefaultKnowledgeArticles(id?: string | null): XboardKnowledge[] | XboardKnowledge | null {
  if (id) {
    const article = DEFAULT_KNOWLEDGE_ARTICLES.find((a) => String(a.id) === String(id));
    return article || null;
  }
  return DEFAULT_KNOWLEDGE_ARTICLES;
}
