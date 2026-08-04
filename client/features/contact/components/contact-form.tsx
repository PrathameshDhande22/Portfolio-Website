"use client";

import { useActionState, useId, useState } from "react";
import { useFormStatus } from "react-dom";
import { submitContact, type ContactFormState } from "../service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Icon } from "@/features/shared/components/icon";
import type { ButtonLink, ContactFormLabels } from "@/types/components";

const INITIAL: ContactFormState = { status: "idle", message: "" };
const MAX_MESSAGE = 1000;

function SubmitButton({ button }: { button: ButtonLink | null }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant={button?.Variant ?? "primary"} disabled={pending}>
      {pending ? <Spinner className="size-3.75" /> : button?.Icon ? <Icon name={button.Icon} /> : null}
      {button?.Text ?? "Send message"}
    </Button>
  );
}

export function ContactForm({ labels }: { labels: ContactFormLabels }) {
  const [state, action] = useActionState(submitContact, INITIAL);
  const [count, setCount] = useState(0);
  const id = useId();

  if (state.status === "success") {
    return (
      <p role="status" className="rounded-tile border border-accent bg-accent-soft px-4 py-3 text-[0.9rem] text-accent">
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} className="grid max-w-140 gap-5" noValidate>
      <div className="grid gap-2">
        <Label htmlFor={`${id}-name`}>{labels.YourName}</Label>
        <Input id={`${id}-name`} name="Name" autoComplete="name" aria-invalid={Boolean(state.errors?.Name)} />
        {state.errors?.Name ? <small className="text-[0.78rem] text-red-500">{state.errors.Name}</small> : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`${id}-email`}>{labels.EmailText}</Label>
        <Input
          id={`${id}-email`}
          name="Email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(state.errors?.Email)}
        />
        {state.errors?.Email ? <small className="text-[0.78rem] text-red-500">{state.errors.Email}</small> : null}
      </div>

      {labels.Subject ? (
        <div className="grid gap-2">
          <Label htmlFor={`${id}-subject`}>{labels.Subject}</Label>
          <Input id={`${id}-subject`} name="Subject" />
        </div>
      ) : null}

      <div className="grid gap-2">
        <Label htmlFor={`${id}-message`} className="justify-between">
          {labels.Message}
          <span className={`text-[0.74rem] ${count > MAX_MESSAGE ? "text-red-500" : "text-ink-3"}`}>
            {count} / {MAX_MESSAGE}
          </span>
        </Label>
        <Textarea
          id={`${id}-message`}
          name="Message"
          maxLength={MAX_MESSAGE}
          onChange={(event) => setCount(event.target.value.length)}
          aria-invalid={Boolean(state.errors?.Message)}
        />
        {state.errors?.Message ? (
          <small className="text-[0.78rem] text-red-500">{state.errors.Message}</small>
        ) : null}
      </div>

      <div aria-hidden className="absolute left-[-9999px]">
        <label htmlFor={`${id}-company`}>Company</label>
        <input id={`${id}-company`} name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <SubmitButton button={labels.SendMessage} />
      </div>

      {state.status === "error" && !state.errors ? (
        <p role="alert" className="text-[0.85rem] text-red-500">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
