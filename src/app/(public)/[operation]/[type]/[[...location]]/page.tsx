import type { Metadata } from "next";
import { Container } from "@/shared/ui";
import { getOperationLabel, getPropertyTypeLabel } from "@/features/search";
import { buildMetadata } from "@/shared/lib/seo";

export interface SearchPageParams {
  operation: string;
  type: string;
  location?: string[];
}

export interface SearchPageProps {
  params: Promise<SearchPageParams>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: SearchPageProps): Promise<Metadata> {
  const { operation, type } = await params;

  return buildMetadata({
    title: `${getOperationLabel(operation)} ${getPropertyTypeLabel(type)}`,
    description: "Browse real estate listings in Peru.",
    path: `/${operation}/${type}`,
  });
}

export default async function SearchResultsPage({ params }: SearchPageProps) {
  const { operation, type, location = [] } = await params;
  const title = `${getOperationLabel(operation)} ${getPropertyTypeLabel(type)}`;

  return (
    <Container className="flex flex-1 flex-col gap-6 py-12">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted">
          {location.length > 0 ? location.join(", ") : "Peru"}
        </p>
        <h1 className="font-display text-3xl font-semibold text-ink">{title}</h1>
      </div>
      <div className="rounded-card border border-dashed border-edge bg-surface-muted p-10 text-center text-sm text-muted">
        Listings will be loaded from NEXT_PUBLIC_API_URL.
      </div>
    </Container>
  );
}