import { formatPrice } from "./format";
import { LOT_PLAN_LABELS, type PlanLot } from "./site-plan";

export function lotHoverSummary(lot: PlanLot, currency?: string) {
  return {
    title: `Lote ${lot.code}${lot.block ? `, Manzana ${lot.block}` : ""}`,
    price: currency && lot.cashAllowed && lot.price > 0 ? formatPrice(lot.price, currency) : undefined,
    priceM2: currency && lot.cashAllowed && lot.priceM2 > 0 ? `${formatPrice(lot.priceM2, currency)} / m²` : undefined,
    detail: `${lot.areaM2} m² · ${LOT_PLAN_LABELS[lot.status]}`,
  };
}
