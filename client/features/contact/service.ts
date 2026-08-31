"use server";

import { cookies, headers } from "next/headers";
import { ENDPOINT, strapiClient } from "@/features/shared/service";
import {
  EMAIL_PATTERN,
  MAX_MESSAGE,
  SENT_COOKIE,
  SENT_WINDOW_MS,
  type ContactFormState,
  type ContactInput,
} from "./constants";

export async function submitContact(input: ContactInput): Promise<ContactFormState> {
  if (input.company) {
    return { status: "success", message: "Thanks, your message has been sent." };
  }

  const cookieStore = await cookies();
  if (cookieStore.get(SENT_COOKIE)) {
    return { status: "success", message: "Thanks, your message has been sent." };
  }

  const Name = input.Name?.trim() ?? "";
  const Email = input.Email?.trim() ?? "";
  const Message = input.Message?.trim() ?? "";
  const Subject = input.Subject?.trim();

  if (!Name || !EMAIL_PATTERN.test(Email) || !Message || Message.length > MAX_MESSAGE) {
    return { status: "error", message: "That submission was not valid. Please check the fields and try again." };
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

    cookieStore.set(SENT_COOKIE, String(Date.now()), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: SENT_WINDOW_MS / 1000,
      path: "/",
    });

    return { status: "success", message: "Thanks, your message has been sent." };
  } catch {
    return { status: "error", message: "Something went wrong sending that. Please try again." };
  }
}
