"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { Eye } from "@phosphor-icons/react/dist/ssr/Eye";
import { EyeSlash } from "@phosphor-icons/react/dist/ssr/EyeSlash";
import { LockKey } from "@phosphor-icons/react/dist/ssr/LockKey";

type Status = "idle" | "pending" | "error" | "success";

const GATE_ENDPOINT = "/api/agent-gate";
const REDIRECT_DELAY = 420;

export function AgentGateButton({
  index,
  label,
  primary = false,
}: {
  index: number;
  label: string;
  primary?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    // 关闭后把焦点还给入口按钮
    requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  const base =
    "group/gate relative inline-flex max-w-full items-center gap-3 px-6 py-3.5 text-[15px] font-medium transition-[transform,background-color,border-color,color] duration-300 active:translate-y-[1px] md:px-7 md:text-base";

  const skin = primary
    ? "border border-accent bg-accent text-accent-ink hover:bg-accent-text"
    : "border border-line-strong text-ink hover:border-accent hover:text-accent-text";

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className={`${base} ${skin}`}
        style={
          primary
            ? {
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.28), 0 18px 46px -22px color-mix(in oklab, var(--accent) 70%, transparent)",
              }
            : undefined
        }
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <LockKey size={18} weight={primary ? "bold" : "light"} aria-hidden className="shrink-0" />
        <span className="truncate" title={label}>{label}</span>
        <span
          aria-hidden
          className="h-px w-6 shrink-0 bg-current opacity-45 transition-[width,opacity] duration-500 group-hover/gate:w-10 group-hover/gate:opacity-80"
        />
      </button>

      <AgentGateDialog index={index} label={label} open={open} onClose={close} />
    </>
  );
}

