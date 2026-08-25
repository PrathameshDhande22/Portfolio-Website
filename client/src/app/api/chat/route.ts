import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { signRequest } from "@/lib/signature";
import type { ChatAskRequest } from "@/types/chat";

const ONE_HOUR_MS = 60 * 60 * 1000;

const seen = new Map<string, number>();

function isDuplicate(requestId: string): boolean {
  const now = Date.now();
  for (const [id, at] of seen) {
    if (now - at > ONE_HOUR_MS) seen.delete(id);
  }
  if (seen.has(requestId)) return true;
  seen.set(requestId, now);
  return false;
}

export async function POST(request: NextRequest) {
  let ask: ChatAskRequest;
  try {
    ask = (await request.json()) as ChatAskRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (
    !ask.requestId ||
    !Array.isArray(ask.messages) ||
    ask.messages.length === 0
  ) {
    return NextResponse.json(
      { error: "requestId and messages are required" },
      { status: 400 },
    );
  }

  if (isDuplicate(ask.requestId)) {
    return NextResponse.json(
      { error: "Request already sent" },
      { status: 409 },
    );
  }

  const body = JSON.stringify({
    thread_id: ask.threadId ?? randomUUID(),
    messages: ask.messages.map((turn) => ({
      role: turn.role,
      content: turn.content,
    })),
  });

  const upstream = await fetch(`${env.assistantUrl}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...signRequest("POST", "/chat", body),
    },
    body,
  });

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json(
      { error: "The assistant is unavailable" },
      { status: upstream.status === 409 ? 409 : 502 },
    );
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
