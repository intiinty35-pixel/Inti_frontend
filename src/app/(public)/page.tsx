import { Suspense } from "react";
import Link from "next/link";
import { Container } from "@/shared/ui";
import { SearchForm } from "@/features/search";
import { ROUTES } from "@/shared/config/routes";
import { buildMetadata } from "@/shared/lib/seo";

export const metadata = buildMetadata({
  title: "Ariz — Homes and apartments in Peru",
  description:
    "Real estate portal to find homes, apartments, land and projects in Peru.",
  path: "/",
});

function SearchFormFallback() {
  return <div className="h-[76px] rounded-card border border-edge bg-surface" />;
}

const QUICK_SEARCHES = [
  {
    label: "Buy apartments",
    href: ROUTES.search({ operation: "buy", type: "apartments" }),
  },
  {
    label: "Rent houses",
    href: ROUTES.search({ operation: "rent", type: "houses" }),
  },
  {
    label: "Invest in projects",
    href: ROUTES.search({ operation: "invest", type: "projects" }),
  },
];

export default function PublicHomePage() {
  return (
    <Container className="flex flex-1 flex-col gap-14 py-16">
      <section className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
        <h1 className="font-display text-[var(--font-display-size)] font-semibold leading-tight text-ink">
          Find your next home
        </h1>
        <p className="max-w-xl text-lg text-muted">
          Homes, apartments, land and projects across Peru.
        </p>
      </section>

      <Suspense fallback={<SearchFormFallback />}>
        <SearchForm />
      </Suspense>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-muted">Popular searches</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {QUICK_SEARCHES.map((quick) => (
            <Link
              key={quick.href}
              href={quick.href}
              className="rounded-card border border-edge bg-surface p-4 text-sm font-medium text-ink transition-colors hover:border-brand"
            >
              {quick.label}
            </Link>
          ))}
        </div>
      </section>
    </Container>
  );
}