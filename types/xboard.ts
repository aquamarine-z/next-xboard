export interface XboardUser {
  id: number;
  email: string;
  avatar_url?: string;
  transfer_enable: number; // in bytes
  u: number; // upload
  d: number; // download
  expired_at: number; // timestamp in seconds, 0 = never
  plan_id: number;
  remind_expire: number;
  remind_traffic: number;
  token: string;
  is_admin: number;
  is_staff: number;
  balance: number; // in cents or currency unit
  commission_balance: number;
}

export interface XboardPlan {
  id: number;
  group_id: number;
  transfer_enable: number; // in GB
  name: string;
  speed_limit?: number;
  show: number;
  sort?: number;
  renew: number;
  content: string;
  month_price?: number;
  quarter_price?: number;
  half_year_price?: number;
  year_price?: number;
  two_year_price?: number;
  three_year_price?: number;
  onetime_price?: number;
  reset_price?: number;
  reset_traffic_method?: number;
  capacity_limit?: number;
  created_at: number;
  updated_at: number;
}

export interface XboardServer {
  id: number;
  name: string;
  type: string; // vmess, vless, trojan, shadowsocks, hysteria...
  rate: string;
  tags?: string[];
  last_check_at?: number;
  is_online?: number;
  latency?: number; // client calculated ms
}

export interface XboardSubscribe {
  plan_id: number;
  token: string;
  expired_at: number;
  u: number;
  d: number;
  transfer_enable: number;
  email: string;
  subscribe_url: string;
  reset_day?: number;
}

export interface XboardTicket {
  id: number;
  subject: string;
  level: number; // 0=low, 1=medium, 2=high
  status: number; // 0=open, 1=closed
  created_at: number;
  updated_at: number;
  reply_status: number;
  message?: string;
}

export interface XboardNotice {
  id: number;
  title: string;
  content: string;
  created_at: number;
  updated_at: number;
}

export interface XboardConfig {
  app_name: string;
  app_description?: string;
  tos_url?: string;
  is_email_verify: number;
  is_invite_force: number;
  email_whitelist_suffix: number;
  is_recaptcha: number;
  recaptcha_site_key?: string;
  app_url: string;
  currency: string;
  currency_symbol: string;
}

export interface XboardKnowledge {
  id: number;
  category: string;
  title: string;
  body?: string;
  created_at?: number;
  updated_at: number;
}
