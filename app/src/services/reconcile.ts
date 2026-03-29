type LedgerEntry = {
  amount: number;
  type: "debit" | "credit";
};

export function reconcile(entries: LedgerEntry[]) {
  const sum = entries.reduce((total, entry) => {
    return total + (entry.type === "credit" ? entry.amount : -entry.amount);
  }, 0);

  if (Math.abs(sum) > 1e-9) {
    throw new Error("Ledger imbalance");
  }

  return true;
}
