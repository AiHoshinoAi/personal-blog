"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * 滚动入场。
 *
 * 服务端渲染出来的 HTML 始终是「可见」的：隐藏类只在客户端挂载之后、
 * 且确认元素还在首屏之外时才加上。于是无 JS、爬虫、截图工具都能看到完整内容，
 * 首屏元素也不会先闪一下再消失。
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children?: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver === "undefined") return;

    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) return;

    node.classList.add("is-armed");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          node.classList.add("is-lit");
          node.classList.remove("is-armed");
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.1 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className ? `reveal ${className}` : "reveal"}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}
