import { ContactForm } from "./contact-form";
import type { ContactFormLabels } from "@/types/components";

export function ContactFormBlock({ blocks }: { blocks: ContactFormLabels[] }) {
  const labels = blocks[0];
  if (!labels) return null;

  return <ContactForm labels={labels} />;
}
