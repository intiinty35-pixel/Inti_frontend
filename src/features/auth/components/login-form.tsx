"use client";

import { useState, type FormEvent } from "react";
import { Button, Input } from "@/shared/ui";

export interface LoginFormProps {
  source?: string;
}

export function LoginForm({ source = "panel" }: LoginFormProps) {
  const [notice, setNotice] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("Sign in will connect to the authentication backend.");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Input name="email" type="email" label="Email" placeholder="you@mail.com" required />
      <Input name="password" type="password" label="Password" placeholder="••••••" required />
      <input type="hidden" name="source" value={source} />
      {notice ? <p className="text-sm text-muted">{notice}</p> : null}
      <Button type="submit" size="lg" className="w-full">
        Sign in
      </Button>
    </form>
  );
}