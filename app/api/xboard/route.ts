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
  XboardKnowledge,
} from "@/types/xboard";

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

  // If user is not logged in, fetch guest public config and plans directly from real Xboard backend
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

  // User is authenticated, call real Xboard API endpoints with Bearer token
  if (type === "user") {
    const userRes = await xboardFetch<XboardUser>("/api/v1/user/info");
    if (!userRes.data || userRes.status === 401 || userRes.status === 403) {
      await clearSessionToken();
    }
    return NextResponse.json(userRes.data || { error: userRes.error }, { status: userRes.status });
  }

  if (type === "subscribe") {
    const subRes = await xboardFetch<XboardSubscribe>("/api/v1/user/getSubscribe");
    return NextResponse.json(subRes.data || { error: subRes.error }, { status: subRes.status });
  }

  if (type === "servers") {
    const srvRes = await xboardFetch<XboardServer[]>("/api/v1/user/server/fetch");
    return NextResponse.json(srvRes.data || { error: srvRes.error }, { status: srvRes.status });
  }

  if (type === "tickets") {
    const ticketRes = await xboardFetch<XboardTicket[]>("/api/v1/user/ticket/fetch");
    return NextResponse.json(ticketRes.data || [], { status: ticketRes.status });
  }

  // Aggregated all real data
  const [user, subscribe, servers, noticeRes, planRes, configRes, ticketRes, siteMeta] = await Promise.all([
    xboardFetch<XboardUser>("/api/v1/user/info"),
    xboardFetch<XboardSubscribe>("/api/v1/user/getSubscribe"),
    xboardFetch<XboardServer[]>("/api/v1/user/server/fetch"),
    xboardFetch<XboardNotice[]>("/api/v1/user/notice/fetch"),
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
    subscribe: subscribe.data,
    servers: servers.data || [],
    notices: noticeRes.data || [],
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
      const res = await xboardFetch("/api/v1/user/resetSecurity", {
        method: "POST",
      });
      if (res.error && !process.env.XBOARD_API_URL) {
        return NextResponse.json({ success: true, is_mock: true });
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
      if (res.error && !process.env.XBOARD_API_URL) {
        return NextResponse.json({ success: true, is_mock: true });
      }
      return NextResponse.json(res.data || { error: res.error }, { status: res.status });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
