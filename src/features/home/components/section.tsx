import type { ReactNode } from "react";
import { Container } from "@/shared/ui";
import { cn } from "@/shared/lib/cn";

export interface HomeSectionProps {
  children: ReactNode;
  id?: string;
  className?: string;
}

/** Bloque vertical del home con el gutter reducido (`wide-tight`). */
export function HomeSection({ children, id, className }: HomeSectionProps) {
  return (
    <section id={id} className={cn("py-12 sm:py-16", className)}>
      <Container size="wide-tight">{children}</Container>
    </section>
  );
}

export interface SectionHeadingProps {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: ReactNode;
}

export function SectionHeading({ title, description, eyebrow, action }: SectionHeadingProps) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        {eyebrow ? (
          <p className="mb-2 text-[11px] font-bold tracking-[0.18em] text-accent uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-3xl font-light tracking-tight text-brand sm:text-4xl">{title}</h2>
        {description ? <p className="mt-2 text-sm text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
