export type CorrFn = (a: string, b: string) => number;

export function buildGraph(vars: string[], corr: CorrFn): Array<[string, string]> {
  const edges: Array<[string, string]> = [];

  for (let i = 0; i < vars.length; i += 1) {
    for (let j = i + 1; j < vars.length; j += 1) {
      const left = vars[i];
      const right = vars[j];
      if (!left || !right) {
        continue;
      }
      const c = Math.abs(corr(left, right));
      if (c > 0.2) {
        edges.push([left, right]);
      }
    }
  }

  return edges;
}
