/**
 * 主题模式：night（默认，星空可见）/ day（冷银白昼，星空隐去）。
 * 内联脚本在首次绘制前写入 data-mode，避免闪烁。
 * 默认值固定为 night，不跟随 prefers-color-scheme；用户手动切换后记住选择。
 */
export const THEME_MODES = ["night", "day"] as const;
export type ThemeMode = (typeof THEME_MODES)[number];

export const THEME_STORAGE_KEY = "hoshino-mode";

/** 浏览器地址栏 / 状态栏颜色，跟 data-mode 同步 */
export const THEME_COLORS: Record<ThemeMode, string> = {
  night: "#06080f",
  day: "#e9edf4",
};

export const themeInitScript = `(() => {
  try {
    var stored = localStorage.getItem("${THEME_STORAGE_KEY}");
    // 默认进黑夜：只有用户手动切过白天才用白天，不看系统偏好
    var mode = stored === "day" ? "day" : "night";
    document.documentElement.dataset.mode = mode;
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", mode === "day" ? "${THEME_COLORS.day}" : "${THEME_COLORS.night}");
  } catch {
    document.documentElement.dataset.mode = "night";
  }
})();`;
