import type { ReactNode } from "react";
import Link from "next/link";
import { Container } from "@/shared/ui/container";
import { ROUTES } from "@/shared/config/routes";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-edge bg-surface">
        <Container className="flex h-16 items-center justify-between">
          <Link href={ROUTES.home} className="font-display text-xl font-semibold text-brand">
            Ariz
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href={ROUTES.search({ operation: "buy", type: "houses" })}>Buy</Link>
            <Link href={ROUTES.search({ operation: "rent", type: "apartments" })}>
              Rent
            </Link>
            <Link href={ROUTES.login}>Sign in</Link>
          </nav>
        </Container>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
      <footer className="border-t border-edge bg-surface">
        <Container className="flex h-14 items-center justify-between text-sm text-muted">
          <span>Ariz</span>
          <span>© {new Date().getFullYear()} Ariz</span>
        </Container>
      </footer>
    </div>
  );
}