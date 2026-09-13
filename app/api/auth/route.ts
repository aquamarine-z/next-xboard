import { NextResponse } from "next/server";
import { setSessionToken, clearSessionToken } from "@/server/session";
import { xboardFetch } from "@/server/xboard-client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Call Xboard Laravel native API /api/v1/passport/auth/login
    const result = await xboardFetch<{ auth_data?: string; token?: string }>(
      "/api/v1/passport/auth/login",
      {
        method: "POST",
        requiresAuth: false,
        body: JSON.stringify({ email, password }),
      }
    );

    if (result.error || !result.data) {
      return NextResponse.json(
        { error: result.error || "登录失败，请检查账号密码" },
        { status: result.status || 400 }
      );
    }

    const token =
      typeof result.data === "string"
        ? result.data
        : (result.data as any)?.auth_data || (result.data as any)?.token || "";
    if (!token) {
      return NextResponse.json({ error: "未能从后端获取有效登录令牌" }, { status: 400 });
    }

    await setSessionToken(token);
    return NextResponse.json({ success: true, data: result.data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  await clearSessionToken();
  return NextResponse.json({ success: true });
}
