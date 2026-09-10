"use client";

import { useEffect, useState } from "react";
import { MoonStars } from "@phosphor-icons/react/dist/ssr/MoonStars";
import { Sun } from "@phosphor-icons/react/dist/ssr/Sun";

import { THEME_COLORS, THEME_STORAGE_KEY, type ThemeMode } from "@/lib/theme";

const LABEL: Record<ThemeMode, string> = {
  night: "切换到白天",
  day: "切换到夜晚",
};

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("night");

  // 首屏配色由 <head> 里的内联脚本决定，这里只同步状态，不改样式
  useEffect(() => {
    const current = document.documentElement.dataset.mode;
    if (current === "day" || current === "night") setMode(current);
  }, []);

  const next: ThemeMode = mode === "night" ? "day" : "night";

  const toggle = () => {
    document.documentElement.dataset.mode = next;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", THEME_COLORS[next]);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* 隐私模式下忽略 */
    }
    setMode(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={LABEL[next]}
      className="relative grid h-9 w-9 place-items-center border border-line text-muted transition-colors duration-300 hover:border-line-strong hover:text-ink active:translate-y-[1px]"
    >
      {/* 两个图标都在 DOM 里，靠 data-mode 切换：没有 JS 也能显示正确的那个 */}
      <span className="toggle-glyph" aria-hidden>
        <MoonStars size={17} weight="light" className="toggle-night" />
        <Sun size={17} weight="light" className="toggle-day" />
      </span>
    </button>
  );
}
