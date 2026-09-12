import * as React from "react";

export interface AppleCloudIconProps extends React.SVGProps<SVGSVGElement> {}

/**
 * Apple Precision Geometric Linear Cloud Icon (极简纯线条感云图标)
 * 100% pure wireframe stroke line-work without clutter or heavy background fills.
 * Clean, balanced cloud silhouette in Apple System Light Gray (#86868b / #a1a1a6).
 */
export function AppleCloudIcon({
  className = "w-4 h-4 text-[#86868b] dark:text-[#a1a1a6]",
  ...props
}: AppleCloudIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path
        d="M6.5 17.5H17.5C19.7091 17.5 21.5 15.7091 21.5 13.5C21.5 11.3787 19.8514 9.64188 17.765 9.51325C17.2917 6.11186 14.9392 3.5 12 3.5C9.06078 3.5 6.70834 6.11186 6.23497 9.51325C4.1486 9.64188 2.5 11.3787 2.5 13.5C2.5 15.7091 4.29086 17.5 6.5 17.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Export aliases for backward compatibility
export const AppleNodeIcon = AppleCloudIcon;
export const AppleBoltIcon = AppleCloudIcon;

interface AppleAppBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

/**
 * Precision Geometric Badge Frame (极简极细边框，无厚重背景)
 * Subtle 1px outline with transparent, non-intrusive backdrop.
 */
export function AppleAppBadge({
  size = "md",
  className = "",
  children,
  ...props
}: AppleAppBadgeProps) {
  const sizeStyles = {
    sm: "w-7 h-7 rounded-[6px] border border-black/[0.12] dark:border-white/[0.16] bg-black/[0.02] dark:bg-white/[0.03] text-foreground shadow-2xs",
    md: "w-10 h-10 rounded-[9px] border border-black/[0.12] dark:border-white/[0.16] bg-black/[0.02] dark:bg-white/[0.03] text-foreground shadow-2xs",
    lg: "w-13 h-13 rounded-[12px] border border-black/[0.12] dark:border-white/[0.16] bg-black/[0.02] dark:bg-white/[0.03] text-foreground shadow-xs",
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none transition-all duration-200 ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
