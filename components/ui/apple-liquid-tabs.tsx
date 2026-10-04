"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useSpring, useTransform, animate, type MotionValue } from "motion/react";
import { cn } from "@/lib/utils";

/* =========================================================================
 * 📦 01. 类型定义 (TypeScript Interfaces)
 * ========================================================================= */

/** 单个 Tab 项数据结构 */
export interface AppleLiquidTabItem<T = string> {
  /** Tab 唯一标识符 */
  id: T;
  /** 文本标签或 React 节点 */
  label: React.ReactNode;
  /** 可选图标组件 (Lucide 图标等) */
  icon?: React.ComponentType<{ className?: string }>;
  /** 可选状态角标 (如数字、小红点) */
  badge?: React.ReactNode;
  /** 关联路由链接 (isRouteNav 模式生效) */
  href?: string;
  /** 点击时的自定义回调函数 */
  onClick?: () => void;
}

/** AppleLiquidTabs 核心组件属性 */
export interface AppleLiquidTabsProps<T = string> {
  /** Tab 选项列表 */
  items: AppleLiquidTabItem<T>[];
  /** 当前选中的 Tab ID（受控模式） */
  value?: T;
  /** 初始选中的 Tab ID（非受控模式） */
  defaultValue?: T;
  /** 选中项切换时的回调函数 */
  onChange?: (value: T) => void;
  /** 是否启用 Next.js 路由自动预加载与跳转 */
  isRouteNav?: boolean;
  /** 尺寸规格：sm (36px) | md (40px) | lg (56px) */
  size?: "sm" | "md" | "lg";
  /** 排布方向：horizontal (横向) | vertical (纵向) */
  orientation?: "horizontal" | "vertical";
  /** 外层底栏容器扩展样式 */
  className?: string;
  /** 单个 Tab 项扩展样式 */
  tabClassName?: string;
  /** 激活状态文字与发光阴影的主题色 */
  activeColor?: string;
  /** 拖拽活跃时底栏是否整体向上悬浮提拔 */
  elevateOnDrag?: boolean;
  /** 视觉变体：default (常规白底磨砂) | dock (手机底部浅烟熏微灰) */
  variant?: "default" | "dock";
}

/* =========================================================================
 * ⚙️ 02. 物理常数与弹簧曲线 (Physics Constants & Springs)
 * ========================================================================= */

/**
 * 拖拽到达底栏两端时的最大橡皮筋阻尼溢出距离（像素）。
 * 采用双曲正切函数 Math.tanh(over / 40) 进行非线性衰减，还原 iOS 系统级平滑阻尼感。
 */
const MAX_OVERDRAG = 24;

/**
 * 统一液态玻璃弹簧物理参数 (Unified Liquid Spring Physics)
 * -------------------------------------------------------------------------
 * 关键设计原则：
 * 所有参与水珠交互的属性（X 轴位移、水平拉伸 scaleX/scaleY、垂直外溢 overhang、
 * 底栏整体浮起高度 y、以及顶层文字放大 scale）必须严格共享这组物理曲线！
 *
 * 彻底消除异步脱节，呈现犹如一整块物理水滴凝胶在受力受阻时的 60fps 丝滑有机生命力。
 *
 * • stiffness (刚度 440): 响应迅捷，跟随手指无粘滞感
 * • damping   (阻尼 28):  临界阻尼附近带有微小回弹，呈现液体微波果冻感
 * • mass      (质量 0.6): 赋予水珠适度的物理惯性
 */
const LIQUID_SPRING = {
  type: "spring" as const,
  stiffness: 440,
  damping: 28,
  mass: 0.6,
};

/* =========================================================================
 * 🌊 03. 核心组件与光学原理 (Core Component & Optical Architecture)
 * ========================================================================= */

