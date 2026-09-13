"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, toast as sonnerToast, type ToasterProps } from "sonner";
import { Check, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppleNotificationBannerProps {
  id: string | number;
  type: "success" | "error" | "info" | "warning";
  title: React.ReactNode;
  description?: React.ReactNode;
}

export function AppleNotificationBanner({
  id,
  type,
  title,
  description,
}: AppleNotificationBannerProps) {
  const statusConfig = {
    success: {
      icon: Check,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/15 border-emerald-500/20",
    },
    error: {
      icon: AlertCircle,
      iconColor: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-500/15 border-rose-500/20",
    },
    info: {
      icon: Info,
      iconColor: "text-[#0071e3] dark:text-[#2997ff]",
      bg: "bg-[#0071e3]/15 border-[#0071e3]/20",
    },
    warning: {
      icon: AlertTriangle,
      iconColor: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/15 border-amber-500/20",
    },
  }[type];

  const StatusIcon = statusConfig.icon;

  return (
    <div
      onClick={() => sonnerToast.dismiss(id)}
      className="relative w-[356px] max-w-[calc(100vw-32px)] rounded-[20px] py-2.5 px-4 sm:px-4.5 transition-all duration-300 select-none cursor-pointer overflow-hidden backdrop-blur-3xl backdrop-saturate-200 bg-white/85 dark:bg-[#1c1c1e]/88 border border-black/[0.08] dark:border-white/[0.14] shadow-[0_16px_36px_rgba(0,0,0,0.12),0_4px_10px_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.95)] dark:shadow-[0_20px_42px_rgba(0,0,0,0.6),0_4px_14px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.2)] active:scale-[0.98] flex items-center gap-3"
    >
      {/* Prismatic Top Sheen Line (次世代空间高光切面) */}
      <div className="absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/95 dark:via-white/35 to-transparent pointer-events-none" />

      {/* Status Icon Badge */}
      <div
        className={cn(
          "w-[26px] h-[26px] rounded-[8px] flex items-center justify-center shrink-0 border",
          statusConfig.bg,
          statusConfig.iconColor
        )}
      >
        <StatusIcon className="w-3.5 h-3.5 stroke-[2.4]" />
      </div>

      {/* Content (Title & Description) - Natural Left Aligned */}
      <div className="flex flex-col justify-center min-w-0 flex-1 text-left">
        <p className="text-[13px] font-medium text-foreground/85 dark:text-foreground/90 tracking-tight leading-snug break-words whitespace-normal [overflow-wrap:anywhere]">
          {title}
        </p>
        {description && (
          <p className="text-[11.5px] text-foreground/55 dark:text-foreground/60 leading-normal mt-0.5 break-words whitespace-normal [overflow-wrap:anywhere]">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = React.useState(true);

  React.useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    setIsDesktop(media.matches);

    const onChange = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches);
    };

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return isDesktop;
}

export function Toaster({ ...props }: ToasterProps) {
  const { theme = "system" } = useTheme();
  const isDesktop = useIsDesktop();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position={isDesktop ? "bottom-right" : "top-center"}
      offset={isDesktop ? 24 : 100}
      visibleToasts={isDesktop ? 3 : 2}
      expand={false}
      className="toaster group"
      {...props}
    />
  );
}

function notify(
  type: "success" | "error" | "info" | "warning",
  message: React.ReactNode,
  data?: any
) {
  const toastId = data?.id || (typeof message === "string" ? message : undefined);
  return sonnerToast.custom(
    (id) => (
      <AppleNotificationBanner
        id={id}
        type={type}
        title={message}
        description={data?.description}
      />
    ),
    {
      id: toastId,
      duration: data?.duration ?? 3600,
      ...data,
    }
  );
}

export const toast = Object.assign(
  (message: any, data?: any) => notify("info", message, data),
  {
    ...sonnerToast,
    success: (message: any, data?: any) => notify("success", message, data),
    error: (message: any, data?: any) => notify("error", message, data),
    info: (message: any, data?: any) => notify("info", message, data),
    warning: (message: any, data?: any) => notify("warning", message, data),
  }
);
