"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { LuArrowUp } from "react-icons/lu";
import { AiAvatar } from "./ai-avatar";
import { ChatMarkdown } from "./chat-markdown";
import { useChat, type ChatActivity } from "../use-chat";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AiSettings } from "@/types/content";

const WARNING = "Answers are AI generated and can be incomplete.";

function activityLabel(activity: ChatActivity): string {
  switch (activity.kind) {
    case "planning":
      return "Working out what to look up…";
    case "reading": {
      const parts = [...activity.sources];
      if (activity.semantic) parts.push("resume and articles");
      return parts.length ? `Reading ${parts.join(", ")}…` : "Searching…";
    }
    case "writing":
      return "Writing the answer…";
  }
}

interface AskAiPanelProps {
  settings: AiSettings;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AskAiPanel({ settings, open, onOpenChange }: AskAiPanelProps) {
  const { messages, busy, ask } = useChat();
  const [draft, setDraft] = useState("");
  const scroller = useRef<HTMLDivElement>(null);
  const pinned = useRef(true);

  useEffect(() => {
    const element = scroller.current;
    if (element && pinned.current) element.scrollTop = element.scrollHeight;
  }, [messages]);

  function trackScroll(event: React.UIEvent<HTMLDivElement>) {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    pinned.current = scrollHeight - scrollTop - clientHeight < 80;
  }

  function send(question: string) {
    if (!question.trim() || busy) return;
    pinned.current = true;
    void ask(question);
    setDraft("");
  }

  const prompts = (settings.ExistingMessage ?? []).filter((prompt) => prompt.Text);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[min(90dvh,720px)] w-full max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 nav:max-w-3xl">
        <header className="flex items-center gap-2 border-b border-line px-5 py-4">
          <span className="size-2 rounded-full bg-accent" aria-hidden />
          <DialogTitle className="font-display text-[0.95rem] font-semibold tracking-[-0.02em] text-ink">
            {settings.TopTitle}
          </DialogTitle>
        </header>

        <div ref={scroller} onScroll={trackScroll} className="flex-1 overflow-y-auto px-5 py-8">
          <div className="mx-auto max-w-[46ch]">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
              >
                <AiAvatar />
                <h2 className="mb-2 font-display text-[clamp(1.4rem,3vw,1.9rem)] leading-[1.15] font-semibold tracking-[-0.03em] text-ink">
                  {settings.Header}
                </h2>
                {settings.Description ? (
                  <DialogDescription className="mb-6 text-[0.95rem] leading-[1.65] text-ink-2">
                    {settings.Description}
                  </DialogDescription>
                ) : null}

                <ul className="m-0 flex list-none flex-col items-start gap-2 p-0">
                  {prompts.map((prompt, index) => (
                    <motion.li
                      key={prompt.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.35, delay: 0.25 + index * 0.09 }}
                    >
                      <Button variant="secondary" size="sm" onClick={() => send(prompt.Text!)}>
                        {prompt.Text}
                      </Button>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ) : (
              <ul className="m-0 flex list-none flex-col gap-4 p-0">
                {messages.map((message) =>
                  message.role === "human" ? (
                    <li key={message.id} className="text-right">
                      <span className="inline-block max-w-[85%] rounded-tile bg-accent px-4 py-3 text-left text-[0.9rem] leading-[1.6] text-accent-ink">
                        {message.text}
                      </span>
                    </li>
                  ) : (
                    <li key={message.id}>
                      <div className="inline-block max-w-[85%] rounded-tile border border-line bg-surface-2 px-4 py-3 text-left text-[0.9rem] leading-[1.6] text-ink-2">
                        {message.activity ? (
                          <p
                            aria-live="polite"
                            className="mb-2 flex items-center gap-2 text-[0.78rem] text-ink-3"
                          >
                            <span className="size-1.5 animate-pulse rounded-full bg-accent" aria-hidden />
                            {activityLabel(message.activity)}
                          </p>
                        ) : null}
                        <ChatMarkdown content={message.text} />
                      </div>
                    </li>
                  ),
                )}
              </ul>
            )}
          </div>
        </div>

        <footer className="border-t border-line px-5 py-4">
          <form
            className="mx-auto flex max-w-[46ch] flex-col gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              send(draft);
            }}
          >
            <div className="flex items-center gap-2">
              <Input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={settings.SendMessagePlaceholder ?? "Ask a question…"}
                aria-label={settings.SendMessagePlaceholder ?? "Ask a question"}
              />
              <Button type="submit" variant="primary" size="icon" aria-label="Send">
                <LuArrowUp />
              </Button>
            </div>
            <p className="text-center text-[0.74rem] text-ink-3">{WARNING}</p>
          </form>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
