"use server";

import { headers } from "next/headers";
import { ENDPOINT, strapiClient } from "@/features/shared/service";
import { EMAIL_PATTERN, MAX_MESSAGE, type ContactFormState, type ContactInput } from "./constants";

export async function submitContact(input: ContactInput): Promise<ContactFormState> {
  if (input.company) {
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

    return { status: "success", message: "Thanks, your message has been sent." };
  } catch {
    return { status: "error", message: "Something went wrong sending that. Please try again." };
  }
}
