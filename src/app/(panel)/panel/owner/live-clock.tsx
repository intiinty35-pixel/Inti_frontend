"use client";

import { useEffect, useState } from "react";

const TIME = new Intl.DateTimeFormat("es-PE", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

export function LiveClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-[11px] font-bold text-success">
      <span aria-hidden className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-pulse rounded-full bg-success opacity-60" />
        <span className="relative inline-flex size-2 rounded-full bg-success" />
      </span>
      En tiempo real · {TIME.format(now)}
    </span>
  );
}