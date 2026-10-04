"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useSpring, useTransform, animate, type MotionValue } from "motion/react";
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
  variant?: "default" | "dock";
}

/**
 * 拖拽到达底栏两端时的最大橡皮筋阻尼溢出距离（像素）。
 * 采用双曲正切函数 Math.tanh(over / 40) 模拟物理弹簧弹性形变，手感类似 iOS 系统级阻尼。
 */
const MAX_OVERDRAG = 24;

/**
 * 统一液态玻璃弹簧物理参数 (Unified Liquid Spring Physics)
 * -------------------------------------------------------------------------
 * 关键设计原则：
 * 所有参与水珠交互的属性（水珠 X 轴位移、水平拉伸 scaleX/scaleY、垂直膨胀 overhang、
 * 底栏整体浮起高度 y、以及顶层文字放大 scale）必须严格共享这组物理曲线！
 *
 * 这样可以杜绝“水珠已经停下了，文字还在继续放大”或“水珠还没缩回，文字先变小了”的脱节异步感，
 * 带来真正如同整块水滴凝胶在物理世界中受力受阻的 60fps 丝滑有机生命力 (Organic Buttery Feel)。
 *
 * - stiffness (刚度 440): 响应迅捷，跟随手指无粘滞感
 * - damping (阻尼 28): 临界阻尼附近略带微小回弹，呈现液体微波果冻感
 * - mass (质量 0.6): 赋予水珠适度的物理惯性
 */
const LIQUID_SPRING = {
  type: "spring" as const,
  stiffness: 440,
  damping: 28,
  mass: 0.6,
};

