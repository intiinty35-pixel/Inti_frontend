import { AreaIcon, BathIcon, BedIcon, CarIcon } from "@/shared/ui/icons";
import { cn } from "@/shared/lib/cn";
import { formatArea, formatBathrooms, formatParking, formatRooms } from "@/shared/lib/format";
import type { Listing } from "@/features/listings/types/listing";

export interface ListingSpecsProps {
  listing: Listing;
  className?: string;
}

export function ListingSpecs({ listing, className }: ListingSpecsProps) {
  const specs = [
    { key: "area", icon: <AreaIcon className="size-3.5" />, text: formatArea(listing.areaM2) },
    { key: "rooms", icon: <BedIcon className="size-3.5" />, text: formatRooms(listing.rooms) },
    { key: "bathrooms", icon: <BathIcon className="size-3.5" />, text: formatBathrooms(listing.bathrooms) },
    {
      key: "parking",
      icon: <CarIcon className="size-3.5" />,
      text: formatParking(listing.parkingSpaces ?? 0),
    },
  ].filter((spec) => spec.text.length > 0);

  if (specs.length === 0) {
    return null;
  }

  return (
    <ul
      className={cn(
        "flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-[11px] font-semibold text-muted",
        className,
      )}
    >
      {specs.map((spec) => (
        <li key={spec.key} className="flex items-center gap-1.5">
          <span aria-hidden className="text-brand/55">
            {spec.icon}
          </span>
          {spec.text}
        </li>
      ))}
    </ul>
  );
}
