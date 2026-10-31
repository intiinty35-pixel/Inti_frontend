const integerFormatter = new Intl.NumberFormat("es-BO", { maximumFractionDigits: 0 });

const CURRENCY_SYMBOLS: Record<string, string> = {
  PEN: "S/",
  USD: "$",
};

export function formatNumber(value: number): string {
  return integerFormatter.format(value);
}

export function formatPrice(amount: number, currency = "PEN"): string {
  const symbol = CURRENCY_SYMBOLS[currency];

  return symbol ? `${symbol} ${formatNumber(amount)}` : formatNumber(amount);
}

export function formatArea(areaM2: number): string {
  return areaM2 > 0 ? `${formatNumber(areaM2)} m²` : "";
}

export function formatRooms(rooms: number): string {
  return rooms > 0 ? `${rooms} dorm.` : "";
}

export function formatBathrooms(bathrooms: number): string {
  return bathrooms > 0 ? `${bathrooms} baños` : "";
}

export function formatParking(parkingSpaces: number): string {
  return parkingSpaces > 0 ? `${parkingSpaces} estac.` : "";
}
