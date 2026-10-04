/**
 * Aqua VPS 全局版本配置中心 (Apple iOS PWA & Web Client Version Core)
 * -----------------------------------------------------------------------------
 * 当发布新功能或部署修复时，递增 APP_BUILD 或 APP_VERSION。
 * PWA 客户端在启动、定时巡检及从后台切回前台时，将向 /api/version 请求比对。
 * 若服务端 build 较新，将自动触发 CacheStorage 强力清空、ServiceWorker 注销/更新并无缝强制硬刷新！
 */

export const APP_VERSION = "1.0.0";
export const APP_BUILD = "20261004.3";
export const RELEASE_DATE = "2026-10-04";

export interface VersionInfo {
  version: string;
  build: string;
  releaseDate: string;
  serverTime?: number;
}
