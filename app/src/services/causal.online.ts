export type Stat = { t: number; c: number; t_conv: number; c_conv: number };

export function uplift(stat: Stat): number {
  const p_t = stat.t_conv / Math.max(1, stat.t);
  const p_c = stat.c_conv / Math.max(1, stat.c);
  return p_t - p_c;
}
