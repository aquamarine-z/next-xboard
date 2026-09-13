import { NextResponse } from "next/server";
import { xboardFetch, getXboardSiteMeta } from "@/server/xboard-client";
import { getSessionToken, clearSessionToken } from "@/server/session";
import { getDefaultKnowledgeArticles } from "@/lib/default-knowledge";
import type {
  XboardUser,
  XboardSubscribe,
  XboardServer,
  XboardNotice,
  XboardConfig,
  XboardPlan,
  XboardTicket,
} from "@/types/xboard";

async function fetchAllNotices(): Promise<XboardNotice[]> {
  try {
    const firstRes = await xboardFetch<XboardNotice[]>("/api/v1/user/notice/fetch?current=1&pageSize=100");
    const firstPage = Array.isArray(firstRes.data) ? firstRes.data : [];

    if (firstPage.length === 0) {
      return [];
    }

    const total = typeof firstRes.total === "number" ? firstRes.total : undefined;

    // If total is known and all notices were fetched in the first request
    if (total !== undefined && total <= firstPage.length) {
      return firstPage;
    }

    // Standard Xboard NoticeController.php hardcodes $pageSize = 5;
    // When total > firstPage.length, fetch all remaining pages in parallel
    if (total !== undefined && total > firstPage.length) {
      const pageSize = 5;
      const totalPages = Math.ceil(total / pageSize);
      const remainingPromises: Promise<{ data: XboardNotice[] | null }>[] = [];

      for (let page = 2; page <= totalPages && page <= 20; page++) {
        remainingPromises.push(
          xboardFetch<XboardNotice[]>(`/api/v1/user/notice/fetch?current=${page}&pageSize=100`)
        );
      }

      const results = await Promise.all(remainingPromises);
      const allNotices = [...firstPage];
      for (const res of results) {
        if (Array.isArray(res.data)) {
          allNotices.push(...res.data);
        }
      }

      const seenIds = new Set<number | string>();
      return allNotices.filter((n) => {
        if (n && n.id !== undefined) {
          if (seenIds.has(n.id)) return false;
          seenIds.add(n.id);
        }
        return true;
      });
    }

    // Fallback if backend does not return total but first page is full (>= 5 items)
    if (firstPage.length >= 5) {
      const allNotices = [...firstPage];
      for (let page = 2; page <= 10; page++) {
        const nextRes = await xboardFetch<XboardNotice[]>(`/api/v1/user/notice/fetch?current=${page}&pageSize=100`);
        const nextPage = Array.isArray(nextRes.data) ? nextRes.data : [];
        if (nextPage.length === 0) break;
        allNotices.push(...nextPage);
        if (nextPage.length < 5) break;
      }
      const seenIds = new Set<number | string>();
      return allNotices.filter((n) => {
        if (n && n.id !== undefined) {
          if (seenIds.has(n.id)) return false;
          seenIds.add(n.id);
        }
        return true;
      });
    }

    return firstPage;
  } catch (err) {
    console.error("Failed to fetch all notices:", err);
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "all";
  const token = await getSessionToken();

  // 1. Knowledge Base: Accessible to all users with fallback to standard client guides
  if (type === "knowledge") {
    const id = searchParams.get("id");
    const keyword = searchParams.get("keyword");
    const params = new URLSearchParams();
    if (id) params.set("id", id);
    if (keyword) params.set("keyword", keyword);
    const queryString = params.toString() ? `?${params.toString()}` : "";

    let backendArticles: any = null;
    if (token) {
      const knowledgeRes = await xboardFetch<any>(`/api/v1/user/knowledge/fetch${queryString}`);
      if (
        knowledgeRes.data &&
        (!Array.isArray(knowledgeRes.data) || knowledgeRes.data.length > 0)
      ) {
        backendArticles = knowledgeRes.data;
      }
    }

    if (backendArticles) {
      return NextResponse.json(backendArticles);
    }

    // Return standard official guides if backend knowledge base has no articles or user is guest
    return NextResponse.json(getDefaultKnowledgeArticles(id));
  }

  // 2. Unauthenticated state: Return guest config and plans
  if (!token) {
    const [configRes, planRes, siteMeta] = await Promise.all([
      xboardFetch<XboardConfig>("/api/v1/guest/comm/config", { requiresAuth: false }),
      xboardFetch<XboardPlan[]>("/api/v1/guest/plan/fetch", { requiresAuth: false }),
      getXboardSiteMeta(),
    ]);

    const rawConfig = (configRes.data || {}) as XboardConfig;
    const mergedConfig: XboardConfig = {
      ...rawConfig,
      app_name: siteMeta.title || rawConfig.app_name || "Aqua VPS (试运营中)",
      title: siteMeta.title || rawConfig.app_name || "Aqua VPS (试运营中)",
      app_description: siteMeta.description || rawConfig.app_description || "Aqua的VPS云",
      logo: siteMeta.logo || rawConfig.logo || "",
    };

    const guestPlans = Array.isArray(planRes.data)
      ? planRes.data.filter((p: any) => p && p.show !== 0 && p.show !== "0" && p.show !== false)
      : [];

    return NextResponse.json({
      authenticated: false,
      user: null,
      subscribe: null,
      servers: [],
      notices: [],
      tickets: [],
      config: mergedConfig,
      plans: guestPlans,
    });
  }

  // 3. User is authenticated, call real Xboard API endpoints with Bearer token
  if (type === "user") {
    const userRes = await xboardFetch<XboardUser>("/api/v1/user/info");
    if (userRes.status === 401 || userRes.status === 403) {
      await clearSessionToken();
      return NextResponse.json({ error: userRes.error }, { status: userRes.status });
    }
    return NextResponse.json(userRes.data);
  }

  if (type === "subscribe") {
    const subRes = await xboardFetch<XboardSubscribe>("/api/v1/user/getSubscribe");
    return NextResponse.json(subRes.data);
  }

  if (type === "servers") {
    const srvRes = await xboardFetch<XboardServer[]>("/api/v1/user/server/fetch");
    return NextResponse.json(srvRes.data || []);
  }

  if (type === "tickets") {
    const ticketRes = await xboardFetch<XboardTicket[]>("/api/v1/user/ticket/fetch");
    return NextResponse.json(ticketRes.data || []);
  }

  if (type === "notices") {
    const currentParam = searchParams.get("current");
    if (currentParam) {
      const current = parseInt(currentParam, 10) || 1;
      const res = await xboardFetch<XboardNotice[]>(`/api/v1/user/notice/fetch?current=${current}&pageSize=5`);
      const list = Array.isArray(res.data) ? res.data : [];
      const total = typeof res.total === "number" ? res.total : list.length;
      return NextResponse.json({
        data: list,
        total,
        current,
        hasMore: current * 5 < total,
      });
    }

    const noticeList = await fetchAllNotices();
    return NextResponse.json(noticeList);
  }

  if (type === "orders") {
    const ordersRes = await xboardFetch<any>("/api/v1/user/order/fetch");
    if (ordersRes.data) {
      const list = Array.isArray(ordersRes.data)
        ? ordersRes.data
        : (ordersRes.data as any).data || [];
      return NextResponse.json(list);
    }
    return NextResponse.json([]);
  }

  if (type === "traffic_log") {
    const logRes = await xboardFetch<any>("/api/v1/user/stat/getTrafficLog");
    return NextResponse.json(logRes.data || []);
  }

  if (type === "invites") {
    const inviteRes = await xboardFetch<any>("/api/v1/user/invite/fetch");
    return NextResponse.json(inviteRes.data || { codes: [], stat: [0, 0, 0, 0] });
  }

  if (type === "invite_details") {
    const detailsRes = await xboardFetch<any>("/api/v1/user/invite/details");
    const list = Array.isArray(detailsRes.data)
      ? detailsRes.data
      : (detailsRes.data as any)?.data || [];
    return NextResponse.json(list);
  }

  // 4. Aggregated all real data for initial Dashboard load
  const [user, subscribe, servers, allNotices, planRes, configRes, ticketRes, siteMeta] = await Promise.all([
    xboardFetch<XboardUser>("/api/v1/user/info"),
    xboardFetch<XboardSubscribe>("/api/v1/user/getSubscribe"),
    xboardFetch<XboardServer[]>("/api/v1/user/server/fetch"),
    fetchAllNotices(),
    xboardFetch<XboardPlan[]>("/api/v1/user/plan/fetch"),
    xboardFetch<XboardConfig>("/api/v1/guest/comm/config", { requiresAuth: false }),
    xboardFetch<XboardTicket[]>("/api/v1/user/ticket/fetch"),
    getXboardSiteMeta(),
  ]);

  const rawConfig = (configRes.data || {}) as XboardConfig;
  const mergedConfig: XboardConfig = {
    ...rawConfig,
    app_name: siteMeta.title || rawConfig.app_name || "Aqua VPS (试运营中)",
    title: siteMeta.title || rawConfig.app_name || "Aqua VPS (试运营中)",
    app_description: siteMeta.description || rawConfig.app_description || "Aqua的VPS云",
    logo: siteMeta.logo || rawConfig.logo || "",
  };

  let allPlans = (Array.isArray(planRes.data) && planRes.data.length > 0)
    ? planRes.data
    : [];

  if (allPlans.length === 0) {
    const guestPlans = await xboardFetch<XboardPlan[]>("/api/v1/guest/plan/fetch", { requiresAuth: false });
    if (Array.isArray(guestPlans.data) && guestPlans.data.length > 0) {
      allPlans = guestPlans.data;
    }
  }

  // Only include plans explicitly marked for sale (show !== 0)
  const salePlans = allPlans.filter((p: any) => p && p.show !== 0 && p.show !== "0" && p.show !== false);

  // If session is expired or invalid on the backend, clear session token and return unauthenticated response
  if (!user.data) {
    await clearSessionToken();
    return NextResponse.json({
      authenticated: false,
      user: null,
      subscribe: null,
      servers: [],
      notices: [],
      plans: salePlans,
      tickets: [],
      config: mergedConfig,
    });
  }

  return NextResponse.json({
    authenticated: true,
    user: user.data,
    subscribe: subscribe.data || null,
    servers: servers.data || [],
    notices: allNotices || [],
    plans: salePlans,
    tickets: ticketRes.data || [],
    config: mergedConfig,
  });
}

export async function POST(request: Request) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const action = body.action || "create_ticket";

    if (action === "create_ticket") {
      const res = await xboardFetch("/api/v1/user/ticket/save", {
        method: "POST",
        body: JSON.stringify({
          subject: body.subject,
          level: body.level ?? 1,
          message: body.message || body.subject,
        }),
      });
      return NextResponse.json(res.data || { error: res.error }, { status: res.status });
    }

    if (action === "reply_ticket") {
      const res = await xboardFetch("/api/v1/user/ticket/reply", {
        method: "POST",
        body: JSON.stringify({
          id: body.id,
          message: body.message,
        }),
      });
      return NextResponse.json(res.data || { error: res.error }, { status: res.status });
    }

    if (action === "close_ticket") {
      const res = await xboardFetch("/api/v1/user/ticket/close", {
        method: "POST",
        body: JSON.stringify({
          id: body.id,
        }),
      });
      return NextResponse.json(res.data || { error: res.error }, { status: res.status });
    }

    if (action === "reset_security") {
      let res = await xboardFetch("/api/v1/user/resetSecurity", {
        method: "GET",
      });
      if (res.error && res.status === 405) {
        res = await xboardFetch("/api/v1/user/resetSecurity", {
          method: "POST",
        });
      }
      return NextResponse.json(res.data || { error: res.error }, { status: res.status });
    }

    if (action === "change_password") {
      const currentPassword = body.current_password || body.old_password || "";
      const res = await xboardFetch("/api/v1/user/changePassword", {
        method: "POST",
        body: JSON.stringify({
          old_password: currentPassword,
          current_password: currentPassword,
          new_password: body.new_password,
        }),
      });
      return NextResponse.json(res.data || { error: res.error }, { status: res.status });
    }

    // 1. Notification Reminders update
    if (action === "update_remind") {
      const res = await xboardFetch("/api/v1/user/update", {
        method: "POST",
        body: JSON.stringify({
          remind_expire: body.remind_expire,
          remind_traffic: body.remind_traffic,
        }),
      });
      return NextResponse.json(res.data || { error: res.error }, { status: res.status });
    }

    // 2. Order Save
    if (action === "save_order") {
      const res = await xboardFetch("/api/v1/user/order/save", {
        method: "POST",
        body: JSON.stringify({
          plan_id: body.plan_id,
          period: body.period,
          coupon_code: body.coupon_code,
        }),
      });
      return NextResponse.json(res.data || { error: res.error }, { status: res.status });
    }

    // 3. Order Checkout
    if (action === "checkout_order") {
      const res = await xboardFetch("/api/v1/user/order/checkout", {
        method: "POST",
        body: JSON.stringify({
          trade_no: body.trade_no,
          method: body.method,
        }),
      });
      return NextResponse.json(res.data || { error: res.error }, { status: res.status });
    }

    // 4. Order Cancel
    if (action === "cancel_order") {
      const res = await xboardFetch("/api/v1/user/order/cancel", {
        method: "POST",
        body: JSON.stringify({
          trade_no: body.trade_no,
        }),
      });
      return NextResponse.json(res.data || { error: res.error }, { status: res.status });
    }

    // 5. Coupon check
    if (action === "check_coupon") {
      const res = await xboardFetch("/api/v1/user/coupon/check", {
        method: "POST",
        body: JSON.stringify({
          code: body.code,
          plan_id: body.plan_id,
        }),
      });
      return NextResponse.json(res.data || { error: res.error }, { status: res.status });
    }

    // 6. Generate invite code
    if (action === "generate_invite") {
      let res = await xboardFetch("/api/v1/user/invite/save", {
        method: "GET",
      });
      if (res.error && res.status === 405) {
        res = await xboardFetch("/api/v1/user/invite/save", {
          method: "POST",
        });
      }
      if (res.error) {
        return NextResponse.json({ error: res.error }, { status: res.status });
      }
      return NextResponse.json({ data: res.data ?? true, success: true }, { status: res.status });
    }

    // 7. Transfer commission to balance
    if (action === "transfer_commission") {
      const res = await xboardFetch("/api/v1/user/transfer", {
        method: "POST",
        body: JSON.stringify({
          transfer_amount: body.transfer_amount,
        }),
      });
      return NextResponse.json(res.data || { error: res.error }, { status: res.status });
    }

    // 8. Withdraw commission
    if (action === "withdraw_commission") {
      const res = await xboardFetch("/api/v1/user/ticket/withdraw", {
        method: "POST",
        body: JSON.stringify({
          withdraw_amount: body.withdraw_amount,
          withdraw_method: body.withdraw_method,
        }),
      });
      if (res.error && res.status === 404) {
        // Fallback to standard ticket if withdraw route is not enabled
        const ticketRes = await xboardFetch("/api/v1/user/ticket/save", {
          method: "POST",
          body: JSON.stringify({
            subject: `[佣金提现申请] ¥${(body.withdraw_amount / 100).toFixed(2)}`,
            level: 2,
            message: `申请提现金额: ¥${(body.withdraw_amount / 100).toFixed(2)}\n收款方式: ${body.withdraw_method}`,
          }),
        });
        return NextResponse.json(ticketRes.data || { error: ticketRes.error }, { status: ticketRes.status });
      }
      return NextResponse.json(res.data || { error: res.error }, { status: res.status });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
