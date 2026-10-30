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
  sideImage?: string;
  cardWidth?: keyof typeof CARD_WIDTHS;
  centeredBackground?: boolean;
  showCardLogo?: boolean;
  children: ReactNode;
}

export function AuthShell({
  headline,
  description,
  sideImage,
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
        <aside
          className={cn(
            "relative flex flex-col overflow-hidden bg-brand px-8 py-8 text-white lg:sticky lg:top-0 lg:h-screen lg:px-14 lg:py-12",
            sideImage && "min-h-[280px] px-6 py-6 sm:px-8 sm:py-8 lg:min-h-0",
          )}
        >
          {sideImage ? (
            <>
              <Image
                src={sideImage}
                alt=""
                fill
                priority
                sizes="(max-width: 1023px) 100vw, 42vw"
                className="object-cover"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-br from-brand/90 via-brand/70 to-brand/35"
              />
            </>
          ) : null}

          <div className="relative z-10 my-6 flex flex-1 flex-col items-center justify-center text-center lg:my-10">
            <Link
              href={ROUTES.home}
              className={cn(
                "mb-6 flex items-center justify-center rounded-xl",
                sideImage && "bg-white/95 px-5 py-3 shadow-lg",
              )}
              aria-label="Inti Proyectos"
            >
              <Image
                src="/logo/logo.png"
                alt="Inti Proyectos"
                width={280}
                height={78}
                className="h-14 w-auto sm:h-16"
                style={{ width: "auto" }}
              />
            </Link>
            <p className="mb-3 text-[11px] font-bold tracking-[0.18em] text-accent lg:mb-4">INTI PROYECTOS</p>
            <h1 className="max-w-2xl text-3xl leading-[1.05] font-light tracking-tight sm:text-4xl lg:text-[3.2rem]">
              {headline}
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/85 lg:mt-5">{description}</p>
            <ul className="mt-5 hidden flex-col items-start gap-2.5 text-left text-xs text-white/90 lg:mt-8 lg:flex">
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
            © 2026 Inti Proyectos
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
            ? "relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-6 sm:py-12"
            : cn(
                "flex items-center justify-center bg-canvas px-4 py-10 sm:px-8",
                sideImage && "py-7 sm:py-10",
              ),
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
            "relative z-10 w-full border border-edge bg-surface shadow-[var(--shadow-card)]",
            centeredBackground
              ? "rounded-card p-5 pt-12 sm:p-9 sm:pt-16"
              : cn("rounded-2xl p-7 sm:p-9", showCardLogo && "pt-14 sm:pt-16"),
            sideImage &&
              "rounded-2xl p-5 shadow-[0_24px_70px_rgb(11_20_55_/_0.14)] sm:rounded-3xl sm:p-9",
            CARD_WIDTHS[cardWidth],
          )}
        >
          {showCardLogo ? (
            <Link
              href={ROUTES.home}
              className="mb-6 flex w-full justify-center"
              aria-label="Inti Proyectos"
            >
              <Image
                src="/logo/logo.png"
                alt="Inti Proyectos"
                width={180}
                height={50}
                className="h-10 w-auto"
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
  return <h2 className="mt-2 text-2xl font-light tracking-tight text-brand sm:text-3xl">{children}</h2>;
}

export function AuthSubtitle({ children }: { children: ReactNode }) {
  return <p className="mt-2 mb-4 text-xs text-muted sm:mb-6">{children}</p>;
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
