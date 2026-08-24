"use client";

import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PROSE_COMPONENTS } from "@/features/shared/components/markdown-components";

const REMARK = [remarkGfm];

interface ChatMarkdownProps {
  content: string;
}

export const ChatMarkdown = memo(function ChatMarkdown({ content }: ChatMarkdownProps) {
  return (
    <ReactMarkdown remarkPlugins={REMARK} components={PROSE_COMPONENTS}>
      {content}
    </ReactMarkdown>
  );
});