/**
 * =========================================================================================
 * 🌊 AppleLiquidTabs (iOS 27 真实高透液态玻璃水珠光学透镜导航栏)
 * =========================================================================================
 *
 * 📖【架构设计原理与心智模型 (Mental Model)】
 * -----------------------------------------------------------------------------------------
 * 1. 传统分段控制器 (UISegmentedControl) 的失效：
 *    - 传统 Tab 的高亮滑块是「实心不透明白色」，滑块盖在底层文字上方，物理上遮蔽了底层灰色字。
 *    - 当设计要求「iOS 27 高透水珠（透明度 80%，带毛玻璃与高光）」时，滑块变得通透，底层灰色字
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
 *    │              被物理掏出一个 100% 透明的圆角胶囊中空切口！灰色字 0% 存在！│
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

  /* -------------------------------------------------------------------------
   * • 04. 响应式状态机与路由感知 (State Machine & Route Handling)
   * ------------------------------------------------------------------------- */

  // 1. 受控模式 (Controlled) 与非受控模式 (Uncontrolled) 状态双轨支持
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState<T>(
    value ?? defaultValue ?? items[0]?.id
  );

  const activeId = isControlled ? (value as T) : internalValue;
  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.id === activeId)
  );

  /**
   * 2. 乐观索引 (Optimistic Index)：
   *    手势拖拽或触摸点击时，即使父级路由尚未完成异步页面跳转，UI 水珠也立即先吸附到手势目标 Tab。
   *    彻底消除网络或路由延迟带来的视觉卡顿感，实现 0ms 原生触控响应。
   */
  const [optimisticIndex, setOptimisticIndex] = React.useState<number | null>(null);

  /**
   * 3. 手势交互状态机：
   *    • isDragging: 触摸或鼠标按下并在水平轴上位移超过 2px，进入持续拖拽跟随模式
   *    • isPressed:  按下的瞬间立即为 true（即使尚未移动），用于触发水珠膨胀与文字放大
   */
  const [isDragging, setIsDragging] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);

  // 外部 Props 变化时（如浏览器前进/后退、父组件重置状态），同步清空乐观索引
  React.useEffect(() => {
    setOptimisticIndex(null);
  }, [value]);

  /**
   * 4. 路由静默预加载 (Next.js Link Prefetching)：
   *    若作为底层路由导航栏 (isRouteNav=true)，后台静默预取所有 Tab 关联的 href，
   *    实现类似原生 Native iOS App 般的 0 秒秒开体验。
   */
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

  /**
   * 5. 核心交互状态 (isActive)：
   *    只要处于触摸按下 (isPressed) 或拖拽中 (isDragging) 任意一种状态，即视为活跃交互态：
   *    • 水珠物理实体向上和向下膨胀溢出底栏 (activeOverhang)
   *    • 顶层蓝色高亮文字被透镜光学放大至 1.25x (scale: 1.25, y: -2px)
   *    • 一旦松手释放，所有属性在 LIQUID_SPRING 的同一曲线驱动下毫秒级平滑同步回归常态
   */
  const isActive = isPressed || isDragging;

  const currentActiveIndex = optimisticIndex ?? activeIndex;

  /* -------------------------------------------------------------------------
   * • 05. DOM 引用与手势物理追踪 (DOM Refs & Touch Tracking)
   * ------------------------------------------------------------------------- */
  const containerRef = React.useRef<HTMLDivElement>(null);        // 最外层 Dock 容器
  const innerRef = React.useRef<HTMLDivElement>(null);            // 承载水珠与双层文字的绝对参考轨道
  const pillRef = React.useRef<HTMLDivElement>(null);             // 水珠物理 DOM 实体
  const isDraggingRef = React.useRef(false);                      // 是否正在拖拽中的同步标志
  const hasMovedRef = React.useRef(false);                        // 是否发生过有效位移（区分点击与拖动）
  const startXRef = React.useRef(0);                              // 触摸按下时的 clientX 绝对坐标
  const startMouseXRef = React.useRef(0);                         // 触摸按下时相对容器内的局部 X 坐标
  const startPillXRef = React.useRef(0);                          // 按下时刻水珠所处的 X 坐标
  const lastXRef = React.useRef(0);                               // 上一帧的 clientX（用于计算瞬间移动速度）
  const lastTimeRef = React.useRef(0);                            // 上一帧时间戳（performance.now()）
  const velocityRef = React.useRef(0);                            // 瞬时滑动速度 (px/ms)，用于松手惯性甩动飞跃
  const clickTargetIndexRef = React.useRef<number | null>(null);  // 按下时命中的 Tab 索引
  const hasInitializedRef = React.useRef(false);                  // 是否已完成首次挂载绝对布局定位

  /* -------------------------------------------------------------------------
   * • 06. 规格尺寸与视觉变体配置 (Sizing & Variant Presets)
   * -------------------------------------------------------------------------
   * 核心视觉分工判定：
   * • 手机底部导航栏 (Bottom Dock: variant === "dock" 或默认 size === "lg"):
   *   底栏本身为白底 (bg-white/75)，未激活态水珠采用浅烟熏微灰立体渐变 (from-black/5 to-black/8.5)，清晰辨识！
   * • 常规 Tab (Header / Dashboard / Shop 页面: size 为 sm 或 md):
   *   底栏背景自带灰色轨道 (bg-black/[0.04])，未激活态水珠保持原有纯白磨砂质感 (bg-white/80)，黑白对比分明。
   * • 高度规格 (restingInset: -1.5):
   *   全规格水珠上下留白缩减 50%（从 5px 缩小至 2.5px），饱满大气，且绝不与底栏外边缘重合。
   */
  const isDock = variant === "dock" || (variant === undefined && size === "lg");

  const config = React.useMemo(() => {
    // 手机底部 Nav 专用的高透立体微渐变水珠样式（暗色空灵微透、亮色恰到好处的微烟熏质感，极致单层发丝细边）
    const dockDropletClass =
      "bg-gradient-to-b from-black/[0.035] via-black/[0.042] to-black/[0.055] dark:from-white/[0.035] dark:via-white/[0.015] dark:to-transparent backdrop-blur-[16px] border border-black/[0.055] dark:border-white/[0.08] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02),inset_0_1px_1px_rgba(255,255,255,0.85)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.4),inset_0_0.5px_0.5px_rgba(255,255,255,0.12)]";

    // 常规 Tab (Header / Dashboard / Shop) 保持原有高透微磨砂水珠样式
    const standardDropletClass =
      "bg-white/80 dark:bg-white/[0.05] backdrop-blur-[12px] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.8)] dark:shadow-[0_2px_6px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.12)]";

    switch (size) {
      case "lg":
        return {
          restingInset: -1,
          activeOverhang: -9,
          containerClass: "p-1 h-[56px] bg-white/75 dark:bg-[#18181c]/80 backdrop-blur-[24px] saturate-[190%] border border-black/[0.08] dark:border-white/[0.14]",
          itemClass: "h-full px-1 text-[11px]",
          iconClass: "w-[19px] h-[19px]",
          elevationScale: 1.03,
          elevationY: -3,
          restingShadow: "shadow-[0_1px_3px_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.7)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.12)]",
          dragShadow: "shadow-[0_24px_54px_-8px_rgba(0,0,0,0.20),0_10px_24px_-4px_rgba(0,0,0,0.12),inset_0_1.5px_1.5px_rgba(255,255,255,0.98)] dark:shadow-[0_32px_68px_-8px_rgba(0,0,0,0.90),0_12px_32px_rgba(0,0,0,0.75),inset_0_1.5px_1.5px_rgba(255,255,255,0.24)] border-black/[0.12] dark:border-white/[0.22]",
          restingDropletClass: isDock ? dockDropletClass : standardDropletClass,
          restingSpecularClass: isDock ? "opacity-50" : "opacity-30",
          restingCausticClass: isDock ? "opacity-30" : "opacity-20",
        };
      case "md":
        return {
          restingInset: -0.5,
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
          restingInset: -0.5,
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

  /* -------------------------------------------------------------------------
   * • 07. 物理运动变量与几何测量 (Motion Values & Metrics)
   * ------------------------------------------------------------------------- */
  /**
   * 水珠 X 轴坐标运动量：
   * • rawPillX: 瞬时写入的目标 X 像素坐标（由指针或 snapToIndex 立即更新）
   * • springPillX: 经过 LIQUID_SPRING 物理滤波后的实时渲染坐标（驱动水珠与双层裁剪）
   */
  const rawPillX = useMotionValue(0);
  const springPillX = useSpring(rawPillX, {
    stiffness: LIQUID_SPRING.stiffness,
    damping: LIQUID_SPRING.damping,
    mass: LIQUID_SPRING.mass,
  });

  /**
   * 水滴有机挤压与拉伸比例 (Squash & Stretch)：
   * 随滑动速度动态调节 scaleX (运动方向拉伸) 和 scaleY (垂直压缩)，
   * 维持流体视觉体积守恒。
   */
  const scaleX = useMotionValue(1);
  const scaleY = useMotionValue(1);

  /**
   * 轨道几何尺寸测量 (getMetrics)：
   * 消除父级 CSS transform（如 scale 缩放）、高分屏 Retina DPI 渲染偏差：
   * 利用 rect.width / innerWidth 计算出真实的缩放比例 scaleFactor，
   * 保证光标在任何缩放环境下都能 100% 精确对齐水珠中心。
   */
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

  /* -------------------------------------------------------------------------
   * • 08. 光学互斥遮罩矩阵 (Optical Complementary Masking System)
   * ------------------------------------------------------------------------- */

  /**
   * 🔍【裁剪层 1】clipPathActive: 顶层高亮蓝色文字的正向透镜显露窗口
   * -------------------------------------------------------------------------
   * • 核心作用：只让水珠透镜内部的圆角胶囊区域显露，外部区域 100% 裁剪隐藏。
   * • 几何对齐：边界 top/bottom 严格取 topOffset，与物理水珠 pillRef 及底层打孔完全同构。
   * • 亚像素补偿：左右各施加 0.75px 膨胀缓冲 (Dilation Buffer)，杜绝 GPU 抗锯齿接缝漏底。
   */
  const clipPathActive = useTransform(
    [springPillX, scaleX],
    ([latestX, latestScaleX]: number[]) => {
      const topOffset = isActive ? config.activeOverhang : config.restingInset;
      const leftP = (currentActiveIndex * 100) / items.length;
      const rightP = ((items.length - 1 - currentActiveIndex) * 100) / items.length;

      if (!isMounted || !innerRef.current) {
        return `inset(${topOffset.toFixed(2)}px ${rightP.toFixed(2)}% ${topOffset.toFixed(2)}px ${leftP.toFixed(2)}% round 9999px)`;
      }

      const w = innerRef.current.offsetWidth;
      if (w <= 0) {
        return `inset(${topOffset.toFixed(2)}px ${rightP.toFixed(2)}% ${topOffset.toFixed(2)}px ${leftP.toFixed(2)}% round 9999px)`;
      }

      const tabWidth = items.length > 0 ? w / items.length : 0;
      const center = (latestX ?? 0) + tabWidth / 2;
      const currentWidth = tabWidth * (latestScaleX ?? 1);
      const left = Math.max(0, center - currentWidth / 2);
      const right = Math.min(w, center + currentWidth / 2);

      // 施加 0.75px 亚像素膨胀缓冲，紧密咬合底层多边形切口，杜绝发丝细缝
      const activeLeft = Math.max(0, left - 0.75);
      const activeRight = Math.min(w, right + 0.75);

      return `inset(${topOffset.toFixed(2)}px ${(w - activeRight).toFixed(2)}px ${topOffset.toFixed(2)}px ${activeLeft.toFixed(2)}px round 9999px)`;
    }
  );

  /**
   * 🕳️【裁剪层 2】clipPathInactive: 底层灰色文字的圆角胶囊反向打孔 (Capsule Donut Hole)
   * -------------------------------------------------------------------------
   * • 数学原理：基于若尔当曲线定理 (Jordan Curve Theorem) 与 CSS polygon(evenodd, ...)。
   * • 突破升级：告别平直矩形直角切刀，改用高密度圆弧采样的「真实圆角胶囊多边形」！
   * • 采样算法：
   *   1. 外圈 5 点顺时针包围整条导航栏 (0% 0% -> 100% 0% -> 100% 100% -> 0% 100% -> 0% 0%)
   *   2. 内圈利用正弦/余弦三角函数沿半径 r 采样左、右两个半圆弧（各采样 8 个平滑顶点）：
   *      - 顶部水平切线：(cxLeft, yTop) -> (cxRight, yTop)
   *      - 右半圆弧：theta 从 -90° 到 +90° 平滑弯曲向下
   *      - 底部水平切线：(cxRight, yBottom) -> (cxLeft, yBottom)
   *      - 左半圆弧：theta 从 +90° 到 +270° 平滑弯曲向上回到起点
   *   3. 几何完全同构：高度、上下边距、圆角曲率与物理水珠及顶层透镜 100% 贴合，彻底消灭直边与圆角脱节漏缝！
   */
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
      const h = innerRef.current.offsetHeight;
      if (w <= 0 || h <= 0) {
        return `polygon(evenodd, 0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, ${leftP.toFixed(2)}% 0%, ${leftP.toFixed(2)}% 100%, ${rightSideP.toFixed(2)}% 100%, ${rightSideP.toFixed(2)}% 0%, ${leftP.toFixed(2)}% 0%)`;
      }

      const tabWidth = items.length > 0 ? w / items.length : 0;
      const center = (latestX ?? 0) + tabWidth / 2;
      const currentWidth = tabWidth * (latestScaleX ?? 1);
      const left = Math.max(0, center - currentWidth / 2);
      const right = Math.min(w, center + currentWidth / 2);

      // 提取水珠垂直物理边界
      const topOffset = isActive ? config.activeOverhang : config.restingInset;
      const yTop = topOffset;
      const yBottom = h - topOffset;
      const pillHeight = Math.max(1, yBottom - yTop);
      const centerY = h / 2;

      // 计算胶囊半圆半径与左右圆心
      const r = Math.min(pillHeight / 2, Math.max(0, (right - left) / 2));
      const cxLeft = left + r;
      const cxRight = Math.max(cxLeft, right - r);

      const points: string[] = [
        "0% 0%", "100% 0%", "100% 100%", "0% 100%", "0% 0%",
      ];

      // 内圈胶囊切口：从左上切点开始
      points.push(`${cxLeft.toFixed(2)}px ${yTop.toFixed(2)}px`);
      points.push(`${cxRight.toFixed(2)}px ${yTop.toFixed(2)}px`);

      // 右半圆弧采样 (9 个平滑分段，奇数采样规避 y=centerY 轴向接缝)
      const N = 9;
      for (let i = 1; i <= N; i++) {
        const theta = -Math.PI / 2 + (Math.PI * i) / N;
        const x = cxRight + r * Math.cos(theta);
        const y = centerY + r * Math.sin(theta);
        points.push(`${x.toFixed(2)}px ${y.toFixed(2)}px`);
      }

      // 底部水平切线
      points.push(`${cxLeft.toFixed(2)}px ${yBottom.toFixed(2)}px`);

      // 左半圆弧采样 (9 个平滑分段，奇数采样规避 y=centerY 轴向接缝)
      for (let i = 1; i <= N; i++) {
        const theta = Math.PI / 2 + (Math.PI * i) / N;
        const x = cxLeft + r * Math.cos(theta);
        const y = centerY + r * Math.sin(theta);
        points.push(`${x.toFixed(2)}px ${y.toFixed(2)}px`);
      }

      // 闭合胶囊回路
      points.push(`${cxLeft.toFixed(2)}px ${yTop.toFixed(2)}px`);

      return `polygon(evenodd, ${points.join(", ")})`;
    }
  );

  /* -------------------------------------------------------------------------
   * • 09. 物理吸附与手势交互引擎 (Physics Snapping & Gesture Handlers)
   * ------------------------------------------------------------------------- */

  /**
   * 📍 snapToIndex: 将水珠平滑吸附到指定 Tab 索引位置
   * @param index 目标 Tab 的索引
   * @param wobble 是否触发有机水滴如果冻般的果冻抖动 (scaleX / scaleY 伸缩波)
   */
  const snapToIndex = React.useCallback(
    (index: number, wobble = true) => {
      const { tabWidth } = getMetrics();
      if (tabWidth <= 0) return;

      const targetX = index * tabWidth;
      rawPillX.set(targetX);

      // 果冻弹性回弹动画（模拟水滴撞击边界后的微小惯性振荡）
      if (wobble && pillRef.current) {
        animate(scaleX, [1.05, 0.98, 1], {
          duration: 0.28,
          ease: "easeOut",
          onComplete: () => {
            scaleX.set(1);
            scaleY.set(1);
          },
        });
        animate(scaleY, [0.95, 1.02, 1], {
          duration: 0.28,
          ease: "easeOut",
          onComplete: () => {
            scaleX.set(1);
            scaleY.set(1);
          },
        });
      } else {
        animate(scaleX, 1, {
          duration: 0.2,
          ease: "easeOut",
          onComplete: () => {
            scaleX.set(1);
            scaleY.set(1);
          },
        });
        animate(scaleY, 1, {
          duration: 0.2,
          ease: "easeOut",
          onComplete: () => {
            scaleX.set(1);
            scaleY.set(1);
          },
        });
      }
    },
    [getMetrics, rawPillX, scaleX, scaleY]
  );

  /**
   * 🚀 组件挂载初始化：首次加载瞬时归位 (Zero-Jank Mount)
   * 使用 springPillX.jump(initialX) 绕过弹簧初速度计算，防止组件初次渲染时水珠从 0 飞向目标
   */
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

  /**
   * 📐 getPillXFromPointer: 根据手势绝对位置计算水珠目标 X 坐标（带 iOS 级别物理双曲正切阻尼）
   * 核心交互法则：
   * • 水珠中心始终对齐光标：(pointerX - tabWidth / 2)
   * • 边界橡皮筋阻尼：当拖拽拉出左右边界时，利用 Math.tanh(over / 40) 进行非线性衰减，
   *   拉得越远阻力越大，最大溢出距离被平滑钳制在 MAX_OVERDRAG 像素以内。
   */
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

  /**
   * 👆 handlePointerDown: 手指/鼠标按下事件（手势启动）
   * 1. 坐标归一化：通过 getBoundingClientRect() 与 scaleFactor 消除页面缩放/DPI 偏差。
   * 2. 居中水珠：将水珠中心瞬间瞄准手指落点。
   * 3. 激活膨胀：立即置 isPressed = true，水珠体积膨胀、顶层高亮文字放大 1.25x。
   * 4. 水滴拉伸：若落点距离当前水珠较远，触发一次水滴横向拉长、纵向压缩的有机形变。
   * 5. 原生捕获：调用 setPointerCapture，确保滑出底栏甚至屏幕外时手势依然不丢失。
   */
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

  /**
   * 🏃 handlePointerMove: 手指/鼠标滑动跟踪（1:1 零延迟直接跟随 + 速度流体形变）
   * 1. 1:1 跟随：水珠物理中心无缝锁死在鼠标/手指横坐标上。
   * 2. 速度计算：利用 performance.now() 和帧间位移精准求导出瞬时速度 velocity (px/ms)。
   * 3. 有机流体形变 (Organic Stretch & Squash)：
   *    滑动越快，水珠在运动方向上被拉长 (scaleX > 1)，在垂直方向上被压扁 (scaleY < 1)，
   *    完美遵循不可压缩流体的质量守恒定律（物理拟真）。
   */
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

  /**
   * 🚀 handlePointerUp: 手势释放/松手结算（物理惯性甩动飞跃 + 弹性吸附 + 状态提交）
   * 1. 惯性甩动 (Inertia Flick)：根据松手瞬间的瞬时速度 velocity，向前预测落点：
   *    projectedCenterX = dropletCenterX + velocity * 45
   *    如果用户做了一个快速“甩动”手势，水珠会顺应动量飞向下一个或下下个 Tab。
   * 2. 状态退出：置 isPressed/isDragging 为 false，水珠与文字同步弹回标准尺寸。
   * 3. 释放捕获并执行回调 (onClick, onChange, router.push)。
   */
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

  /**
   * 🚫 handlePointerCancel: 手势被系统异常打断（例如系统来电、手势冲突）
   */
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

  /**
   * ⌨️ handleTabClick: 键盘无障碍焦点回车/空格触发处理
   */
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

  /* =========================================================================
   * 🎨 10. 视觉渲染树架构 (JSX Visual Hierarchy & Render Tree)
   * ========================================================================= */
  return (
    <>
      {/* =================================================================================
          🏝️ 10.1【底栏外壳容器】Segmented Island Runner Dock Container
          ---------------------------------------------------------------------------------
          • 整体响应手势：统一在容器层捕获 PointerDown / Move / Up / Cancel，
            让用户不仅能精准点击单个 Tab，更能在整个底栏上任意盲操滑动拖拽。
          • 悬浮提拔动效 (elevateOnDrag): 当开启且处于拖拽活跃态时，整条底栏轻微浮起 (y: -2px~-3px)
            并伴随微妙放大 (scale: 1.02~1.03) 与加深阴影，营造脱离屏幕底部的物理分层感。
          • 防御手势冲突：应用 touch-none, select-none, -webkit-touch-callout: none，
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
        {/* 顶部拟真高光棱线 (Top Rim Highlight Line)：轻柔优雅，避免在暗色下与水珠重叠显得上下边缘过厚 */}
        <div className="absolute top-0 left-3 right-3 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent pointer-events-none z-[1]" />

        {/* 底部焦散反弹光 (Bottom Rim Highlight Line)：模拟环境底光反射在底栏下沿的微弱漫反射 (z-[1]) */}
        <div className="absolute bottom-0 left-5 right-5 h-[1px] bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent pointer-events-none z-[1]" />

        {/* 轨道几何容器 (Inner Track Wrapper)：确保水珠物理实体与双层文字严格共享 100% 吻合的内外尺寸参考系 */}
        <div ref={innerRef} className="relative w-full h-full overflow-visible">
          {/* =================================================================================
              💧 10.2【中间层：水珠物理实体】Liquid Droplet Active Indicator Pill (Z-15)
              ---------------------------------------------------------------------------------
              • 定位与层级：z-[15]，衬托在底层常态字与顶层高亮字之间。
              • 尺寸与形态：
                - 静止态 (resting): 内缩收纳于轨道内 (top/bottom: restingInset 约为 -1.5px)，
                  四周留白均等缩减 50%（约 2.5px），表现为优雅饱满的微灰/白玻璃胶囊。
                - 活跃态 (isActive): 向上向下同时暴突溢出 (top/bottom: activeOverhang 约为 -7.5px~-9px)，
                  打破底栏物理边界，呈现液体表面张力突破约束的立体水滴感！
              • 物理动效：由 springPillX 与 scaleX / scaleY 驱动，产生拖拽速度相关的拉伸与果冻回弹。
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
            {/* -----------------------------------------------------------------
                • 10.2.1 弯液面光晕圈 (Curved Light Ray Meniscus Rim)
                - 利用纯净 CSS border 与双向内发光渲染极细微高光边框 (完全摒弃在 iOS 产生瓦片中轴接缝的 maskComposite: xor)
                - 仅在触摸按下/拖拽活跃交互态显露 (opacity 85%)，静止态彻底隐藏 (opacity 0) 避免与本体重叠造成过厚双边框
                - 严格通过 LIQUID_SPRING 物理弹簧平滑过渡
                ----------------------------------------------------------------- */}
            <motion.div
              className="absolute -inset-[1px] rounded-full pointer-events-none border border-white/60 dark:border-white/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),inset_0_-1px_1px_rgba(255,255,255,0.15)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.30),inset_0_-1px_1px_rgba(255,255,255,0.08)]"
              initial={false}
              animate={{
                opacity: isActive ? 0.85 : 0,
              }}
              transition={LIQUID_SPRING}
            />

            {/* -----------------------------------------------------------------
                • 10.2.2 物理色散边缘 (Chromatic Dispersion Prismatic Fringe)
                - 模拟不同波长光线折射率差引起的微弱彩虹色散光晕（蓝青色到暖橙色色散）
                - 仅在触摸按下/拖拽活跃态渐变显露 (轻柔通透色散，降低反光强度)
                ----------------------------------------------------------------- */}
            <motion.div
              className="absolute -inset-[0.5px] rounded-full pointer-events-none border border-sky-400/18 dark:border-sky-400/12 shadow-[0_0_4px_rgba(0,180,255,0.10)]"
              initial={false}
              animate={{
                opacity: isActive ? 0.35 : 0,
              }}
              transition={LIQUID_SPRING}
            />

            {/* -----------------------------------------------------------------
                • 10.2.3 双层交叉渐变水珠本体 (Cross-Fade Dual Droplet Body)
                - 采用双层交叉淡入淡出（Cross-Fade）渐变动效架构，完美避免 CSS 类名切换导致的突变
                - 严格共享 LIQUID_SPRING 物理弹簧，带来 100% 丝滑连续的有机液体渐变过渡体验
                ----------------------------------------------------------------- */}
            <div className="relative w-full h-full rounded-full overflow-hidden">
              {/* 【静止态水珠外观 (Resting State)】
                  - 底部 Nav (variant === "dock"): Light 模式呈现微灰烟熏质感渐变 (from-black/5 to-black/8.5)，
                    清晰解决白底底栏上水珠不够明显的对比度痛点；Dark 模式维持优雅深邃微光。
                  - 常规 Tab (variant === "default"): 维持纯白微磨砂 (bg-white/80 dark:bg-white/[0.08])。
                  - 随 isActive 渐变淡出 (opacity: 0)，松手时渐变淡入 (opacity: 1)。 */}
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
                {/* 静止态顶部细致高光峰线 (极细微光切面，收敛投射范围) */}
                <div className="absolute top-[0.5px] inset-x-4 h-[0.75px] bg-gradient-to-r from-transparent via-white/40 dark:via-white/16 to-transparent pointer-events-none" />

                {/* 静止态顶部柔和微光反光 (高度从 40% 缩减至 18%，彻底收敛上下边缘厚度) */}
                <div
                  className={cn(
                    "absolute inset-x-2.5 top-0.5 h-[18%] rounded-full bg-gradient-to-b from-white/45 via-white/10 to-transparent pointer-events-none dark:from-white/12 dark:via-transparent",
                    config.restingSpecularClass
                  )}
                />
                {/* 静止态底部微弱漫反射 (高度从 25% 缩减至 12%，消除底部光晕上侵) */}
                <div
                  className={cn(
                    "absolute bottom-0.5 inset-x-4 h-[12%] rounded-full bg-gradient-to-t from-white/20 to-transparent pointer-events-none dark:from-white/[0.04]",
                    config.restingCausticClass
                  )}
                />
              </motion.div>

              {/* 【活跃态水珠外观 (Active State)】
                  - 真实 iOS 27 高透 3D 凸面水珠本体：极高通透度 (bg-white/20)、
                    2px 轻微透镜折射模糊、深邃立体落影与双向高光。
                  - 包含 3D 弧面聚光弧、顶部峰线高光、底部焦散聚集弧与边缘反弹线。
                  - 随 isActive 渐变淡入 (opacity: 1)，松手时平滑淡出 (opacity: 0)。 */}
              <motion.div
                className="absolute inset-0 rounded-full overflow-hidden bg-white/[0.20] dark:bg-white/[0.05] backdrop-blur-[2px] border border-black/[0.08] dark:border-white/[0.20] shadow-[0_16px_36px_-4px_rgba(0,0,0,0.18),0_4px_12px_rgba(0,0,0,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.95),inset_0_-1px_1.5px_rgba(255,255,255,0.35)] dark:shadow-[0_22px_48px_-4px_rgba(0,0,0,0.92),0_8px_20px_rgba(0,0,0,0.72),inset_0_1.5px_2px_rgba(255,255,255,0.40),inset_0_-1px_1px_rgba(255,255,255,0.12)]"
                initial={false}
                animate={{
                  opacity: isActive ? 1 : 0,
                }}
                transition={LIQUID_SPRING}
              >
                {/* 顶部弧面高光聚光带 (Curved Top Specular Arc) */}
                <div className="absolute inset-x-2 top-0.5 h-[45%] rounded-full bg-gradient-to-b from-white/70 via-white/10 to-transparent pointer-events-none dark:from-white/30 dark:via-transparent opacity-100" />

                {/* 顶部极细高光折射峰线 (Crisp Top Specular Crest Line) */}
                <div className="absolute top-[1px] inset-x-3.5 h-[1px] bg-gradient-to-r from-transparent via-white/90 dark:via-white/60 to-transparent pointer-events-none opacity-100" />

                {/* 底部焦散聚集弧 (Bottom Caustic Reflection Arc) */}
                <div className="absolute bottom-0.5 inset-x-2.5 h-[32%] rounded-full bg-gradient-to-t from-white/40 via-transparent to-transparent pointer-events-none dark:from-white/15 opacity-100" />

                {/* 底部极细边缘微光 (Crisp Bottom Rim Line) */}
                <div className="absolute bottom-[1px] inset-x-4 h-[1px] bg-gradient-to-r from-transparent via-white/60 dark:via-white/30 to-transparent pointer-events-none opacity-100" />
              </motion.div>
            </div>
          </motion.div>

          {/* =================================================================================
              📄 10.3【Layer 1: 底层灰色常态层】Base Inactive Items Grid (Z-20)
              ---------------------------------------------------------------------------------
              • 承载内容：整条导航栏所有 Tab 的灰色文字与图标 (标准尺寸 scale 1.0)
              • 裁剪算法：clipPathInactive (利用 CSS polygon(evenodd, ...) 奇偶打孔算法)
              • 核心行为：
                全底栏正常显示灰色字；唯独在当前水珠所覆盖的坐标窗口内，被若尔当曲线定理
                打出一个 100% 物理透空的圆角胶囊中空切口！
                水珠下方的灰色字 100% 物理剔除，绝对杜绝双重重影！
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
                const isItemActive = index === currentActiveIndex;
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
                        tabClassName,
                        !isActive && isItemActive && "opacity-0 pointer-events-none"
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
              🔍 10.4【Layer 2: 顶层蓝色透镜层】Active Masked Reveal Grid (Z-25)
              ---------------------------------------------------------------------------------
              • 承载内容：整条导航栏所有 Tab 的高亮蓝色文字、发光阴影与图标
              • 裁剪算法：clipPathActive (利用 CSS inset(... round 9999px) 胶囊正向裁剪窗口)
              • 核心行为：
                整屏默认 100% 裁剪隐藏，只在水珠当前所在的正向圆角窗口内显现出来！
              • 光学透镜放大物理动画：
                - 静止态 (resting): scale: 1.0, y: 0（未触摸时不突兀变大）
                - 活跃态 (isActive): scale: 1.25, y: -2px（触摸按下/拖拽时，文字宛如被凸透镜折射放大并微浮起）
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
