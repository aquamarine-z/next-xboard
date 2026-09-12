"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/context";

export default function NodesPage() {
  const router = useRouter();
  const { locale } = useTranslation();

  React.useEffect(() => {
    router.replace(`/${locale}/dashboard#nodes`);
  }, [router, locale]);

  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="w-6 h-6 border-2 border-[#0066cc] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
