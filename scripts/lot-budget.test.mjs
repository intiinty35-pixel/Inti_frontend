import test from "node:test";
import assert from "node:assert/strict";
import { findBudgetLots } from "../src/shared/lib/lot-budget.ts";

const lot = (id, price, extra = {}) => ({
  id, code: id, status: "AVAILABLE", price, cashAllowed: true,
  financingAllowed: false, monthlyPayment: 0, ...extra,
});

test("cash matches stay within budget, ordered nearest first; nearby options are explicit", () => {
  const result = findBudgetLots([
    lot("A", 20000), lot("B", 25000), lot("C", 27000), lot("D", 27500), lot("E", 28000),
  ], { mode: "CASH", amount: "25000" });
  assert.deepEqual(result.matches.map(l => l.id), ["B", "A"]);
  assert.deepEqual(result.nearby.map(l => l.id), ["C", "D"]);
  assert.equal(result.cheapest.id, "A");
});

test("financing compares published monthly payments, not total prices or initial payments", () => {
  const result = findBudgetLots([
    lot("A", 50000, { financingAllowed: true, monthlyPayment: 500, downPayment: 10000 }),
    lot("B", 20000, { financingAllowed: true, monthlyPayment: 900 }),
    lot("C", 10000, { financingAllowed: false, monthlyPayment: 300 }),
    lot("D", 10000, { financingAllowed: true, monthlyPayment: 0 }),
  ], { mode: "FINANCED", amount: "600" });
  assert.deepEqual(result.matches.map(l => l.id), ["A"]);
  assert.deepEqual(result.nearby, []);
});

test("unavailable lots and missing or disallowed cash prices never enter results", () => {
  const result = findBudgetLots([
    lot("sold", 100, { status: "SOLD" }), lot("reserved", 100, { status: "RESERVED" }),
    lot("blocked", 100, { status: "BLOCKED" }), lot("no-cash", 100, { cashAllowed: false }),
    lot("zero", 0), lot("invalid", NaN), lot("valid", 20000),
  ], { mode: "CASH", amount: "" });
  assert.deepEqual(result.matches.map(l => l.id), ["valid"]);
});

test("empty or invalid budgets return eligible options with no nearby suggestions", () => {
  for (const amount of ["", "0", "-1", "invalid", "Infinity"]) {
    const result = findBudgetLots([lot("B", 30000), lot("A", 20000)], { mode: "CASH", amount });
    assert.deepEqual(result.matches.map(l => l.id), ["A", "B"]);
    assert.equal(result.hasBudget, false);
    assert.deepEqual(result.nearby, []);
  }
});

test("low budgets do not treat substantially more expensive lots as approximate matches", () => {
  const result = findBudgetLots([lot("A", 25000)], { mode: "CASH", amount: "1000" });
  assert.deepEqual(result.matches, []);
  assert.deepEqual(result.nearby, []);
  assert.equal(result.cheapest.id, "A");
});
