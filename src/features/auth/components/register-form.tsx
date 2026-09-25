"use client";

import { useState, type FormEvent } from "react";
import { Button, Input } from "@/shared/ui";

export interface RegisterFormProps {
  source?: string;
}

export function RegisterForm({ source = "public" }: RegisterFormProps) {
  const [notice, setNotice] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("Registration will connect to the authentication backend.");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Input name="name" label="Name" placeholder="Your name" required />
      <Input name="email" type="email" label="Email" placeholder="you@mail.com" required />
      <Input name="password" type="password" label="Password" placeholder="••••••" required />
      <input type="hidden" name="source" value={source} />
      {notice ? <p className="text-sm text-muted">{notice}</p> : null}
      <Button type="submit" size="lg" className="w-full">
        Create account
      </Button>
    </form>
  );
}