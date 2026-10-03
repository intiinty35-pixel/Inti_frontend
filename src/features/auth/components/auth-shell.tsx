import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";

const BULLETS = [
  "Propiedades y proyectos verificados",
  "Favoritos, alertas y consultas en un solo lugar",
  "Una cuenta para toda la plataforma",
] as const;

const CARD_WIDTHS = {
  sm: "max-w-[430px]",
  md: "max-w-[560px]",
  lg: "max-w-[620px]",
} as const;

export interface AuthShellProps {
  headline: string;
  description: string;
  cardWidth?: keyof typeof CARD_WIDTHS;
  centeredBackground?: boolean;
  showCardLogo?: boolean;
  children: ReactNode;
}

export function AuthShell({
  headline,
  description,
  cardWidth = "sm",
  centeredBackground = false,
  showCardLogo = false,
  children,
}: AuthShellProps) {
  return (
    <div
      className={cn(
        "min-h-screen",
        centeredBackground ? "relative" : "grid grid-cols-1 lg:grid-cols-[42%_1fr]",
      )}
    >
      {!centeredBackground ? (
        <aside className="relative flex flex-col overflow-hidden bg-brand px-8 py-8 text-white lg:sticky lg:top-0 lg:h-screen lg:px-14 lg:py-12">
          <Link href={ROUTES.home} className="flex items-center gap-2.5" aria-label="Ariz Proyectos">
            <Image
              src="/logo/logo.png"
              alt="Ariz Proyectos"
              width={144}
              height={40}
              className="h-9 w-auto"
              style={{ width: "auto" }}
            />
          </Link>

          <div className="relative z-10 my-10 flex flex-1 flex-col justify-center lg:my-0">
            <p className="mb-4 text-[11px] font-bold tracking-[0.18em] text-accent">ARIZ PROYECTOS</p>
            <h1 className="text-4xl leading-[1.05] font-light tracking-tight sm:text-5xl lg:text-[3.6rem]">
              {headline}
            </h1>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/70">{description}</p>
            <ul className="mt-8 hidden flex-col gap-2.5 text-xs text-white/80 lg:flex">
              {BULLETS.map((bullet) => (
                <li key={bullet} className="flex items-center gap-2">
                  <span aria-hidden className="text-accent">
                    ✓
                  </span>
                  {bullet}
                </li>
              ))}
            </ul>
          </div>

          <p className="relative z-10 hidden text-[10px] text-white/45 lg:block">
            © 2026 Ariz Proyectos
          </p>

          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -bottom-72 size-[560px] rounded-full border-[90px] border-white/[0.06]"
          />
        </aside>
      ) : null}

      <main
        className={cn(
          centeredBackground
            ? "relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12"
            : "flex items-center justify-center bg-canvas px-4 py-10 sm:px-8",
        )}
      >
        {centeredBackground ? (
          <>
            <Image
              src="/home/2.jpg"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div aria-hidden className="absolute inset-0 bg-brand/65" />
          </>
        ) : null}
        <div
          className={cn(
            "relative z-10 w-full border border-edge bg-surface p-7 shadow-[var(--shadow-card)] sm:p-9",
            centeredBackground ? "rounded-card" : "rounded-2xl",
            showCardLogo && "pt-14 sm:pt-16",
            CARD_WIDTHS[cardWidth],
          )}
        >
          {showCardLogo ? (
            <Link
              href={ROUTES.home}
              className="absolute -top-1 left-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
              aria-label="Ariz Proyectos"
            >
              <Image
                src="/logo/logo.png"
                alt="Ariz Proyectos"
                width={144}
                height={40}
                className="h-8 w-auto drop-shadow-[0_0_2px_rgb(255_255_255_/_0.95)]"
                style={{ width: "auto" }}
              />
            </Link>
          ) : null}
          {children}
        </div>
      </main>
    </div>
  );
}

export function AuthEyebrow({ children }: { children: ReactNode }) {
  return <p className="text-[11px] font-bold tracking-[0.18em] text-accent">{children}</p>;
}

export function AuthTitle({ children }: { children: ReactNode }) {
  return <h2 className="mt-2 text-3xl font-light tracking-tight text-brand">{children}</h2>;
}

export function AuthSubtitle({ children }: { children: ReactNode }) {
  return <p className="mt-2 mb-6 text-xs text-muted">{children}</p>;
}

export function AuthAlert({ messages }: { messages: string[] }) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <div role="alert" className="rounded-card bg-error/10 px-3.5 py-2.5 text-sm text-error">
      {messages.length === 1 ? (
        messages[0]
      ) : (
        <ul className="list-disc pl-4">
          {messages.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
