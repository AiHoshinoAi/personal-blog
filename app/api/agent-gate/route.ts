import { NextResponse } from "next/server";

import { verifyAgentGate } from "@/lib/agent-gate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { password?: unknown; index?: unknown };

export async function POST(request: Request) {
  let payload: Body;

  try {
    payload = (await request.json()) as Body;
  } catch {
    return NextResponse.json(
      { ok: false, message: "请求格式不正确。" },
      { status: 400 },
    );
  }

  const candidate = typeof payload.password === "string" ? payload.password : "";
  const index =
    typeof payload.index === "number" && Number.isInteger(payload.index)
      ? payload.index
      : 0;
  const result = verifyAgentGate(request, candidate, index);

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, message: result.message },
      { status: result.status },
    );
  }

  return NextResponse.json(
    { ok: true, target: result.target },
    { status: 200, headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}

