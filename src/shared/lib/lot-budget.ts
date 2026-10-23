import type { PlanLot } from "./site-plan";

export type LotBudgetFilter = { mode: "CASH" | "FINANCED"; amount: string };
export function lotBudgetAmount(lot: PlanLot, mode: LotBudgetFilter["mode"]) {
  return mode === "CASH" ? lot.price : lot.monthlyPayment;
}

export function findBudgetLots(lots: PlanLot[], filter: LotBudgetFilter) {
  const budget = Number(filter.amount);
  const hasBudget = Number.isFinite(budget) && budget > 0;
  const eligible = lots.filter(lot => {
    const amount = lotBudgetAmount(lot, filter.mode);
    return lot.status === "AVAILABLE" && Number.isFinite(amount) && amount > 0 &&
      (filter.mode === "CASH" ? lot.cashAllowed : lot.financingAllowed);
  }).sort((a, b) => lotBudgetAmount(a, filter.mode) - lotBudgetAmount(b, filter.mode) || a.code.localeCompare(b.code, "es", { numeric: true }));
  const matches = eligible.filter(lot => !hasBudget || lotBudgetAmount(lot, filter.mode) <= budget);
  if (hasBudget) matches.sort((a, b) => lotBudgetAmount(b, filter.mode) - lotBudgetAmount(a, filter.mode));
  const nearby = hasBudget ? eligible.filter(lot => {
    const amount = lotBudgetAmount(lot, filter.mode);
    return amount > budget && amount <= budget * 1.1;
  }).slice(0, 3) : [];
  return { matches, nearby, cheapest: eligible[0], hasBudget };
}
