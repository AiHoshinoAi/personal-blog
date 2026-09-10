"use client";

import { useEffect, useRef } from "react";
import { useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";

/**
 * 星野：整页的底层视觉。固定图层，不参与滚动布局。
 * - 三层视差 + 极慢的周日自转（pivot 在画面外上方，模拟星空绕极轴转）
 * - 银河带：沿一条斜线做高斯散布的暗星
 * - 偶发流星：每页只此一个循环动效，作为品牌签名
 * - prefers-reduced-motion：只画一次静态星空，无流星
 * - 白天模式：--star-alpha 归零，循环直接跳过绘制
 */

type Star = {
  x: number;
  y: number;
  r: number;
  a: number;
  phase: number;
  freq: number;
  warm: boolean;
  layer: 0 | 1 | 2;
};

type Meteor = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  len: number;
  born: number;
  life: number;
};

const PAD = 220;
const SPIN = 5e-8; // rad / ms
const LAYER_DEPTH = [0.32, 0.66, 1] as const;
const LAYER_SPIN = [0.4, 0.75, 1] as const;

/** 固定种子：每次刷新都是同一片天空，而不是随机噪声。 */
function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(rand: () => number) {
  let u = 0;
  let v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function buildSky(w: number, h: number): Star[] {
  const rand = mulberry32(20260522);
  const total = Math.round(
    Math.max(220, Math.min(680, (w * h) / 2900)),
  );
  const bandStars = Math.round(total * 0.44);
  const stars: Star[] = [];

  const ax = -0.12 * w;
  const ay = 0.8 * h;
  const bx = 1.1 * w;
  const by = 0.16 * h;
  const dx = bx - ax;
  const dy = by - ay;
  const dLen = Math.hypot(dx, dy) || 1;
  const nx = -dy / dLen;
  const ny = dx / dLen;
  const sigma = h * 0.1;

  const pickLayer = (r: number): 0 | 1 | 2 =>
    r < 0.52 ? 0 : r < 0.84 ? 1 : 2;

  for (let i = 0; i < total - bandStars; i += 1) {
    const layer = pickLayer(rand());
    stars.push({
      x: -PAD + rand() * (w + PAD * 2),
      y: -PAD + rand() * (h + PAD * 2),
      r: (0.32 + rand() * rand() * 1.9) * (layer === 2 ? 1.25 : 1),
      a: (0.26 + rand() * 0.62) * (layer === 2 ? 1.1 : 0.9),
      phase: rand() * Math.PI * 2,
      freq: 0.35 + rand() * 1.5,
      warm: rand() > 0.82,
      layer,
    });
  }

  // 银河带：更密、更暗、偏冷
  for (let i = 0; i < bandStars; i += 1) {
    const t = rand();
    const off = gaussian(rand) * sigma;
    const layer = pickLayer(rand() * 0.9);
    stars.push({
      x: ax + dx * t + nx * off + gaussian(rand) * 26,
      y: ay + dy * t + ny * off + gaussian(rand) * 26,
      r: 0.3 + rand() * rand() * 1.3,
      a: 0.14 + rand() * 0.4,
      phase: rand() * Math.PI * 2,
      freq: 0.4 + rand() * 1.2,
      warm: rand() > 0.9,
      layer,
    });
  }

  return stars;
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.trim().replace("#", "");
  if (clean.length === 3) {
    return [
      parseInt(clean[0]!, 16) * 17,
      parseInt(clean[1]!, 16) * 17,
      parseInt(clean[2]!, 16) * 17,
    ];
  }
  const full = clean.slice(0, 6);
  return [
    parseInt(full.slice(0, 2), 16) || 255,
    parseInt(full.slice(2, 4), 16) || 255,
    parseInt(full.slice(4, 6), 16) || 255,
  ];
}

export function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  const scrollProgress = useRef(0);
  const { scrollYProgress } = useScroll();
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    scrollProgress.current = value;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const root = document.documentElement;
    const pointer = { x: 0, y: 0, easedX: 0, easedY: 0 };

    let stars: Star[] = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let elapsed = 0;
    let cold = "255,255,255";
    let warm = "240,182,79";
    let visible = true;
    let raf = 0;
    let start = performance.now();
    let meteor: Meteor | null = null;
    let nextMeteorAt = 4200;

    const readTokens = () => {
      const style = getComputedStyle(root);
      const accent = style.getPropertyValue("--accent");
      const [r, g, b] = hexToRgb(accent || "#f0b64f");
      warm = `${r},${g},${b}`;
      visible = Number(style.getPropertyValue("--star-alpha") || "1") > 0.02;
      if (!visible) ctx.clearRect(0, 0, width, height);
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      stars = buildSky(width, height);
      if (reduce) render(performance.now());
    };

    const spawnMeteor = (now: number) => {
      const fromLeft = Math.random() > 0.45;
      // 速度单位 px / ms，尾部长度单位 px
      const speed = 0.55 + Math.random() * 0.5;
      meteor = {
        x: fromLeft
          ? -120 + Math.random() * width * 0.5
          : width + 120 - Math.random() * width * 0.5,
        y: height * (0.02 + Math.random() * 0.4),
        vx: fromLeft ? speed : -speed,
        vy: speed * (0.48 + Math.random() * 0.34),
        len: 110 + Math.random() * 120,
        born: now,
        life: 780 + Math.random() * 620,
      };
    };

    function drawStar(s: Star, alphaScale: number) {
      if (!ctx) return;
      const twinkle = reduce ? 1 : 0.62 + 0.38 * Math.sin(elapsed * s.freq * 0.001 + s.phase);
      const alpha = Math.max(0, Math.min(1, s.a * twinkle * alphaScale));
      if (alpha < 0.012) return;

      ctx.fillStyle = `rgba(${s.warm ? warm : cold},${alpha.toFixed(3)})`;

      if (s.r < 0.75) {
        ctx.fillRect(s.x, s.y, s.r * 1.7, s.r * 1.7);
        return;
      }

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();

      // 亮星带一点十字星芒
      if (s.r > 1.35 && alpha > 0.42) {
        const arm = s.r * 7.5;
        ctx.strokeStyle = `rgba(${s.warm ? warm : cold},${(alpha * 0.3).toFixed(3)})`;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(s.x - arm, s.y);
        ctx.lineTo(s.x + arm, s.y);
        ctx.moveTo(s.x, s.y - arm);
        ctx.lineTo(s.x, s.y + arm);
        ctx.stroke();
      }
    }

    const render = (now: number) => {
      elapsed = now - start;
      const scroll = scrollProgress.current;

      if (!visible) {
        raf = window.requestAnimationFrame(render);
        return;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const pivotX = width * 0.86;
      const pivotY = -height * 1.2;
      const baseAngle = reduce ? 0 : elapsed * SPIN;

      pointer.easedX += (pointer.x - pointer.easedX) * 0.045;
      pointer.easedY += (pointer.y - pointer.easedY) * 0.045;

      for (let layer = 0; layer < 3; layer += 1) {
        const depth = LAYER_DEPTH[layer];
        ctx.save();
        ctx.translate(
          pivotX + pointer.easedX * depth * 16,
          pivotY - scroll * 54 * depth + pointer.easedY * depth * 12,
        );
        ctx.rotate(baseAngle * LAYER_SPIN[layer]);
        ctx.translate(-pivotX, -pivotY);

        for (const s of stars) {
          if (s.layer !== layer) continue;
          drawStar(s, 1);
        }
        ctx.restore();
      }

      if (!reduce) {
        if (!meteor && elapsed > nextMeteorAt) spawnMeteor(elapsed);

        if (meteor) {
          const age = elapsed - meteor.born;
          const t = age / meteor.life;
          if (t >= 1) {
            meteor = null;
            nextMeteorAt = elapsed + 7000 + Math.random() * 11000;
          } else {
            const env = Math.sin(Math.PI * t);
            const headX = meteor.x + meteor.vx * age;
            const headY = meteor.y + meteor.vy * age;
            const speed = Math.hypot(meteor.vx, meteor.vy) || 1;
            const tailX = headX - (meteor.vx / speed) * meteor.len;
            const tailY = headY - (meteor.vy / speed) * meteor.len;
            const grad = ctx.createLinearGradient(tailX, tailY, headX, headY);
            grad.addColorStop(0, `rgba(${cold},0)`);
            grad.addColorStop(0.72, `rgba(${cold},${(0.24 * env).toFixed(3)})`);
            grad.addColorStop(1, `rgba(${warm},${(0.85 * env).toFixed(3)})`);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.25;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(tailX, tailY);
            ctx.lineTo(headX, headY);
            ctx.stroke();
          }
        }
      }

      raf = window.requestAnimationFrame(render);
    };

    readTokens();
    resize();

    const onPointerMove = (event: PointerEvent) => {
      if (reduce) return;
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
    };

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 180);
    };

    const onVisibility = () => {
      if (document.hidden) {
        window.cancelAnimationFrame(raf);
        return;
      }
      start = performance.now() - elapsed;
      raf = window.requestAnimationFrame(render);
    };

    const observer = new MutationObserver(readTokens);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-mode", "style", "class"],
    });

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    if (!reduce) raf = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      observer.disconnect();
    };
  }, [reduce]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0"
      style={{
        zIndex: -1,
        opacity: "var(--star-alpha)",
        transition: "opacity 900ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
