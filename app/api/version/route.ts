import { NextResponse } from "next/server";
import { APP_VERSION, APP_BUILD, RELEASE_DATE } from "@/lib/version";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return NextResponse.json(
    {
      version: APP_VERSION,
      build: APP_BUILD,
      releaseDate: RELEASE_DATE,
      serverTime: Date.now(),
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}
