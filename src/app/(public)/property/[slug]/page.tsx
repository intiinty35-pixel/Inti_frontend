import type { Metadata } from "next";
import { Container } from "@/shared/ui";
import { buildMetadata } from "@/shared/lib/seo";

export interface PropertyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const { slug } = await params;

  return buildMetadata({
    title: `Property in ${slug.replace(/-/g, " ")}`,
    description: "Property details.",
    path: `/property/${slug}`,
  });
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { slug } = await params;

  return (
    <Container className="flex flex-1 flex-col gap-6 py-12">
      <h1 className="font-display text-3xl font-semibold text-ink">
        {slug.replace(/-/g, " ")}
      </h1>
      <div className="h-72 w-full rounded-card bg-surface-muted" aria-hidden />
      <div className="rounded-card border border-dashed border-edge bg-surface-muted p-10 text-center text-sm text-muted">
        Property details will be loaded from NEXT_PUBLIC_API_URL.
      </div>
    </Container>
  );
}