function AgentGateDialog({
  index,
  label,
  open,
  onClose,
}: {
  index: number;
  label: string;
  open: boolean;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  // 挂到 body 上再画：入口按钮的父级带有 transform 入场动画，
  // 那会成为 fixed 的包含块，把弹窗困在按钮那一格里。
  useEffect(() => setMounted(true), []);
  const titleId = useId();
  const descId = useId();
  const inputId = useId();

  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [value, setValue] = useState("");
  const [reveal, setReveal] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [shake, setShake] = useState(0);

  // 打开时锁滚动、聚焦输入框；关闭时清理
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFrame = requestAnimationFrame(() => inputRef.current?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        "button:not([disabled]), input, a[href], [tabindex]:not([tabindex='-1'])",
      );
      if (focusable.length === 0) return;

      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      cancelAnimationFrame(focusFrame);
    };
  }, [open, onClose]);

  // 组件卸载时清掉待执行的跳转
  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const reset = useCallback(() => {
    setValue("");
    setReveal(false);
    setStatus("idle");
    setMessage("");
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "pending" || status === "success") return;

    if (value.trim().length === 0) {
      setStatus("error");
      setMessage("请先输入口令。");
      setShake((n) => n + 1);
      return;
    }

    setStatus("pending");
    setMessage("");

    try {
      const response = await fetch(GATE_ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password: value, index }),
      });
      const data = (await response.json()) as {
        ok: boolean;
        target?: string;
        message?: string;
      };

      if (!response.ok || !data.ok || !data.target) {
        setStatus("error");
        setMessage(data.message ?? "口令不正确。");
        setShake((n) => n + 1);
        inputRef.current?.select();
        return;
      }

      setStatus("success");
      setMessage("口令正确，正在进入。");
      const target = data.target;
      timerRef.current = setTimeout(() => {
        window.location.assign(target);
      }, REDIRECT_DELAY);
    } catch {
      setStatus("error");
      setMessage("网络似乎不太稳定，再试一次。");
      setShake((n) => n + 1);
    }
  };

  const busy = status === "pending" || status === "success";

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center px-4 pb-6 sm:items-center sm:pb-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.24 }}
        >
          <button
            type="button"
            aria-label="关闭口令窗口"
            className="gate-veil absolute inset-0 h-full w-full cursor-default"
            onClick={() => {
              if (status !== "success") onClose();
            }}
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            className="gate-panel relative w-full max-w-[440px]"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.985 }}
            animate={
              reduce
                ? { opacity: 1 }
                : { opacity: 1, y: 0, scale: 1, x: shake ? [0, -9, 7, -4, 0] : 0 }
            }
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.99 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <h2
                  id={titleId}
                  className="text-[26px] font-medium leading-tight tracking-[-0.02em] text-ink"
                >
                  {label}
                </h2>
                <p id={descId} className="mt-2 text-[14px] leading-relaxed text-muted">
                  输入访问口令，进入「{label}」。
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={busy}
                className="mt-1 shrink-0 border border-line px-2.5 py-1 text-[12px] tracking-[0.08em] text-faint transition-colors duration-300 hover:border-line-strong hover:text-ink disabled:opacity-40"
              >
                ESC
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-2">
              <label
                htmlFor={inputId}
                className="text-[13px] font-medium text-ink"
              >
                访问口令
              </label>

              <div className="relative">
                <input
                  id={inputId}
                  name="password"
                  type={reveal ? "text" : "password"}
                  value={value}
                  onChange={(event) => {
                    setValue(event.target.value);
                    if (status === "error") {
                      setStatus("idle");
                      setMessage("");
                    }
                  }}
                  autoComplete="current-password"
                  spellCheck={false}
                  disabled={busy}
                  aria-invalid={status === "error"}
                  aria-describedby={message ? `${descId}-error` : undefined}
                  className="w-full border border-line-strong bg-deep px-4 py-3.5 pr-12 text-[16px] tracking-[0.06em] text-ink transition-colors duration-300 placeholder:tracking-normal placeholder:text-faint hover:border-line-strong focus:border-accent focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60"
                  style={{ fontFamily: "var(--font-mono)" }}
                />
                <button
                  type="button"
                  onClick={() => setReveal((v) => !v)}
                  disabled={busy}
                  aria-label={reveal ? "隐藏口令" : "显示口令"}
                  className="absolute top-1/2 right-3 -translate-y-1/2 p-1.5 text-faint transition-colors duration-300 hover:text-ink disabled:opacity-40"
                >
                  {reveal ? (
                    <EyeSlash size={18} weight="light" aria-hidden />
                  ) : (
                    <Eye size={18} weight="light" aria-hidden />
                  )}
                </button>
              </div>

              <p
                id={`${descId}-error`}
                aria-live="polite"
                className={
                  status === "error"
                    ? "text-[13px] leading-relaxed text-accent-text"
                    : "text-[13px] leading-relaxed text-faint"
                }
              >
                {message || "口令由服务器下发，浏览器里看不到目标地址。"}
              </p>

              <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  disabled={busy}
                  className="group/submit inline-flex flex-1 items-center justify-center gap-2.5 whitespace-nowrap border border-accent bg-accent px-5 py-3 text-[15px] font-medium text-accent-ink transition-[transform,background-color] duration-300 hover:bg-accent-text active:translate-y-[1px] disabled:cursor-default disabled:opacity-90"
                >
                  {status === "success" ? "正在进入" : "进入"}
                  <ArrowRight
                    size={17}
                    weight="bold"
                    aria-hidden
                    className="transition-transform duration-300 group-hover/submit:translate-x-1"
                  />
                </button>
                {status === "success" ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (timerRef.current) clearTimeout(timerRef.current);
                      reset();
                      onClose();
                    }}
                    className="whitespace-nowrap px-2 py-3 text-[13px] text-faint underline decoration-line-strong underline-offset-4 transition-colors hover:text-ink"
                  >
                    取消跳转
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (timerRef.current) clearTimeout(timerRef.current);
                      reset();
                      onClose();
                    }}
                    className="whitespace-nowrap px-2 py-3 text-[13px] text-faint transition-colors hover:text-ink"
                  >
                    稍后再说
                  </button>
                )}
              </div>
            </form>

            {/* 校验中的细线进度：不转圈，不遮挡内容 */}
            <div className="mt-5 h-px w-full overflow-hidden bg-line" aria-hidden>
              <motion.div
                className={
                  status === "success"
                    ? "h-px w-full origin-left bg-accent"
                    : "h-px w-full origin-left bg-accent/70"
                }
                initial={false}
                animate={{
                  scaleX:
                    status === "pending"
                      ? [0, 0.28, 0.55, 0.78]
                      : status === "success"
                        ? 1
                        : 0,
                }}
                transition={
                  status === "pending"
                    ? { duration: 1.4, ease: "easeOut" }
                    : { duration: 0.4, ease: "easeOut" }
                }
              />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
