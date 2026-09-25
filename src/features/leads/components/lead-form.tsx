"use client";

import { useState, type FormEvent } from "react";
import { Button, Input } from "@/shared/ui";

export interface LeadFormProps {
  source: string;
  listingId?: string;
}

export function LeadForm({ source, listingId }: LeadFormProps) {
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-card border border-edge bg-surface p-6 text-sm text-ink">
        Thank you, an advisor will contact you soon.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-card border border-edge bg-surface p-6"
    >
      <Input name="name" label="Name" placeholder="Your name" required />
      <Input name="phone" label="Phone" placeholder="999 999 999" inputMode="tel" required />
      <Input name="email" label="Email" type="email" placeholder="you@mail.com" />
      <input type="hidden" name="source" value={source} />
      <input type="hidden" name="listingId" value={listingId ?? ""} />
      <Button type="submit">Request information</Button>
    </form>
  );
}