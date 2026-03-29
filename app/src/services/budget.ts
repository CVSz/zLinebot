let budget = 100000;

export function setBudget(value: number): void {
  budget = Math.max(0, value);
}

export function spend(amount: number): void {
  if (budget - amount < 0) {
    throw new Error("Budget exceeded");
  }
  budget -= amount;
}

export function remainingBudget(): number {
  return budget;
}