/**
 * =========================================================================================
 * 🌊 AppleLiquidTabs (iOS 27 真实高透液态玻璃水珠光学透镜导航栏)
 * =========================================================================================
 *
 * 📖【架构设计原理与心智模型】
 * -----------------------------------------------------------------------------------------
 * 1. 传统分段控制器 (UISegmentedControl) 的失效：
 *    - 传统 Tab 的高亮滑块是「实心不透明白色」，滑块盖在底层文字上方，物理上遮蔽了底层灰色字。
 *    - 当用户要求「iOS 27 高透水珠（透明度 80%，带毛玻璃与高光）」时，滑块变得通透，底层灰色字
 *      直接穿透显露。如果顶层高亮字被透镜放大 (1.25x)，就会看到「底层灰色小字套在顶层蓝色大字底下」
 *      的重叠重影灾难。
 *
 * 2. 为什么不能用透明度渐变 (Fade Out)？
 *    - 真正的光学透镜（放大镜）并不是“物体自己提前感知到透镜要来，然后慢慢渐变膨胀变透明”；
 *    - 而是“在透镜边缘这一刀切开，透镜外面是正常大小，进入透镜瞬间折射放大”。
 *    - 用透明度渐变会导致“离中心稍远时依然残留灰色”以及“字体像气球一样缓慢渐变变大”的迟钝感。
 *
 * 3. 终极解法：双层互斥空间拼图 (Dual-Layer Complementary Spatial Masking)
 *    我们在渲染树中构建了两个空间互斥、几何完全互补的图层：
 *
 *    ┌────────────────────────────────────────────────────────────────────────┐
 *    │ 【Layer 1: 底层灰色常态层】(Z-20)                                      │
 *    │  • 承载内容：整条导航栏所有 Tab 的灰色文字与图标 (标准尺寸 scale 1.0)   │
 *    │  • 裁切算法：clipPathInactive (利用 CSS polygon(evenodd, ...) 奇偶打孔) │
 *    │  • 几何表现：外圈 100% 完整显示，唯独在水珠覆盖的 [left, right] 这一段     │
 *    │              被物理掏出一个 100% 透明的空洞！底层灰色字在此处 0% 存在！│
 *    ├────────────────────────────────────────────────────────────────────────┤
 *    │ 【Layer 2: 顶层蓝色透镜层】(Z-25)                                      │
 *    │  • 承载内容：整条导航栏所有 Tab 的蓝色文字与发光阴影                   │
 *    │  • 裁切算法：clipPathActive (利用 CSS inset(... round 9999px) 水珠胶囊)│
 *    │  • 几何表现：整屏裁切隐藏，唯独在水珠透镜覆盖的 [left, right] 窗口内显现│
 *    │  • 尺寸动画：普通静止态为 1.0x（不放大），触摸/拖拽时弹性拉大到 1.25x   │
 *    ├────────────────────────────────────────────────────────────────────────┤
 *    │ 【中间水珠物理实体】(Z-15)                                            │
 *    │  • 位于两者之间/衬底，提供高透毛玻璃 (backdrop-blur-[2px])、3D 表面高光、│
 *    │    底部焦散光晕、以及边缘物理色散折射滤光圈 (Chromatic Dispersion)。   │
 *    └────────────────────────────────────────────────────────────────────────┘
 *
 * 4. 数学公式保证：
 *    Layer 1 (全景 minus 透镜) + Layer 2 (透镜) ≡ 完整导航栏
 *    两者在像素空间上严格互斥、零重叠、零间隙，完全杜绝重影，达到真·光学放大镜质感！
 * =========================================================================================
 */
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
  variant,
}: AppleLiquidTabsProps<T>) {
  const router = useRouter();

  // ---------------------------------------------------------------------------------------
  // 1. 状态管理：同时支持受控模式 (Controlled) 与非受控模式 (Uncontrolled)
  // ---------------------------------------------------------------------------------------
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState<T>(
    value ?? defaultValue ?? items[0]?.id
  );

  const activeId = isControlled ? (value as T) : internalValue;
  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.id === activeId)
  );

  // 乐观索引 (optimisticIndex)：
  // 手势拖拽或触摸点击时，即使父级路由尚未完成异步页面跳转，UI 水珠也立即先吸附到手势目标 Tab。
  // 彻底消除网络或路由延迟带来的视觉卡顿感，实现 0ms 原生触控响应。
  const [optimisticIndex, setOptimisticIndex] = React.useState<number | null>(null);

  // 手势交互状态机：
  // - isDragging: 触摸或鼠标按下并在水平轴上位移超过 2px，进入持续拖拽跟随模式
  // - isPressed:  按下的瞬间立即为 true（即使尚未移动），用于触发水珠膨胀与文字放大
  const [isDragging, setIsDragging] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);

  // 当外部通过 props 改变 value（例如浏览器前进/后退、父组件重置状态）时，同步重置乐观索引
  React.useEffect(() => {
    setOptimisticIndex(null);
  }, [value]);

  // 后台预加载路由 (Next.js Link Prefetching)：
  // 若作为底层路由导航栏 (isRouteNav=true)，后台静默预取所有页面，实现 Native App 般零秒秒开体验。
  React.useEffect(() => {
    if (isRouteNav) {
      items.forEach((item) => {
        if (item.href) {
          try {
            router.prefetch(item.href);
          } catch {}
        }
      });
    }
  }, [isRouteNav, items, router]);

  // ---------------------------------------------------------------------------------------
  // ⚡ 核心交互状态 (isActive):
  // ---------------------------------------------------------------------------------------
  // 只要处于触摸按下 (isPressed) 或拖拽中 (isDragging) 任意一种状态，即视为活跃交互态：
  // 1. 水珠物理实体向上和向下膨胀溢出底栏 (activeOverhang)
  // 2. 顶层蓝色高亮文字被透镜光学放大至 1.25x (scale: 1.25, y: -2px)
  // 3. 一旦松手释放，所有属性在 LIQUID_SPRING 的同一曲线驱动下毫秒级平滑同步回归常态！
  const isActive = isPressed || isDragging;

  const currentActiveIndex = optimisticIndex ?? activeIndex;

  // ---------------------------------------------------------------------------------------
  // 🎯 DOM 节点与手势物理跟踪引用 (Refs)
  // ---------------------------------------------------------------------------------------
  const containerRef = React.useRef<HTMLDivElement>(null); // 最外层 Dock 容器
  const innerRef = React.useRef<HTMLDivElement>(null);     // 承载水珠与双层文字的绝对参考轨道
  const pillRef = React.useRef<HTMLDivElement>(null);      // 水珠物理 DOM 实体
  const isDraggingRef = React.useRef(false);               // 是否正在拖拽中的同步标志
  const hasMovedRef = React.useRef(false);                 // 是否发生过有效位移（区分点击与拖动）
  const startXRef = React.useRef(0);                       // 触摸按下时的 clientX 绝对坐标
  const startMouseXRef = React.useRef(0);                  // 触摸按下时相对容器内的局部 X 坐标
  const startPillXRef = React.useRef(0);                   // 按下时刻水珠所处的 X 坐标
  const lastXRef = React.useRef(0);                        // 上一帧的 clientX（用于计算瞬间移动速度）
  const lastTimeRef = React.useRef(0);                     // 上一帧时间戳（performance.now()）
  const velocityRef = React.useRef(0);                     // 瞬时滑动速度 (px/ms)，用于松手惯性甩动飞跃
  const clickTargetIndexRef = React.useRef<number | null>(null); // 按下时命中的 Tab 索引
  const hasInitializedRef = React.useRef(false);           // 是否已完成首次挂载绝对布局定位

  // ---------------------------------------------------------------------------------------
  // 📏 尺寸与样式规格配置 (Sizing Configurations)
  // ---------------------------------------------------------------------------------------
  // 核心视觉分工判定：
  // - 仅底部导航栏 (手机 bottom nav, 即 variant === "dock" 或默认 size === "lg"):
  //   底栏本身为白底 (bg-white/75)，未激活态水珠采用浅烟熏微灰立体渐变 (from-black/5 to-black/8.5)，清晰辨识！
  // - 其他常规 Tab (顶部 Header、Dashboard、Shop 页面，size 为 sm 或 md):
  //   底栏背景自带灰色轨道 (bg-black/[0.04])，未激活态水珠保持原有纯白磨砂质感 (bg-white/80)，黑白对比分明。
  const isDock = variant === "dock" || (variant === undefined && size === "lg");

  const config = React.useMemo(() => {
    // 手机底部 Nav 专用的浅色微灰立体微渐变水珠样式
    const dockDropletClass =
      "bg-gradient-to-b from-black/[0.05] via-black/[0.065] to-black/[0.085] dark:from-white/[0.10] dark:via-white/[0.08] dark:to-white/[0.06] backdrop-blur-[12px] border border-black/[0.08] dark:border-white/[0.12] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.7)] dark:shadow-[0_2px_6px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.12)]";

    // 常规 Tab (Header / Dashboard / Shop) 保持原有纯白磨砂水珠样式
    const standardDropletClass =
      "bg-white/80 dark:bg-white/[0.08] backdrop-blur-[12px] border border-black/[0.04] dark:border-white/[0.10] shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.8)] dark:shadow-[0_2px_6px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.12)]";

    switch (size) {
      case "lg":
        return {
          restingInset: -1.5,
          activeOverhang: -9,
          containerClass: "p-1 h-[56px] bg-white/75 dark:bg-[#18181c]/80 backdrop-blur-[24px] saturate-[190%] border border-black/[0.08] dark:border-white/[0.14]",
          itemClass: "h-full px-1 text-[11px]",
          iconClass: "w-[19px] h-[19px]",
          elevationScale: 1.03,
          elevationY: -3,
          restingShadow: "shadow-[0_1px_3px_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.7)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.12)]",
          dragShadow: "shadow-[0_24px_54px_-8px_rgba(0,0,0,0.20),0_10px_24px_-4px_rgba(0,0,0,0.12),inset_0_1.5px_1.5px_rgba(255,255,255,0.98)] dark:shadow-[0_32px_68px_-8px_rgba(0,0,0,0.90),0_12px_32px_rgba(0,0,0,0.75),inset_0_1.5px_1.5px_rgba(255,255,255,0.24)] border-black/[0.12] dark:border-white/[0.22]",
          restingDropletClass: isDock ? dockDropletClass : standardDropletClass,
          restingSpecularClass: isDock ? "opacity-40" : "opacity-30",
          restingCausticClass: isDock ? "opacity-30" : "opacity-20",
        };
      case "md":
        return {
          restingInset: -1.5,
          activeOverhang: -8,
          containerClass: "p-1 h-[40px] bg-black/[0.04] dark:bg-white/[0.06] backdrop-blur-[24px] saturate-[180%] border border-black/[0.06] dark:border-white/[0.10]",
          itemClass: "h-full px-3.5 text-[12.5px]",
          iconClass: "w-3.5 h-3.5",
          elevationScale: 1.025,
          elevationY: -2.5,
          restingShadow: "shadow-2xs",
          dragShadow: "shadow-md border-black/[0.10] dark:border-white/[0.16]",
          restingDropletClass: isDock ? dockDropletClass : standardDropletClass,
          restingSpecularClass: isDock ? "opacity-40" : "opacity-30",
          restingCausticClass: isDock ? "opacity-30" : "opacity-20",
        };
      case "sm":
      default:
        return {
          restingInset: -1.5,
          activeOverhang: -7.5,
          containerClass: "p-1 h-[36px] bg-black/[0.04] dark:bg-white/[0.06] backdrop-blur-[24px] saturate-[180%] border border-black/[0.06] dark:border-white/[0.10]",
          itemClass: "h-full px-3 text-xs",
          iconClass: "w-3.5 h-3.5",
          elevationScale: 1.02,
          elevationY: -2,
          restingShadow: "shadow-2xs",
          dragShadow: "shadow-md border-black/[0.10] dark:border-white/[0.16]",
          restingDropletClass: isDock ? dockDropletClass : standardDropletClass,
          restingSpecularClass: isDock ? "opacity-40" : "opacity-30",
          restingCausticClass: isDock ? "opacity-30" : "opacity-20",
        };
    }
  }, [size, isDock]);

  // ---------------------------------------------------------------------------------------
  // 🎢 物理运动变量 (Motion Values & Springs)
  // ---------------------------------------------------------------------------------------
  // rawPillX: 水珠的目标 X 像素坐标（由指针或 snapToIndex 瞬时写入）
  // springPillX: 经过 LIQUID_SPRING 物理平滑滤波后的实时渲染 X 坐标（驱动水珠与裁剪层）
  const rawPillX = useMotionValue(0);
  const springPillX = useSpring(rawPillX, {
    stiffness: LIQUID_SPRING.stiffness,
    damping: LIQUID_SPRING.damping,
    mass: LIQUID_SPRING.mass,
  });

  // 水滴有机挤压与拉伸比例 (Squash & Stretch)：
  // 随移动速度动态改变 scaleX (沿运动方向拉伸) 和 scaleY (垂直压缩)
  const scaleX = useMotionValue(1);
  const scaleY = useMotionValue(1);

  // ---------------------------------------------------------------------------------------
  // 📐 轨道几何尺寸测量 (getMetrics)
  // ---------------------------------------------------------------------------------------
  // 消除父级 CSS transform（如 scale 缩放）、高分屏 Retina DPI 渲染偏差：
  // 利用 rect.width / innerWidth 计算出真实的缩放比例 scaleFactor，
  // 保证光标在任何缩放环境下都能 100% 精确居中对齐水珠！
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

  const [isMounted, setIsMounted] = React.useState(false);
  const prevActiveIndexRef = React.useRef(currentActiveIndex);

  // =======================================================================================
  // 🔍【裁剪层 1】clipPathActive: 顶层蓝色文字的显露窗口（正向裁剪）
  // =======================================================================================
  // 作用：只让水珠透镜「内部」的这块圆角矩形区域显现出来，水珠外部的所有区域 100% 裁剪隐藏。
  // 语法：CSS inset(top right bottom left round rx)
  //  - top / bottom: vert (激活态为 -16px 允许膨胀高光溢出，普通态为 -6px 完美容纳加高的静止态水珠)
  //  - left / right: 根据物理弹簧 springPillX 与 scaleX 动态算出的水珠左右像素边界
  //  - round 9999px: 保证裁剪窗口呈现完美的胶囊圆角
  // 容错：在 SSR / 组件未挂载测量之前，使用百分比兜底，彻底消除水珠初始化时的位置跳动闪烁。
  const clipPathActive = useTransform(
    [springPillX, scaleX],
    ([latestX, latestScaleX]: number[]) => {
      const leftP = (currentActiveIndex * 100) / items.length;
      const rightP = ((items.length - 1 - currentActiveIndex) * 100) / items.length;
      const vert = isActive ? "-16px" : "-6px";

      if (!isMounted || !innerRef.current) {
        return `inset(${vert} ${rightP.toFixed(2)}% ${vert} ${leftP.toFixed(2)}% round 9999px)`;
      }

      const w = innerRef.current.offsetWidth;
      if (w <= 0) {
        return `inset(${vert} ${rightP.toFixed(2)}% ${vert} ${leftP.toFixed(2)}% round 9999px)`;
      }

      const tabWidth = items.length > 0 ? w / items.length : 0;
      const center = (latestX ?? 0) + tabWidth / 2;
      const currentWidth = tabWidth * (latestScaleX ?? 1);
      const left = Math.max(0, center - currentWidth / 2);
      const right = Math.min(w, center + currentWidth / 2);

      return `inset(${vert} ${(w - right).toFixed(2)}px ${vert} ${left.toFixed(2)}px round 9999px)`;
    }
  );

  // =======================================================================================
  // 🕳️【裁剪层 2】clipPathInactive: 底层灰色文字的反向挖空多边形（甚至被称为 Donut Hole）
  // =======================================================================================
  // 作用：让底层灰色文字在水珠「外部」正常显示，唯独在水珠透镜的 [left, right] 区域挖出一个透明空洞！
  // 为什么普通的 CSS 无法反向挖洞？
  //  - CSS clip-path 默认只有 inset()、circle()，它们是正向保留图形，无法做“差集挖孔”。
  //  - 若使用 CSS mask 配合 -webkit-mask-composite，移动端（iOS Safari）会触发惨烈的重绘卡顿。
  //
  // 核心数学：利用 W3C 标准的 polygon(evenodd, ...) 奇偶环绕填充规则（若尔当曲线定理）：
  //  - 想象一根画笔在画布上全程不抬笔，一口气画出 10 个坐标点：
  //    1.【外圈 5 个点】：顺时针画满整个底栏 (0% 0% -> 100% 0% -> 100% 100% -> 0% 100% -> 0% 0%)
  //    2.【内圈 5 个点】：从起点不抬笔直接切入水珠当前位置 (left 0% -> left 100% -> right 100% -> right 0% -> left 0%)
  //
  // 显卡（GPU）射线判定（Ray Casting）：
  //  - 任意像素点朝外发射射线：
  //    • 水珠外部的文字：射线只穿过 1 条外框边线（奇数 1） => 【填充可见，渲染灰色文字】
  //    • 水珠内部的文字：射线穿过内框边线 + 外框边线（偶数 2）=> 【判定为洞，100% 物理掏空剔除】
  //
  // 收益：零性能损耗（GPU 纯硬件光栅化），每一帧随弹簧移动，水珠下绝无半点灰色残影！
  const clipPathInactive = useTransform(
    [springPillX, scaleX],
    ([latestX, latestScaleX]: number[]) => {
      const leftP = (currentActiveIndex * 100) / items.length;
      const rightP = ((items.length - 1 - currentActiveIndex) * 100) / items.length;
      const rightSideP = 100 - rightP;

      if (!isMounted || !innerRef.current) {
        return `polygon(evenodd, 0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, ${leftP.toFixed(2)}% 0%, ${leftP.toFixed(2)}% 100%, ${rightSideP.toFixed(2)}% 100%, ${rightSideP.toFixed(2)}% 0%, ${leftP.toFixed(2)}% 0%)`;
      }

      const w = innerRef.current.offsetWidth;
      if (w <= 0) {
        return `polygon(evenodd, 0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, ${leftP.toFixed(2)}% 0%, ${leftP.toFixed(2)}% 100%, ${rightSideP.toFixed(2)}% 100%, ${rightSideP.toFixed(2)}% 0%, ${leftP.toFixed(2)}% 0%)`;
      }

      const tabWidth = items.length > 0 ? w / items.length : 0;
      const center = (latestX ?? 0) + tabWidth / 2;
      const currentWidth = tabWidth * (latestScaleX ?? 1);
      const left = Math.max(0, center - currentWidth / 2);
      const right = Math.min(w, center + currentWidth / 2);

      return `polygon(evenodd, 0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, ${left.toFixed(2)}px 0%, ${left.toFixed(2)}px 100%, ${right.toFixed(2)}px 100%, ${right.toFixed(2)}px 0%, ${left.toFixed(2)}px 0%)`;
    }
  );

  // ---------------------------------------------------------------------------------------
  // 📍 snapToIndex: 将水珠平滑吸附到指定 Tab 索引位置
  // ---------------------------------------------------------------------------------------
  // @param index 目标 Tab 的索引
  // @param wobble 是否触发有机水滴如果冻般的果冻抖动 (scaleX / scaleY 伸缩波)
  // ---------------------------------------------------------------------------------------
  const snapToIndex = React.useCallback(
    (index: number, wobble = true) => {
      const { tabWidth } = getMetrics();
      if (tabWidth <= 0) return;

      const targetX = index * tabWidth;
      rawPillX.set(targetX);

      // 果冻果浆弹性回弹动画（模拟水滴撞击边界后的微小惯性振荡）
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
        animate(scaleX, 1, { duration: 0.2, ease: "easeOut" });
        animate(scaleY, 1, { duration: 0.2, ease: "easeOut" });
      }
    },
    [getMetrics, rawPillX, scaleX, scaleY]
  );

  // ---------------------------------------------------------------------------------------
  // 🚀 组件挂载初始化：首次加载瞬时归位 (Zero-Jank Mount)
  // ---------------------------------------------------------------------------------------
  // 使用 springPillX.jump(initialX) 绕过弹簧初速度计算，防止组件初次渲染时水珠从 0 飞向目标
  React.useEffect(() => {
    const { tabWidth } = getMetrics();
    if (tabWidth > 0 && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      const initialX = currentActiveIndex * tabWidth;
      rawPillX.set(initialX);
      springPillX.jump(initialX);
      prevActiveIndexRef.current = currentActiveIndex;
      setIsMounted(true);
    }
  }, [getMetrics, currentActiveIndex, rawPillX, springPillX]);

  // 外部 Props / 路由改变时的平滑吸附（非拖拽时触发）
  React.useEffect(() => {
    if (!isDraggingRef.current && hasInitializedRef.current && isMounted) {
      if (prevActiveIndexRef.current !== currentActiveIndex) {
        prevActiveIndexRef.current = currentActiveIndex;
        snapToIndex(currentActiveIndex, false);
      }
    }
  }, [currentActiveIndex, isMounted, snapToIndex]);

  // 尺寸监听 (ResizeObserver)：当窗口或父容器宽度突变时，重新自适应修正水珠物理坐标
  React.useEffect(() => {
    if (!innerRef.current) return;
    const observer = new ResizeObserver(() => {
      if (!isDraggingRef.current && hasInitializedRef.current) {
        const { tabWidth } = getMetrics();
        if (tabWidth > 0) {
          rawPillX.set(currentActiveIndex * tabWidth);
        }
      }
    });
    observer.observe(innerRef.current);
    return () => observer.disconnect();
  }, [currentActiveIndex, getMetrics, rawPillX]);

  // ---------------------------------------------------------------------------------------
  // 📐 getPillXFromPointer: 根据手势绝对位置计算水珠目标 X 坐标（带 iOS 级别物理双曲正切阻尼）
  // ---------------------------------------------------------------------------------------
  // 核心交互法则：
  // 手指或鼠标点击的位置，必须始终是水珠的【正几何中心】 (pointerX - tabWidth / 2)！
  // 当拖拽拉出左右边界时，利用 Math.tanh(over / 40) 进行非线性阻尼衰减，拉得越远阻力越大，
  // 最大溢出距离被平滑钳制在 MAX_OVERDRAG 像素以内。
  // ---------------------------------------------------------------------------------------
  const getPillXFromPointer = React.useCallback(
    (pointerX: number, tabWidth: number, maxTargetX: number) => {
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

  // ---------------------------------------------------------------------------------------
  // 👆 handlePointerDown: 手指/鼠标按下事件（手势启动）
  // ---------------------------------------------------------------------------------------
  // 1. 坐标归一化：通过 getBoundingClientRect() 与 scaleFactor 消除页面缩放/DPI 偏差。
  // 2. 居中水珠：将水珠中心瞬间瞄准手指落点。
  // 3. 激活膨胀：立即置 isPressed = true，水珠体积膨胀、顶层高亮文字放大 1.25x。
  // 4. 水滴拉伸：若落点距离当前水珠较远，触发一次水滴横向拉长、纵向压缩的有机形变。
  // 5. 原生捕获：调用 setPointerCapture，确保滑出底栏甚至屏幕外时手势依然不丢失。
  // ---------------------------------------------------------------------------------------
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;

    const { tabWidth, maxTargetX, scaleFactor, innerLeft } = getMetrics();
    if (tabWidth <= 0 || !innerRef.current) return;

    const mouseX = (e.clientX - innerLeft) / scaleFactor;
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

    // 1. 立即激活按下态（即使尚未移动，水珠立刻膨胀并点亮）
    setIsPressed(true);
    setIsDragging(false);

    // 2. 若跨度较大，激发一次流体冲刺形变
    const currentPillX = springPillX.get();
    const travelDistance = Math.abs(targetX - currentPillX);
    if (travelDistance > 8) {
      animate(scaleX, [1, 1.15, 0.95, 1], { duration: 0.32, ease: "easeOut" });
      animate(scaleY, [1, 0.88, 1.04, 1], { duration: 0.32, ease: "easeOut" });
    }

    rawPillX.set(targetX);
    setOptimisticIndex(hoveredIndex);

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };

  // ---------------------------------------------------------------------------------------
  // 🏃 handlePointerMove: 手指/鼠标滑动跟踪（1:1 零延迟直接跟随 + 速度流体形变）
  // ---------------------------------------------------------------------------------------
  // 1. 1:1 跟随：水珠物理中心无缝锁死在鼠标/手指横坐标上。
  // 2. 速度计算：利用 performance.now() 和帧间位移精准求导出瞬时速度 velocity (px/ms)。
  // 3. 有机流体形变 (Organic Stretch & Squash)：
  //    滑动越快，水珠在运动方向上被拉长 (scaleX > 1)，在垂直方向上被压扁 (scaleY < 1)，
  //    完美遵循不可压缩流体的质量守恒定律（物理拟真）。
  // ---------------------------------------------------------------------------------------
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
    const targetX = getPillXFromPointer(currentMouseX, tabWidth, maxTargetX);

    rawPillX.set(targetX);

    // 根据瞬时速度计算水珠流体形变系数
    const speed = Math.abs(velocityRef.current);
    const stretch = Math.min(0.12, speed * 0.04);
    scaleX.set(1 + stretch * 1.25);
    scaleY.set(Math.max(0.90, 1 - stretch * 0.45));
  };

  // ---------------------------------------------------------------------------------------
  // 🚀 handlePointerUp: 手势释放/松手结算（物理惯性甩动飞跃 + 弹性吸附 + 状态提交）
  // ---------------------------------------------------------------------------------------
  // 1. 惯性甩动 (Inertia Flick)：根据松手瞬间的瞬时速度 velocity，向前预测落点：
  //    projectedCenterX = dropletCenterX + velocity * 45
  //    如果用户做了一个快速“甩动”手势，水珠会顺应动量飞向下一个或下下个 Tab。
  // 2. 状态退出：置 isPressed/isDragging 为 false，水珠与文字同步弹回标准尺寸。
  // 3. 释放捕获并执行回调 (onClick, onChange, router.push)。
  // ---------------------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------------------
  // 🚫 handlePointerCancel: 手势被系统异常打断（例如系统来电、手势冲突）
  // ---------------------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------------------
  // ⌨️ handleTabClick: 键盘无障碍焦点回车/空格触发处理
  // ---------------------------------------------------------------------------------------
  const handleTabClick = (e: React.MouseEvent, index: number, item: AppleLiquidTabItem<T>) => {
    e.preventDefault();
    // detail === 0 代表来自键盘合成的 click 事件，非鼠标指针触发
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
      {/* =================================================================================
          🏝️【底栏外壳容器】Segmented Island Runner Dock Container
          ---------------------------------------------------------------------------------
          - 整体响应手势事件：统一在容器层捕获 PointerDown / Move / Up / Cancel，
            让用户不仅能精准点击单个 Tab，更能在整个底栏上任意盲操滑动拖拽。
          - 悬浮提升动效 (elevateOnDrag): 当开启且处于拖拽活跃态时，整条底栏轻微浮起 (y: -2px~-3px)
            并伴随微妙放大 (scale: 1.02~1.03) 与加深阴影，营造脱离屏幕底部的物理分层感。
          - 防御手势冲突：应用 touch-none, select-none, -webkit-touch-callout: none，
            严密杜绝移动端长按弹出系统操作菜单或与父容器页面滑动手势打架。
          ================================================================================= */}
      <motion.div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerLeave={() => {
          setIsPressed(false);
        }}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        animate={{
          scale: elevateOnDrag && isActive ? config.elevationScale : 1,
          y: elevateOnDrag && isActive ? config.elevationY : 0,
        }}
        transition={LIQUID_SPRING}
        style={{
          transformOrigin: "center center",
          WebkitTouchCallout: "none",
          WebkitUserSelect: "none",
          userSelect: "none",
        }}
        className={cn(
          "relative rounded-full select-none will-change-transform touch-none border overflow-visible transition-[box-shadow,border-color] duration-200 [-webkit-touch-callout:none]",
          config.containerClass,
          elevateOnDrag && isActive
            ? cn("cursor-grabbing", config.dragShadow)
            : cn(isActive ? "cursor-grabbing" : "cursor-pointer", config.restingShadow),
          className
        )}
      >
        {/* 顶部拟真高光棱线 (Top Rim Highlight Line)：模拟光线打在玻璃底栏顶缘的极细高光反光 (z-[1]) */}
        <div className="absolute top-0 left-3 right-3 h-[1.5px] bg-gradient-to-r from-transparent via-white dark:via-white/70 to-transparent pointer-events-none z-[1]" />

        {/* 底部焦散反弹光 (Bottom Rim Highlight Line)：模拟环境底光反射在底栏下沿的微弱漫反射 (z-[1]) */}
        <div className="absolute bottom-0 left-5 right-5 h-[1px] bg-gradient-to-r from-transparent via-white/60 dark:via-white/25 to-transparent pointer-events-none z-[1]" />

        {/* 轨道几何容器 (Inner Track Wrapper)：确保水珠物理实体与双层文字严格共享 100% 吻合的内外尺寸参考系 */}
        <div ref={innerRef} className="relative w-full h-full overflow-visible">
          {/* =================================================================================
              💧【中间层：水珠物理实体】Liquid Water Droplet Active Indicator Pill (Z-15)
              ---------------------------------------------------------------------------------
              - 定位与层级：z-[15]，衬托在底层常态字与顶层高亮字之间。
              - 尺寸与形态：
                • 静止态 (resting): 内缩收纳于轨道内 (top/bottom: restingInset 如 1px)，表现为优雅的毛玻璃胶囊。
                • 活跃态 (isActive): 向上向下同时暴突溢出 (top/bottom: activeOverhang 如 -7.5px)，
                  打破底栏边界，呈现真实液体张力突破约束的立体水滴感！
              - 物理动效：由 springPillX 与 scaleX / scaleY 驱动，产生拖拽速度相关的拉伸与果冻回弹。
              ================================================================================= */}
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
              left: isMounted ? 0 : `${(currentActiveIndex * 100) / items.length}%`,
              x: isMounted ? springPillX : 0,
              scaleX,
              scaleY,
              transformOrigin: "center center",
            }}
          >
            {/* 1. 弯液面光晕圈 (Optical Curved Light Ray Meniscus Rim):
                利用 CSS Mask Composite: exclude 排除技术，用 1.2px 内边距裁剪出超细高光微边框，
                静止时微光温润 (opacity 45%)，交互激活时强烈聚焦反光 (opacity 90%)，通过 LIQUID_SPRING 平滑过渡 */}
            <motion.div
              className="absolute -inset-[1px] rounded-full pointer-events-none"
              initial={false}
              animate={{
                opacity: isActive ? 0.90 : 0.45,
              }}
              transition={LIQUID_SPRING}
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

            {/* 2. 物理色散边缘 (Chromatic Dispersion Prismatic Fringe):
                模拟不同波长光线折射率差引起的微弱彩虹色散光晕（蓝青色到暖橙色色散），仅在交互活跃态渐变显露 */}
            <motion.div
              className="absolute -inset-[0.5px] rounded-full pointer-events-none"
              initial={false}
              animate={{
                opacity: isActive ? 0.75 : 0,
              }}
              transition={LIQUID_SPRING}
              style={{
                background:
                  "linear-gradient(90deg, rgba(0, 180, 255, 0.40) 0%, rgba(255, 255, 255, 0) 25%, rgba(255, 255, 255, 0) 75%, rgba(255, 90, 40, 0.35) 100%)",
                mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                maskComposite: "exclude",
                WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                padding: "1px",
              }}
            />

            {/* 3. 水珠本体容器 (Droplet Body Container):
                采用双层交叉淡入淡出（Cross-Fade）渐变动效架构，完美避免 CSS 类名切换导致的阴影/滤镜突变，
                严格共享 LIQUID_SPRING 物理弹簧，带来 100% 丝滑连续的有机液体渐变过渡体验！ */}
            <div className="relative w-full h-full rounded-full overflow-hidden">
              {/* -----------------------------------------------------------------
                  【静止态水珠外观 (Resting State)】
                  - Light 模式下呈现微灰烟熏质感渐变 (from-black/[0.05] via-black/[0.065] to-black/[0.085])，
                    解决纯白底栏上白色水珠不够明显的对比度痛点；Dark 模式维持优雅深邃微光。
                  - 配合 12px 毛玻璃、内嵌 1px 高光与柔和微阴影，呈现温润的实体玻璃胶囊质感。
                  - 随 isActive 渐变淡出 (opacity: 0)，松手时渐变淡入 (opacity: 1)。
                  ----------------------------------------------------------------- */}
              <motion.div
                className={cn(
                  "absolute inset-0 rounded-full overflow-hidden",
                  config.restingDropletClass
                )}
                initial={false}
                animate={{
                  opacity: isActive ? 0 : 1,
                }}
                transition={LIQUID_SPRING}
              >
                {/* 静止态顶部柔和微光反光 */}
                <div
                  className={cn(
                    "absolute inset-x-2 top-0.5 h-[40%] rounded-t-full bg-gradient-to-b from-white/60 via-white/10 to-transparent pointer-events-none dark:from-white/20 dark:via-transparent",
                    config.restingSpecularClass
                  )}
                />
                {/* 静止态底部微弱漫反射 */}
                <div
                  className={cn(
                    "absolute bottom-0 inset-x-3 h-[25%] rounded-b-full bg-gradient-to-t from-white/30 to-transparent pointer-events-none dark:from-white/10",
                    config.restingCausticClass
                  )}
                />
              </motion.div>

              {/* -----------------------------------------------------------------
                  【活跃态水珠外观 (Active State)】
                  - 真实 iOS 27 高透 3D 凸面水珠本体：保持不变，极高通透度 (bg-white/20)、
                    2px 轻微透镜折射模糊、深邃立体落影与双向高光。
                  - 包含 3D 弧面聚光弧、顶部峰线高光、底部焦散聚集弧与边缘反弹线。
                  - 随 isActive 渐变淡入 (opacity: 1)，松手时平滑淡出 (opacity: 0)。
                  ----------------------------------------------------------------- */}
              <motion.div
                className="absolute inset-0 rounded-full overflow-hidden bg-white/[0.20] dark:bg-white/[0.05] backdrop-blur-[2px] border border-black/[0.08] dark:border-white/[0.20] shadow-[0_16px_36px_-4px_rgba(0,0,0,0.18),0_4px_12px_rgba(0,0,0,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.95),inset_0_-1px_1.5px_rgba(255,255,255,0.35)] dark:shadow-[0_22px_48px_-4px_rgba(0,0,0,0.92),0_8px_20px_rgba(0,0,0,0.72),inset_0_1.5px_2px_rgba(255,255,255,0.40),inset_0_-1px_1px_rgba(255,255,255,0.12)]"
                initial={false}
                animate={{
                  opacity: isActive ? 1 : 0,
                }}
                transition={LIQUID_SPRING}
              >
                {/* 顶部弧面高光聚光带 (Curved Top Specular Arc) */}
                <div className="absolute inset-x-2 top-0.5 h-[45%] rounded-t-full bg-gradient-to-b from-white/70 via-white/10 to-transparent pointer-events-none dark:from-white/30 dark:via-transparent opacity-100" />

                {/* 顶部极细高光折射峰线 (Crisp Top Specular Crest Line) */}
                <div className="absolute top-[1px] inset-x-3.5 h-[1px] bg-gradient-to-r from-transparent via-white/90 dark:via-white/60 to-transparent pointer-events-none opacity-100" />

                {/* 底部焦散聚集弧 (Bottom Caustic Reflection Arc) */}
                <div className="absolute bottom-0 inset-x-2.5 h-[32%] rounded-b-full bg-gradient-to-t from-white/40 via-transparent to-transparent pointer-events-none dark:from-white/15 opacity-100" />

                {/* 底部极细边缘微光 (Crisp Bottom Rim Line) */}
                <div className="absolute bottom-[1px] inset-x-4 h-[1px] bg-gradient-to-r from-transparent via-white/60 dark:via-white/30 to-transparent pointer-events-none opacity-100" />
              </motion.div>
            </div>
          </motion.div>

          {/* =================================================================================
              📄【Layer 1: 底层灰色常态层】Base Inactive Items Grid (Z-20)
              ---------------------------------------------------------------------------------
              • 承载内容：整条导航栏所有 Tab 的灰色文字与图标 (标准尺寸 scale 1.0)
              • 裁剪算法：clipPathInactive (利用 CSS polygon(evenodd, ...) 奇偶打孔算法)
              • 核心行为：
                全底栏正常显示灰色字；唯独在当前水珠所覆盖的坐标窗口内，被若尔当曲线定理
                打出一个 100% 物理透空的矩形孔洞！
                水珠下方的灰色字 100% 消失剔除，绝对杜绝双重重影！
              • 事件交互：作为实际接受用户点击/键盘无障碍 Tab 焦点的真实按钮层
              ================================================================================= */}
          <motion.div
            className="relative z-[20] w-full h-full select-none"
            style={{
              clipPath: clipPathInactive,
              WebkitClipPath: clipPathInactive,
            }}
          >
            <div
              className="grid w-full h-full items-center select-none"
              style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
            >
              {items.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={item.id === activeId}
                    tabIndex={0}
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                    onContextMenu={(e) => e.preventDefault()}
                    onClick={(e) => handleTabClick(e, index, item)}
                    className="flex items-center justify-center w-full h-full rounded-full cursor-pointer select-none outline-none [-webkit-touch-callout:none]"
                    style={{ WebkitTouchCallout: "none" }}
                  >
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
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* =================================================================================
              🔍【Layer 2: 顶层蓝色透镜层】Active Masked Reveal Grid (Z-25)
              ---------------------------------------------------------------------------------
              • 承载内容：整条导航栏所有 Tab 的高亮蓝色文字、发光阴影与图标
              • 裁剪算法：clipPathActive (利用 CSS inset(... round 9999px) 胶囊正向裁剪窗口)
              • 核心行为：
                整屏默认 100% 裁剪隐藏，只在水珠当前所在的正向圆角窗口内显现出来！
              • 光学透镜放大物理动画：
                - 静止态 (resting): scale: 1.0, y: 0（未触摸时不突兀变大）
                - 活跃态 (isActive): scale: 1.25, y: -2px（触摸按下/拖拽时，文字宛如被光学放大镜凸透镜折射放大并浮起）
                - 动效驱动：与水珠位移严格共用 LIQUID_SPRING 物理弹簧，做到同生同灭、毫秒级步调完全一致！
              • 交互穿透：pointer-events-none + aria-hidden="true"，纯粹作为视觉表现层，无障碍焦点由 Layer 1 处理
              ================================================================================= */}
          <motion.div
            className="absolute inset-0 z-[25] pointer-events-none select-none overflow-visible"
            style={{
              clipPath: clipPathActive,
              WebkitClipPath: clipPathActive,
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
                    <motion.div
                      animate={{
                        scale: isActive ? 1.25 : 1.0,
                        y: isActive ? -2 : 0,
                      }}
                      transition={LIQUID_SPRING}
                      className={cn(
                        "flex items-center justify-center font-semibold select-none origin-center will-change-transform",
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
                            "shrink-0 stroke-[2.2] transition-transform",
                            "drop-shadow-[0_1px_5px_rgba(0,113,227,0.45)] dark:drop-shadow-[0_1px_8px_rgba(41,151,255,0.65)]"
                          )}
                        />
                      )}
                      <span className="truncate whitespace-nowrap tracking-tight text-[12px] sm:text-[13px] drop-shadow-[0_1px_4px_rgba(0,113,227,0.30)] dark:drop-shadow-[0_1px_5px_rgba(41,151,255,0.45)]">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="text-[10px] font-mono shrink-0 opacity-95">
                          {item.badge}
                        </span>
                      )}
                    </motion.div>
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
