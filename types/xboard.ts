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
  title?: string;
  app_description?: string;
  logo?: string;
  tos_url?: string;
  is_email_verify?: number;
  is_invite_force?: number;
  email_whitelist_suffix?: number;
  is_recaptcha?: number;
  recaptcha_site_key?: string;
  app_url?: string;
  currency?: string;
  currency_symbol?: string;
}

export interface XboardKnowledge {
  id: number;
  category: string;
  title: string;
  body?: string;
  created_at?: number;
  updated_at: number;
}

export interface XboardOrder {
  id: number;
  trade_no: string;
  order_type?: number;
  plan_id: number;
  plan?: {
    id: number;
    name: string;
    transfer_enable?: number;
  };
  period: string; // month_price, quarter_price, half_year_price, year_price, two_year_price, three_year_price, onetime_price, reset_price
  total_amount: number; // in cents (100 = 1元)
  status: number; // 0=pending/unpaid, 1=completed, 2=cancelled, 3=abnormal
  created_at: number;
  updated_at?: number;
  callback_no?: string;
  balance_amount?: number;
  surplus_amount?: number;
  discount_amount?: number;
  coupon_id?: number;
}

export interface XboardTrafficLog {
  id?: number;
  record_at: number | string; // timestamp or date string YYYY-MM-DD
  u: number; // upload in bytes
  d: number; // download in bytes
  server_rate?: number | string;
  rate?: number | string;
  total?: number; // total in bytes
}

export interface XboardInviteCode {
  id: number;
  user_id: number;
  code: string;
  status: number; // 0=unused/active, 1=used
  pv?: number;
  created_at: number;
  updated_at?: number;
}

export interface XboardInviteDetail {
  id: number;
  user_id?: number;
  created_at: number;
  updated_at?: number;
  order_amount?: number;
  get_amount: number; // in cents
  status?: number;
  order_id?: number;
}

export interface XboardInviteStat {
  registered_count: number;
  commission_rate: number;
  pending_commission: number; // in cents
  total_commission: number; // in cents
}

export interface XboardPaymentMethod {
  id: number;
  name: string;
  payment: string;
  icon?: string;
  handling_fee_percent?: number;
  handling_fee_fixed?: number;
}
