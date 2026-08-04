"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { LuArrowUp } from "react-icons/lu";
import { AiAvatar } from "./ai-avatar";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AiSettings } from "@/types/content";

const UNAVAILABLE = "Answers are not wired up yet — reach out through the contact page in the meantime.";

interface Message {
  id: number;
  role: "you" | "ai";
  text: string;
}

interface AskAiPanelProps {
  settings: AiSettings;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AskAiPanel({ settings, open, onOpenChange }: AskAiPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");

  function ask(question: string) {
    const trimmed = question.trim();
    if (!trimmed) return;

    setMessages((current) => [
      ...current,
      { id: current.length, role: "you", text: trimmed },
      { id: current.length + 1, role: "ai", text: UNAVAILABLE },
    ]);
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

        <div className="flex-1 overflow-y-auto px-5 py-8">
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
                      <Button variant="secondary" size="sm" onClick={() => ask(prompt.Text!)}>
                        {prompt.Text}
                      </Button>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ) : (
              <ul className="m-0 flex list-none flex-col gap-4 p-0">
                {messages.map((message) => (
                  <li key={message.id} className={message.role === "you" ? "text-right" : ""}>
                    <span
                      className={`inline-block max-w-[85%] rounded-tile px-4 py-3 text-left text-[0.9rem] leading-[1.6] ${
                        message.role === "you"
                          ? "bg-accent text-accent-ink"
                          : "border border-line bg-surface-2 text-ink-2"
                      }`}
                    >
                      {message.text}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <footer className="border-t border-line px-5 py-4">
          <form
            className="mx-auto flex max-w-[46ch] flex-col gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              ask(draft);
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
            {settings.Warning ? (
              <p className="text-center text-[0.74rem] text-ink-3">{settings.Warning}</p>
            ) : null}
          </form>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
