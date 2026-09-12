import { redirect } from "next/navigation";
import { getSessionToken } from "@/server/session";

export default async function LangRootPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const token = await getSessionToken();
  if (!token) {
    redirect(`/${lang}/login`);
  }
  redirect(`/${lang}/dashboard`);
}