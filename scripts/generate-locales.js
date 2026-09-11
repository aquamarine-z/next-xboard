const fs = require("fs");

const zhCN = {
  common: {
    app_name: "Xboard",
    confirm: "确认",
    cancel: "取消",
    save: "保存",
    delete: "删除",
    edit: "编辑",
    back: "返回",
    copy: "复制",
    copied: "已复制到剪贴板",
    loading: "加载中...",
    success: "操作成功",
    failed: "操作失败",
    network_error: "网络异常，请稍后重试",
    status: {
      online: "在线",
      offline: "离线",
      active: "生效中",
      expired: "已过期",
      pending: "待处理"
    },
    nav: {
      dashboard: "仪表盘",
      nodes: "节点列表",
      shop: "订阅商店",
      orders: "我的账单",
      tickets: "工单支持",
      knowledge: "文档教程",
      profile: "账户设置",
      logout: "退出登录"
    },
    theme: {
      toggle: "切换主题",
      light: "浅色模式",
      dark: "深色模式",
      system: "跟随系统"
    },
    language: {
      toggle: "切换语言",
      zh_CN: "简体中文",
      en_US: "English"
    }
  },
  auth: {
    login_title: "欢迎回来",
    login_subtitle: "登录您的 Xboard 账户以管理订阅和节点",
    register_title: "创建新账户",
    register_subtitle: "即刻加入，体验极速无阻的全球网络互联",
    email: "电子邮箱",
    email_placeholder: "name@example.com",
    password: "密码",
    password_placeholder: "请输入密码",
    confirm_password: "确认密码",
    confirm_password_placeholder: "请再次输入密码",
    invite_code: "邀请码",
    invite_code_placeholder: "如有邀请码请输入",
    login_button: "登录",
    register_button: "注册",
    logging_in: "登录中...",
    registering: "注册中...",
    no_account: "还没有账户？",
    have_account: "已有账户？",
    forgot_password: "忘记密码？",
    login_success: "登录成功，正在进入控制台...",
    register_success: "注册成功，欢迎加入！"
  },
  dashboard: {
    greeting: "欢迎，{name}",
    plan_title: "当前订阅套餐",
    no_active_plan: "暂无有效订阅",
    buy_plan_cta: "立即选购套餐",
    expire_time: "到期时间",
    never_expire: "长期有效",
    traffic_used: "已用流量",
    traffic_total: "总计配额",
    traffic_remaining: "剩余流量",
    traffic_reset: "距流量重置还剩 {days} 天",
    quick_import: "一键导入订阅",
    quick_import_desc: "支持快速导入至各大主流平台客户端，或手动复制托管链接",
    copy_subscription: "复制订阅链接",
    clients: {
      clash: "导入至 Clash",
      shadowrocket: "导入至 Shadowrocket",
      quantumultx: "导入至 Quantumult X",
      surge: "导入至 Surge",
      singbox: "导入至 Sing-box"
    },
    notice_title: "重要系统公告",
    notice_empty: "暂无最新系统公告",
    node_quick_view: "精选高可用节点",
    view_all_nodes: "查看所有节点"
  },
  nodes: {
    title: "节点网络",
    subtitle: "全球优质低延迟骨干线路与高质量接入点",
    search_placeholder: "按国家/地区/协议搜索节点...",
    status_filter: "全部状态",
    rate: "倍率: {rate}x",
    latency: "{ms} ms",
    testing_latency: "测速中...",
    test_all: "全量测速",
    copy_node_link: "复制单节点配置",
    qr_code: "二维码",
    tags: "标签",
    empty: "暂无可用的节点服务器"
  },
  shop: {
    title: "订阅商店",
    subtitle: "弹性选择适合您的专属高速带宽套餐",
    cycle: {
      month: "按月订阅",
      quarter: "季付优惠",
      half_year: "半年套餐",
      year: "年付尊享",
      two_year: "两年周期",
      three_year: "三年周期",
      onetime: "不限时流量包"
    },
    features_title: "套餐权益包含",
    buy_now: "立即订购",
    order_confirm_title: "确认订单明细",
    coupon_code: "使用优惠券",
    coupon_placeholder: "输入优惠码",
    apply_coupon: "兑换",
    total_price: "应付金额",
    pay_methods: "支付通道",
    checkout_button: "前往支付"
  },
  tickets: {
    title: "工单与支持",
    subtitle: "遇到任何连接或账户问题，我们的技术专家随时待命",
    create_ticket: "新建工单",
    ticket_subject: "工单主题",
    ticket_level: "工单优先级",
    level_low: "一般咨询",
    level_medium: "连接故障",
    level_high: "紧急求助",
    ticket_message: "详细说明",
    send_reply: "发送回复",
    close_ticket: "关闭工单",
    reply_placeholder: "在此输入您的消息...",
    empty: "当前没有进行中的工单"
  },
  profile: {
    title: "个人设置",
    subtitle: "管理您的个人信息、安全凭证与联动服务",
    account_info: "账户凭证",
    change_password: "修改密码",
    current_password: "当前密码",
    new_password: "新密码",
    reset_security: "重置订阅安全密钥",
    reset_security_desc: "若您的订阅链接疑似泄露，重置后旧链接将立即失效",
    reset_security_btn: "重置订阅凭据",
    reset_confirm: "确定要重置安全密钥吗？旧客户端需重新导入",
    telegram_bind: "Telegram 快捷绑定",
    telegram_bind_desc: "绑定 Telegram 机器人，随时随地接收节点变动与账户通知",
    bind_now: "立即关联"
  }
};

