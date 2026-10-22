import { env } from '@/shared/lib/env';
import type { Listing, PagedResult } from '../types/listing';
import { LandDirectory } from './land-directory';

export async function LandDirectorySection({ operation }: { operation: 'buy' | 'rent' }) {
  const items: Listing[] = [];
  let loadError = false;
  async function load(page: number): Promise<PagedResult<Listing>> {
    const query = new URLSearchParams({ operationType: operation === 'rent' ? 'RENT' : 'SALE', propertyType: 'LAND', page: String(page), pageSize: '50', sort: 'recent' });
    const response = await fetch(`${env.backendUrl}/properties?${query}`, { headers: { Accept: 'application/json' }, next: { revalidate: 60 } });
    if (!response.ok) throw new Error('No se pudieron cargar los terrenos.');
    return await response.json() as PagedResult<Listing>;
  }
  try {
    const first = await load(1);
    items.push(...first.items);
    const pages = Math.ceil(first.total / first.pageSize);
    for (let start = 2; start <= pages; start += 4) {
      const results = await Promise.all(Array.from({ length: Math.min(4, pages - start + 1) }, (_, index) => load(start + index)));
      items.push(...results.flatMap(result => result.items));
    }
  } catch { loadError = true; }
  return <LandDirectory listings={[...new Map(items.map(item => [item.id, item])).values()]} operation={operation} loadError={loadError} />;
}
