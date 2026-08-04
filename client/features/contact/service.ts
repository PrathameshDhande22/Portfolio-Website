"use server";

import { headers } from "next/headers";
import { ENDPOINT, strapiClient } from "@/features/shared/service";

export interface ContactFormState {
  status: "idle" | "success" | "error";
  message: string;
  errors?: Partial<Record<"Name" | "Email" | "Message", string>>;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_MESSAGE = 1000;

export async function submitContact(
  _previous: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  if (formData.get("company")) {
    return { status: "success", message: "Thanks, your message has been sent." };
  }

  const Name = String(formData.get("Name") ?? "").trim();
  const Email = String(formData.get("Email") ?? "").trim();
  const Subject = String(formData.get("Subject") ?? "").trim();
  const Message = String(formData.get("Message") ?? "").trim();

  const errors: ContactFormState["errors"] = {};
  if (!Name) errors.Name = "Please tell me your name.";
  if (!EMAIL.test(Email)) errors.Email = "Please enter a valid email address.";
  if (!Message) errors.Message = "Please write a message.";
  else if (Message.length > MAX_MESSAGE) errors.Message = `Please keep it under ${MAX_MESSAGE} characters.`;

  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Please fix the highlighted fields.", errors };
  }

  const headerList = await headers();

  try {
    await strapiClient()
      .collection(ENDPOINT.contacts)
      .create({
        Name,
        Email,
        Subject: Subject || undefined,
        Message,
        Source: headerList.get("referer") ?? "portfolio",
        IPAddress: headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined,
        UserAgent: headerList.get("user-agent") ?? undefined,
      });

    return { status: "success", message: "Thanks, your message has been sent." };
  } catch {
    return { status: "error", message: "Something went wrong sending that. Please try again." };
  }
}
