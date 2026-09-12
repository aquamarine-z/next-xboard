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
      // Mock fallback for local development if real backend is not set
      if (!process.env.XBOARD_API_URL) {
        const mockToken = "mock_token_" + Buffer.from(email).toString("base64");
        await setSessionToken(mockToken);
        return NextResponse.json({ success: true, token: mockToken, is_mock: true });
      }
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const token =
      typeof result.data === "string"
        ? result.data
        : (result.data as any)?.auth_data || (result.data as any)?.token || "";
    if (token) {
      await setSessionToken(token);
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  await clearSessionToken();
  return NextResponse.json({ success: true });
}
