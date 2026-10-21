import type { Listing } from "../types/listing";

export function uniqueProjectListings(listings: Listing[]): Listing[] {
  const ids = new Set<string>();
  const slugs = new Set<string>();
  return listings.filter(project => {
    if (project.type !== 'projects') return false;
    const slug = project.slug.trim().toLowerCase();
    if (ids.has(project.id) || (slug && slugs.has(slug))) return false;
    ids.add(project.id);
    if (slug) slugs.add(slug);
    return true;
  });
}

