"use client";

import { useEffect, useId, useState } from "react";
import { useForm } from "react-hook-form";
import { submitContact } from "../service";
import {
  EMAIL_PATTERN,
  MAX_MESSAGE,
  SENT_STORAGE_KEY,
  SENT_WINDOW_MS,
  type ContactFormState,
  type ContactInput,
} from "../constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Icon } from "@/features/shared/components/icon";
import type { ContactFormLabels } from "@/types/components";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <small role="alert" className="text-[0.78rem] text-danger">
      {message}
    </small>
  );
}

export function ContactForm({ labels }: { labels: ContactFormLabels }) {
  const [result, setResult] = useState<ContactFormState | null>(null);
  const [alreadySent, setAlreadySent] = useState(false);
  const id = useId();

  useEffect(() => {
    try {
      const sentAt = Number(window.localStorage.getItem(SENT_STORAGE_KEY));
      setAlreadySent(Boolean(sentAt) && Date.now() - sentAt < SENT_WINDOW_MS);
    } catch {
      setAlreadySent(false);
    }
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({ mode: "onBlur" });

  const messageLength = watch("Message")?.length ?? 0;

  async function onSubmit(values: ContactInput) {
    const response = await submitContact(values);
    setResult(response);

    if (response.status === "success") {
      reset();
      try {
        window.localStorage.setItem(SENT_STORAGE_KEY, String(Date.now()));
      } catch {
        setAlreadySent(true);
      }
    }
  }

  const notice =
    result?.status === "success"
      ? result.message
      : alreadySent
        ? "You have already sent a message today. Please try again tomorrow."
        : null;

  if (notice) {
    return (
      <p role="status" className="rounded-tile border border-accent bg-accent-soft px-4 py-3 text-[0.9rem] text-accent">
        {notice}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid max-w-140 gap-5" noValidate>
      <div className="grid gap-2">
        <Label htmlFor={`${id}-name`}>{labels.YourName}</Label>
        <Input
          id={`${id}-name`}
          autoComplete="name"
          aria-invalid={Boolean(errors.Name)}
          {...register("Name", { required: "Please tell me your name." })}
        />
        <FieldError message={errors.Name?.message} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`${id}-email`}>{labels.EmailText}</Label>
        <Input
          id={`${id}-email`}
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(errors.Email)}
          {...register("Email", {
            required: "Please enter your email address.",
            pattern: { value: EMAIL_PATTERN, message: "Please enter a valid email address." },
          })}
        />
        <FieldError message={errors.Email?.message} />
      </div>

      {labels.Subject ? (
        <div className="grid gap-2">
          <Label htmlFor={`${id}-subject`}>{labels.Subject}</Label>
          <Input id={`${id}-subject`} {...register("Subject")} />
        </div>
      ) : null}

      <div className="grid gap-2">
        <Label htmlFor={`${id}-message`} className="justify-between">
          {labels.Message}
          <span className={`text-[0.74rem] ${messageLength > MAX_MESSAGE ? "text-danger" : "text-ink-3"}`}>
            {messageLength} / {MAX_MESSAGE}
          </span>
        </Label>
        <Textarea
          id={`${id}-message`}
          aria-invalid={Boolean(errors.Message)}
          {...register("Message", {
            required: "Please write a message.",
            maxLength: { value: MAX_MESSAGE, message: `Please keep it under ${MAX_MESSAGE} characters.` },
          })}
        />
        <FieldError message={errors.Message?.message} />
      </div>

      <div aria-hidden className="absolute left-[-9999px]">
        <label htmlFor={`${id}-company`}>Company</label>
        <input id={`${id}-company`} tabIndex={-1} autoComplete="off" {...register("company")} />
      </div>

      <div>
        <Button type="submit" variant={labels.SendMessage?.Variant ?? "primary"} disabled={isSubmitting}>
          {isSubmitting ? (
            <Spinner className="size-3.75" />
          ) : labels.SendMessage?.Icon ? (
            <Icon name={labels.SendMessage.Icon} />
          ) : null}
          {labels.SendMessage?.Text ?? "Send message"}
        </Button>
      </div>

      {result?.status === "error" ? (
        <p role="alert" className="text-[0.85rem] text-danger">
          {result.message}
        </p>
      ) : null}
    </form>
  );
}
