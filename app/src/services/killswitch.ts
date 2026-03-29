let halted = false;

export function enableKill(): void {
  halted = true;
}

export function disableKill(): void {
  halted = false;
}

export function isHalted(): boolean {
  return halted;
}
