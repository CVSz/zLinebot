export function uplift(treatment: { conv: number; n: number }, control: { conv: number; n: number }) {
  if (treatment.n <= 0 || control.n <= 0) {
    return 0;
  }

  return treatment.conv / treatment.n - control.conv / control.n;
}
