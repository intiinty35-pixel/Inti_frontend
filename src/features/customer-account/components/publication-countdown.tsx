"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getCountdown(expiresAt: string, now: number): CountdownParts {
  const secondsRemaining = Math.max(
    0,
    Math.floor((new Date(expiresAt).getTime() - now) / 1000),
  );
  return {
    days: Math.floor(secondsRemaining / 86_400),
    hours: Math.floor((secondsRemaining % 86_400) / 3_600),
    minutes: Math.floor((secondsRemaining % 3_600) / 60),
    seconds: secondsRemaining % 60,
  };
}

function twoDigits(value: number): string {
  return String(value).padStart(2, "0");
}

export function PublicationCountdown({
  expiresAt,
  label = "Tiempo restante",
}: {
  expiresAt: string;
  label?: string;
}) {
  const router = useRouter();
  const [countdown, setCountdown] = useState<CountdownParts | null>(null);
  const refreshed = useRef(false);

  useEffect(() => {
    const update = () => setCountdown(getCountdown(expiresAt, Date.now()));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [expiresAt]);

  useEffect(() => {
    if (!countdown || countdown.days + countdown.hours + countdown.minutes + countdown.seconds > 0) {
      return;
    }
    if (refreshed.current) return;
    refreshed.current = true;
    router.refresh();
  }, [countdown, router]);

  if (countdown && countdown.days + countdown.hours + countdown.minutes + countdown.seconds === 0) {
    return (
      <p role="status" className="text-sm font-semibold text-error">
        El periodo de publicación terminó.
      </p>
    );
  }

  const parts: Array<{ label: string; value: number }> = [
    { label: "Días", value: countdown?.days ?? 0 },
    { label: "Horas", value: countdown?.hours ?? 0 },
    { label: "Min", value: countdown?.minutes ?? 0 },
    { label: "Seg", value: countdown?.seconds ?? 0 },
  ];

  return (
    <div aria-live="off" aria-label={`${label}${countdown ? `, ${countdown.days} días restantes` : ""}`}>
      <p className="text-xs font-semibold text-muted">{label}</p>
      <div className="mt-2 grid grid-cols-4 gap-2">
        {parts.map((part) => (
          <div
            key={part.label}
            className="rounded-lg border border-edge bg-surface px-2 py-2 text-center"
          >
            <p className="font-display text-xl font-black tabular-nums text-brand">
              {twoDigits(part.value)}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted">
              {part.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