const enUS = {
  common: {
    app_name: "Xboard",
    confirm: "Confirm",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    back: "Back",
    copy: "Copy",
    copied: "Copied to clipboard",
    loading: "Loading...",
    success: "Operation successful",
    failed: "Operation failed",
    network_error: "Network error, please try again later",
    status: {
      online: "Online",
      offline: "Offline",
      active: "Active",
      expired: "Expired",
      pending: "Pending"
    },
    nav: {
      dashboard: "Dashboard",
      nodes: "Nodes",
      shop: "Store",
      orders: "Billing",
      tickets: "Support",
      knowledge: "Guides",
      profile: "Settings",
      logout: "Sign Out"
    },
    theme: {
      toggle: "Toggle theme",
      light: "Light",
      dark: "Dark",
      system: "System"
    },
    language: {
      toggle: "Switch language",
      zh_CN: "简体中文",
      en_US: "English"
    }
  },
  auth: {
    login_title: "Welcome Back",
    login_subtitle: "Sign in to your Xboard account to manage subscriptions and nodes",
    register_title: "Create Your Account",
    register_subtitle: "Get started today and enjoy seamless, ultra-fast global networking",
    email: "Email Address",
    email_placeholder: "name@example.com",
    password: "Password",
    password_placeholder: "Enter your password",
    confirm_password: "Confirm Password",
    confirm_password_placeholder: "Re-enter your password",
    invite_code: "Invitation Code",
    invite_code_placeholder: "Optional invitation code",
    login_button: "Sign In",
    register_button: "Create Account",
    logging_in: "Signing in...",
    registering: "Creating account...",
    no_account: "Don't have an account?",
    have_account: "Already have an account?",
    forgot_password: "Forgot password?",
    login_success: "Logged in successfully, redirecting...",
    register_success: "Account created successfully, welcome!"
  },
  dashboard: {
    greeting: "Welcome, {name}",
    plan_title: "Current Subscription",
    no_active_plan: "No Active Subscription",
    buy_plan_cta: "Browse Plans",
    expire_time: "Expires On",
    never_expire: "Permanent",
    traffic_used: "Data Used",
    traffic_total: "Total Quota",
    traffic_remaining: "Remaining Data",
    traffic_reset: "Resets in {days} days",
    quick_import: "Quick Import",
    quick_import_desc: "One-click configuration for popular clients or copy subscription URL manually",
    copy_subscription: "Copy Subscription URL",
    clients: {
      clash: "Import to Clash",
      shadowrocket: "Import to Shadowrocket",
      quantumultx: "Import to Quantumult X",
      surge: "Import to Surge",
      singbox: "Import to Sing-box"
    },
    notice_title: "System Announcements",
    notice_empty: "No new announcements",
    node_quick_view: "Top Reliable Nodes",
    view_all_nodes: "View All Nodes"
  },
  nodes: {
    title: "Global Nodes",
    subtitle: "Low-latency premium backbone connections and distributed access points",
    search_placeholder: "Search by region, country, or protocol...",
    status_filter: "All Statuses",
    rate: "Rate: {rate}x",
    latency: "{ms} ms",
    testing_latency: "Pinging...",
    test_all: "Ping All",
    copy_node_link: "Copy Node Config",
    qr_code: "QR Code",
    tags: "Tags",
    empty: "No node servers available at the moment"
  },
  shop: {
    title: "Subscription Store",
    subtitle: "Flexible and high-speed dedicated bandwidth plans tailored for you",
    cycle: {
      month: "Monthly",
      quarter: "Quarterly",
      half_year: "Semi-Annually",
      year: "Annually",
      two_year: "2 Years",
      three_year: "3 Years",
      onetime: "Data Pack (One-time)"
    },
    features_title: "Plan Features Included",
    buy_now: "Subscribe Now",
    order_confirm_title: "Confirm Order Details",
    coupon_code: "Coupon Code",
    coupon_placeholder: "Enter promo code",
    apply_coupon: "Apply",
    total_price: "Total Payable",
    pay_methods: "Payment Gateway",
    checkout_button: "Proceed to Payment"
  },
  tickets: {
    title: "Support Tickets",
    subtitle: "Have questions or connectivity issues? Our support engineers are here to help",
    create_ticket: "New Ticket",
    ticket_subject: "Subject",
    ticket_level: "Priority",
    level_low: "General Inquiry",
    level_medium: "Connection Issue",
    level_high: "Urgent Help",
    ticket_message: "Message",
    send_reply: "Send Reply",
    close_ticket: "Close Ticket",
    reply_placeholder: "Type your message here...",
    empty: "No active tickets found"
  },
  profile: {
    title: "Account Settings",
    subtitle: "Manage your credentials, subscription security, and connected apps",
    account_info: "Credentials",
    change_password: "Change Password",
    current_password: "Current Password",
    new_password: "New Password",
    reset_security: "Reset Subscription Secret",
    reset_security_desc: "If your link was exposed, resetting will immediately invalidate old URLs",
    reset_security_btn: "Reset Security Secret",
    reset_confirm: "Are you sure you want to reset? Old clients must be reconfigured",
    telegram_bind: "Telegram Integration",
    telegram_bind_desc: "Connect our Telegram Bot to receive real-time notifications and alerts",
    bind_now: "Connect Now"
  }
};

fs.writeFileSync("locales/zh-CN/dictionary.json", JSON.stringify(zhCN, null, 2));
fs.writeFileSync("locales/en-US/dictionary.json", JSON.stringify(enUS, null, 2));
console.log("i18n dictionaries successfully created in locales/zh-CN and locales/en-US");
