"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useSpring, useTransform, animate } from "framer-motion";
import { cn } from "@/lib/utils";

export interface AppleLiquidTabItem<T = string> {
  id: T;
  label: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: React.ReactNode;
  href?: string;
  onClick?: () => void;
}

export interface AppleLiquidTabsProps<T = string> {
  items: AppleLiquidTabItem<T>[];
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  isRouteNav?: boolean;
  size?: "sm" | "md" | "lg";
  orientation?: "horizontal" | "vertical";
  className?: string;
  tabClassName?: string;
  activeColor?: string;
  elevateOnDrag?: boolean;
}

const MAX_OVERDRAG = 24;

// Unified organic liquid spring physics (all properties scale, elevation, X position, and vertical overhang share this identical curve!)
const LIQUID_SPRING = {
  type: "spring" as const,
  stiffness: 440,
  damping: 28,
  mass: 0.6,
};

export function AppleLiquidTabs<T extends string = string>({
  items,
  value,
  defaultValue,
  onChange,
  isRouteNav = false,
  size = "sm",
  orientation = "horizontal",
  className,
  tabClassName,
  activeColor = "text-[#0071e3] dark:text-[#2997ff]",
  elevateOnDrag = false,
}: AppleLiquidTabsProps<T>) {
  const router = useRouter();

  // Internal selection state (supports controlled or uncontrolled)
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState<T>(
    value ?? defaultValue ?? items[0]?.id
  );

  const activeId = isControlled ? (value as T) : internalValue;
  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.id === activeId)
  );

  const [optimisticIndex, setOptimisticIndex] = React.useState<number | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);

  // Sync optimisticIndex when value changes from external navigation or props
  React.useEffect(() => {
    setOptimisticIndex(null);
  }, [value]);

  // Active interaction state:
  // Enters active state (grows larger than bar, high-transparency 3D water droplet)
  // while pressed or actively dragged!
  // The instant the pointer releases, all properties (X snap, vertical shrink, and nav scale)
  // return SIMULTANEOUSLY in one fluid, buttery, unified motion with LIQUID_SPRING!
  const isActive = isPressed || isDragging;

  const currentActiveIndex = optimisticIndex ?? activeIndex;

  const containerRef = React.useRef<HTMLDivElement>(null);
  const innerRef = React.useRef<HTMLDivElement>(null);
  const pillRef = React.useRef<HTMLDivElement>(null);
  const isDraggingRef = React.useRef(false);
  const hasMovedRef = React.useRef(false);
  const startXRef = React.useRef(0);
  const startMouseXRef = React.useRef(0);
  const startPillXRef = React.useRef(0);
  const lastXRef = React.useRef(0);
  const lastTimeRef = React.useRef(0);
  const velocityRef = React.useRef(0);
  const clickTargetIndexRef = React.useRef<number | null>(null);
  const hasInitializedRef = React.useRef(false);

  // Sizing configurations:
  // Non-active (resting): neatly nested, slightly taller with crisp 1px-1.5px inset
  // Active (click, press, hover, drag): swells noticeably taller than the bar!
  const config = React.useMemo(() => {
    switch (size) {
      case "lg":
        return {
          restingInset: 1.5,
          activeOverhang: -9,
          containerClass: "p-1 h-[56px] bg-white/75 dark:bg-[#18181c]/80 backdrop-blur-[24px] saturate-[190%] border border-black/[0.08] dark:border-white/[0.14]",
          itemClass: "h-full px-1 text-[11px]",
          iconClass: "w-[19px] h-[19px]",
          elevationScale: 1.03,
          elevationY: -3,
          restingShadow: "shadow-[0_1px_3px_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.7)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.12)]",
          dragShadow: "shadow-[0_24px_54px_-8px_rgba(0,0,0,0.20),0_10px_24px_-4px_rgba(0,0,0,0.12),inset_0_1.5px_1.5px_rgba(255,255,255,0.98)] dark:shadow-[0_32px_68px_-8px_rgba(0,0,0,0.90),0_12px_32px_rgba(0,0,0,0.75),inset_0_1.5px_1.5px_rgba(255,255,255,0.24)] border-black/[0.12] dark:border-white/[0.22]",
        };
      case "md":
        return {
          restingInset: 1,
          activeOverhang: -8,
          containerClass: "p-1 h-[40px] bg-black/[0.04] dark:bg-white/[0.06] backdrop-blur-[24px] saturate-[180%] border border-black/[0.06] dark:border-white/[0.10]",
          itemClass: "h-full px-3.5 text-[12.5px]",
          iconClass: "w-3.5 h-3.5",
          elevationScale: 1.025,
          elevationY: -2.5,
          restingShadow: "shadow-2xs",
          dragShadow: "shadow-md border-black/[0.10] dark:border-white/[0.16]",
        };
      case "sm":
      default:
        return {
          restingInset: 1,
          activeOverhang: -7.5,
          containerClass: "p-1 h-[36px] bg-black/[0.04] dark:bg-white/[0.06] backdrop-blur-[24px] saturate-[180%] border border-black/[0.06] dark:border-white/[0.10]",
          itemClass: "h-full px-3 text-xs",
          iconClass: "w-3.5 h-3.5",
          elevationScale: 1.02,
          elevationY: -2,
          restingShadow: "shadow-2xs",
          dragShadow: "shadow-md border-black/[0.10] dark:border-white/[0.16]",
        };
    }
  }, [size]);

  // Spring physics for water droplet: uses shared LIQUID_SPRING for 100% harmonized synchronization
  const rawPillX = useMotionValue(0);
  const springPillX = useSpring(rawPillX, {
    stiffness: LIQUID_SPRING.stiffness,
    damping: LIQUID_SPRING.damping,
    mass: LIQUID_SPRING.mass,
  });

  const scaleX = useMotionValue(1);
  const scaleY = useMotionValue(1);

  // Measure track width and bounds inside inner container
  const getMetrics = React.useCallback(() => {
    if (!innerRef.current) {
      return { tabWidth: 0, maxTargetX: 0, scaleFactor: 1, innerLeft: 0, innerWidth: 0 };
    }
    const rect = innerRef.current.getBoundingClientRect();
    const innerWidth = innerRef.current.offsetWidth || rect.width;
    const scaleFactor = innerWidth > 0 && rect.width > 0 ? rect.width / innerWidth : 1;
    const tabWidth = items.length > 0 ? innerWidth / items.length : 0;
    const maxTargetX = Math.max(0, innerWidth - tabWidth);
    return { tabWidth, maxTargetX, scaleFactor, innerLeft: rect.left, innerWidth };
  }, [items.length]);

  // Continuous iOS-style optical lens clipping mask:
  // Dynamically expands during active state, strictly bounded when resting
  const clipPath = useTransform(
    [springPillX, scaleX],
    ([latestX, latestScaleX]: number[]) => {
      const w = innerRef.current?.offsetWidth || 300;
      const tabWidth = items.length > 0 ? w / items.length : 0;
      const center = (latestX ?? 0) + tabWidth / 2;
      const currentWidth = tabWidth * (latestScaleX ?? 1);
      const left = Math.max(0, center - currentWidth / 2);
      const right = Math.max(0, w - (center + currentWidth / 2));
      const vert = isActive ? "-16px" : "-2px";

      return `inset(${vert} ${right.toFixed(2)}px ${vert} ${left.toFixed(2)}px round 9999px)`;
    }
  );

  // Snap pill to a specific index with optional liquid wobble (harmonized with LIQUID_SPRING)
  const snapToIndex = React.useCallback(
    (index: number, wobble = true) => {
      const { tabWidth } = getMetrics();
      if (tabWidth <= 0) return;

      const targetX = index * tabWidth;
      rawPillX.set(targetX);

      if (wobble && pillRef.current) {
        animate(scaleX, [1.05, 0.98, 1], {
          duration: 0.28,
          ease: "easeOut",
        });
        animate(scaleY, [0.95, 1.02, 1], {
          duration: 0.28,
          ease: "easeOut",
        });
      } else {
        scaleX.set(1);
        scaleY.set(1);
      }
    },
    [getMetrics, rawPillX, scaleX, scaleY]
  );

  // Instant placement on mount
  React.useEffect(() => {
    const { tabWidth } = getMetrics();
    if (tabWidth > 0 && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      const initialX = currentActiveIndex * tabWidth;
      rawPillX.set(initialX);
      springPillX.jump(initialX);
    }
  }, [getMetrics, currentActiveIndex, rawPillX, springPillX]);

  // Sync with prop changes when not dragging
  React.useEffect(() => {
    if (!isDraggingRef.current && hasInitializedRef.current) {
      snapToIndex(currentActiveIndex, true);
    }
  }, [currentActiveIndex, snapToIndex]);

  // ResizeObserver: auto-reposition accurately whenever width changes
  React.useEffect(() => {
    if (!innerRef.current) return;
    const observer = new ResizeObserver(() => {
      if (!isDraggingRef.current) {
        snapToIndex(currentActiveIndex, false);
      }
    });
    observer.observe(innerRef.current);
    return () => observer.disconnect();
  }, [currentActiveIndex, snapToIndex]);

  // Calculates pill X position such that pointer is at the exact center of the droplet,
  // with rubber-band resistance curve when exceeding bounds
  const getPillXFromPointer = React.useCallback(
    (pointerX: number, tabWidth: number, maxTargetX: number) => {
      // Center of water droplet is always at pointerX!
      let targetX = pointerX - tabWidth / 2;

      if (targetX < 0) {
        const over = -targetX;
        targetX = -(MAX_OVERDRAG * Math.tanh(over / 40));
      } else if (targetX > maxTargetX) {
        const over = targetX - maxTargetX;
        targetX = maxTargetX + (MAX_OVERDRAG * Math.tanh(over / 40));
      }
      return targetX;
    },
    []
  );

  // Pointer down (start tracking, directly center droplet at pointer position)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;

    const { tabWidth, maxTargetX, scaleFactor, innerLeft } = getMetrics();
    if (tabWidth <= 0 || !innerRef.current) return;

    const mouseX = (e.clientX - innerLeft) / scaleFactor;
    // The finger/mouse is always the exact center of the water droplet!
    const targetX = getPillXFromPointer(mouseX, tabWidth, maxTargetX);
    const hoveredIndex = Math.max(0, Math.min(items.length - 1, Math.floor(mouseX / tabWidth)));

    isDraggingRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.clientX;
    startMouseXRef.current = mouseX;
    lastXRef.current = e.clientX;
    clickTargetIndexRef.current = hoveredIndex;
    lastTimeRef.current = performance.now();
    velocityRef.current = 0;

    // 1. Immediately activate pressed state (swells outward taller than bar even without moving!)
    setIsPressed(true);
    setIsDragging(false);

    // 2. Animate liquid movement: smoothly rush from current position to pointer position with liquid stretch!
    const currentPillX = springPillX.get();
    const travelDistance = Math.abs(targetX - currentPillX);
    if (travelDistance > 8) {
      animate(scaleX, [1, 1.15, 0.95, 1], { duration: 0.32, ease: "easeOut" });
      animate(scaleY, [1, 0.88, 1.04, 1], { duration: 0.32, ease: "easeOut" });
    }

    // Spring naturally from current position to click position (fluid movement animation):
    rawPillX.set(targetX);
    setOptimisticIndex(hoveredIndex);

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };

  // Pointer move:
  // 1:1 direct tracking with fluid physics: finger/mouse position is ALWAYS the center of the water droplet!
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;

    const { tabWidth, maxTargetX, scaleFactor, innerLeft } = getMetrics();
    if (!innerRef.current || tabWidth <= 0) return;

    const rawDx = e.clientX - startXRef.current;
    if (!hasMovedRef.current && Math.abs(rawDx) > 2) {
      hasMovedRef.current = true;
      setIsDragging(true);
    }

    const currentX = e.clientX;
    const now = performance.now();
    const dt = Math.max(1, now - lastTimeRef.current);
    const dxFromLast = (currentX - lastXRef.current) / scaleFactor;
    velocityRef.current = dxFromLast / dt;
    lastXRef.current = currentX;
    lastTimeRef.current = now;

    const currentMouseX = (e.clientX - innerLeft) / scaleFactor;
    // Water droplet center strictly locked to mouse position:
    const targetX = getPillXFromPointer(currentMouseX, tabWidth, maxTargetX);

    // Direct hardware update: buttery smooth spring tracking without teleports!
    rawPillX.set(targetX);

    // Liquid organic stretch & squash based on velocity
    const speed = Math.abs(velocityRef.current);
    const stretch = Math.min(0.12, speed * 0.04);
    scaleX.set(1 + stretch * 1.25);
    scaleY.set(Math.max(0.90, 1 - stretch * 0.45));
  };

  // Pointer up (release drag or tap: snap to nearest tab)
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const wasDragging = hasMovedRef.current;
    isDraggingRef.current = false;
    setIsPressed(false);
    setIsDragging(false);

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    const { tabWidth } = getMetrics();
    if (tabWidth <= 0) return;

    const currentPillX = rawPillX.get();
    const dropletCenterX = currentPillX + tabWidth / 2;
    const safeVelocity = Number.isFinite(velocityRef.current) ? velocityRef.current : 0;
    const projectedCenterX = dropletCenterX + safeVelocity * 45;
    const rawIndex = Math.floor(projectedCenterX / tabWidth);
    const clampedIndex = Math.max(
      0,
      Math.min(items.length - 1, Number.isFinite(rawIndex) ? rawIndex : 0)
    );

    const finalIndex = wasDragging
      ? clampedIndex
      : (clickTargetIndexRef.current ?? clampedIndex);

    const targetItem = items[finalIndex];
    if (targetItem) {
      if (!isControlled) {
        setInternalValue(targetItem.id);
      }
      setOptimisticIndex(finalIndex);
      snapToIndex(finalIndex, wasDragging);

      if (targetItem.onClick) {
        targetItem.onClick();
      }

      if (onChange) {
        onChange(targetItem.id);
      }

      if (isRouteNav && targetItem.href) {
        router.push(targetItem.href);
      }
    }
  };

  // Pointer cancel
  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsPressed(false);
    setIsDragging(false);

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    snapToIndex(currentActiveIndex, true);
  };

  // Tab click handler (for keyboard accessibility)
  const handleTabClick = (e: React.MouseEvent, index: number, item: AppleLiquidTabItem<T>) => {
    e.preventDefault();
    if (e.detail === 0) {
      if (!isControlled) {
        setInternalValue(item.id);
      }
      setOptimisticIndex(index);
      snapToIndex(index, false);

      if (item.onClick) {
        item.onClick();
      }

      if (onChange) {
        onChange(item.id);
      }
      if (isRouteNav && item.href) {
        router.push(item.href);
      }
    }
  };

  if (items.length === 0) return null;

  return (
    <>
      {/* Segmented Island Runner Dock Container */}
      <motion.div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerLeave={() => {
          setIsPressed(false);
        }}
        onDragStart={(e) => e.preventDefault()}
        animate={{
          scale: elevateOnDrag && isActive ? config.elevationScale : 1,
          y: elevateOnDrag && isActive ? config.elevationY : 0,
        }}
        transition={LIQUID_SPRING}
        style={{ transformOrigin: "center center" }}
        className={cn(
          "relative rounded-full select-none will-change-transform touch-none border overflow-visible transition-[box-shadow,border-color] duration-200",
          config.containerClass,
          elevateOnDrag && isActive
            ? cn("cursor-grabbing", config.dragShadow)
            : cn(isActive ? "cursor-grabbing" : "cursor-pointer", config.restingShadow),
          className
        )}
      >
        {/* Prismatic Top Rim Highlight Line (Edge Refraction Crest, z-[1] so pill floats above it) */}
        <div className="absolute top-0 left-3 right-3 h-[1.5px] bg-gradient-to-r from-transparent via-white dark:via-white/70 to-transparent pointer-events-none z-[1]" />

        {/* Prismatic Bottom Rim Highlight Line (Bottom Caustic Bounce, z-[1]) */}
        <div className="absolute bottom-0 left-5 right-5 h-[1px] bg-gradient-to-r from-transparent via-white/60 dark:via-white/25 to-transparent pointer-events-none z-[1]" />

        {/* Inner Track Wrapper: shares 100% identical bounding geometry */}
        <div ref={innerRef} className="relative w-full h-full overflow-visible">
          {/* Liquid Water Droplet Active Indicator Pill:
              Non-active (resting): neatly nested, slightly taller with crisp 1px-1.5px inset.
              Active (click, press, hover, drag): swells visibly taller than the bar without clipping! */}
          <motion.div
            ref={pillRef}
            className="absolute rounded-full pointer-events-none z-[15]"
            initial={false}
            animate={{
              top: isActive ? config.activeOverhang : config.restingInset,
              bottom: isActive ? config.activeOverhang : config.restingInset,
            }}
            transition={LIQUID_SPRING}
            style={{
              width: `${100 / items.length}%`,
              left: 0,
              x: springPillX,
              scaleX,
              scaleY,
              transformOrigin: "center center",
            }}
          >
            {/* Optical Curved Light Ray Meniscus Rim:
                Subtle when resting, bright & glowing when active */}
            <div
              className={cn(
                "absolute -inset-[1px] rounded-full pointer-events-none transition-opacity duration-200",
                isActive ? "opacity-90 dark:opacity-85" : "opacity-35 dark:opacity-25"
              )}
              style={{
                background:
                  "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.45) 24%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0.35) 76%, rgba(255, 255, 255, 0.90) 100%)",
                mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                maskComposite: "exclude",
                WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                padding: "1.2px",
              }}
            />

            {/* Droplet Body:
                Resting: Flatter, refined glass pill, not overly bright/translucent.
                Active: High-transparency 3D water droplet exceeding bar height. */}
            <div
              className={cn(
                "relative w-full h-full rounded-full overflow-hidden transition-all duration-200",
                isActive
                  ? "bg-white/[0.20] dark:bg-white/[0.05] backdrop-blur-[2px] border border-black/[0.08] dark:border-white/[0.20] shadow-[0_16px_36px_-4px_rgba(0,0,0,0.18),0_4px_12px_rgba(0,0,0,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.95),inset_0_-1px_1.5px_rgba(255,255,255,0.35)] dark:shadow-[0_22px_48px_-4px_rgba(0,0,0,0.92),0_8px_20px_rgba(0,0,0,0.72),inset_0_1.5px_2px_rgba(255,255,255,0.40),inset_0_-1px_1px_rgba(255,255,255,0.12)]"
                  : "bg-white/80 dark:bg-white/[0.08] backdrop-blur-[12px] border border-black/[0.04] dark:border-white/[0.10] shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.8)] dark:shadow-[0_2px_6px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.12)]"
              )}
            >
              {/* Curved Top Specular Arc */}
              <div
                className={cn(
                  "absolute inset-x-2 top-0.5 h-[45%] rounded-t-full bg-gradient-to-b from-white/70 via-white/10 to-transparent pointer-events-none dark:from-white/30 dark:via-transparent transition-opacity duration-200",
                  isActive ? "opacity-100" : "opacity-30"
                )}
              />

              {/* Crisp Top Specular Crest Line */}
              <div
                className={cn(
                  "absolute top-[1px] inset-x-3.5 h-[1px] bg-gradient-to-r from-transparent via-white/90 dark:via-white/60 to-transparent pointer-events-none transition-opacity duration-200",
                  isActive ? "opacity-100" : "opacity-25"
                )}
              />

              {/* Bottom Caustic Reflection Arc */}
              <div
                className={cn(
                  "absolute bottom-0 inset-x-2.5 h-[32%] rounded-b-full bg-gradient-to-t from-white/40 via-transparent to-transparent pointer-events-none dark:from-white/15 transition-opacity duration-200",
                  isActive ? "opacity-100" : "opacity-20"
                )}
              />

              {/* Crisp Bottom Rim Line */}
              <div
                className={cn(
                  "absolute bottom-[1px] inset-x-4 h-[1px] bg-gradient-to-r from-transparent via-white/60 dark:via-white/30 to-transparent pointer-events-none transition-opacity duration-200",
                  isActive ? "opacity-100" : "opacity-20"
                )}
              />
            </div>
          </motion.div>

          {/* Layer 1: Base Inactive Items Grid (Always unselected neutral text, handles interactions) */}
          <div
            className="relative z-[20] grid w-full h-full items-center select-none"
            style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
          >
            {items.map((item, index) => {
              const Icon = item.icon;
              const content = (
                <div
                  className={cn(
                    "flex items-center justify-center transition-colors select-none font-medium text-muted-foreground hover:text-foreground",
                    orientation === "vertical" ? "flex-col justify-center gap-0.5 py-0" : "flex-row gap-1.5",
                    config.itemClass,
                    tabClassName
                  )}
                >
                  {Icon && (
                    <Icon className={cn(config.iconClass, "transition-transform shrink-0 stroke-[1.8] opacity-80")} />
                  )}
                  <span className="truncate whitespace-nowrap">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-mono opacity-80 shrink-0">{item.badge}</span>
                  )}
                </div>
              );

              if (isRouteNav && item.href) {
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                    onClick={(e) => handleTabClick(e, index, item)}
                    className="flex items-center justify-center w-full h-full rounded-full cursor-pointer select-none"
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <button
                  key={item.id}
                  type="button"
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                  onClick={(e) => handleTabClick(e, index, item)}
                  className="flex items-center justify-center w-full h-full rounded-full cursor-pointer select-none"
                >
                  {content}
                </button>
              );
            })}
          </div>

          {/* Layer 2: Active Masked Reveal Grid (iOS-style dual-layer clipping mask:
              Only reveals vibrant blue text/icons where the water droplet lens physically covers.
              Zero background, zero border, zero padding offset - 100% identical geometry to Layer 1) */}
          <motion.div
            className="absolute inset-0 z-[25] pointer-events-none select-none overflow-visible"
            style={{
              clipPath,
              WebkitClipPath: clipPath,
            }}
            aria-hidden="true"
          >
            <div
              className="grid w-full h-full items-center select-none"
              style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
            >
              {items.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-center w-full h-full rounded-full select-none"
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center font-medium select-none",
                        activeColor,
                        orientation === "vertical" ? "flex-col justify-center gap-0.5 py-0" : "flex-row gap-1.5",
                        config.itemClass,
                        tabClassName
                      )}
                    >
                      {Icon && (
                        <Icon
                          className={cn(
                            config.iconClass,
                            "shrink-0 stroke-[2.0]",
                            "drop-shadow-[0_1px_4px_rgba(0,113,227,0.35)] dark:drop-shadow-[0_1px_6px_rgba(41,151,255,0.50)]"
                          )}
                        />
                      )}
                      <span className="truncate whitespace-nowrap drop-shadow-[0_1px_4px_rgba(0,113,227,0.25)] dark:drop-shadow-[0_1px_4px_rgba(41,151,255,0.35)]">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="text-[10px] font-mono shrink-0 opacity-95">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
