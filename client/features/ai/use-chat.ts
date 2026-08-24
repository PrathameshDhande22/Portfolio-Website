"use client";

import { useCallback, useRef, useState } from "react";
import { EventSourceParserStream } from "eventsource-parser/stream";
import type { ChatEvent, ChatTurn, PlanEvent } from "@/types/chat";

export type ChatActivity =
  | { kind: "planning" }
  | { kind: "reading"; sources: string[]; semantic: boolean }
  | { kind: "writing" };

export interface ChatMessage {
  id: string;
  role: "human" | "assistant";
  text: string;
  activity?: ChatActivity;
}

const UNAVAILABLE = "Something went wrong reaching the assistant. Please try again.";

function describe(plan: PlanEvent): ChatActivity {
  if (plan.action === "respond") return { kind: "writing" };
  return { kind: "reading", sources: plan.sources, semantic: plan.semantic };
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const threadId = useRef<string | null>(null);
  const sending = useRef(false);

  const ask = useCallback(
    async (question: string) => {
      const trimmed = question.trim();
      if (!trimmed || sending.current) return;
      sending.current = true;
      setBusy(true);

      const answerId = crypto.randomUUID();
      const history: ChatTurn[] = [
        ...messages.map((message) => ({ role: message.role, content: message.text })),
        { role: "human" as const, content: trimmed },
      ];

      setMessages((current) => [
        ...current,
        { id: crypto.randomUUID(), role: "human", text: trimmed },
        { id: answerId, role: "assistant", text: "", activity: { kind: "planning" } },
      ]);

      const update = (change: Partial<ChatMessage>, append?: string) =>
        setMessages((current) =>
          current.map((message) =>
            message.id === answerId
              ? { ...message, ...change, text: append ? message.text + append : message.text }
              : message,
          ),
        );

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requestId: crypto.randomUUID(),
            threadId: threadId.current,
            messages: history,
          }),
        });

        if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`);

        const reader = response.body
          .pipeThrough(new TextDecoderStream())
          .pipeThrough(new EventSourceParserStream())
          .getReader();

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const parsed = { event: value.event, data: JSON.parse(value.data) } as ChatEvent;

          if (parsed.event === "meta") threadId.current = parsed.data.thread_id;
          else if (parsed.event === "plan") update({ activity: describe(parsed.data) });
          else if (parsed.event === "delta")
            update({ activity: { kind: "writing" } }, parsed.data.content);
          else if (parsed.event === "error") update({}, parsed.data.message);
        }
      } catch {
        update({}, UNAVAILABLE);
      } finally {
        update({ activity: undefined });
        setBusy(false);
        sending.current = false;
      }
    },
    [messages],
  );

  return { messages, busy, ask };
}
