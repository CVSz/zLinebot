export type CorrFn = (a: string, b: string) => number;

export function buildGraph(vars: string[], corr: CorrFn): Array<[string, string]> {
  const edges: Array<[string, string]> = [];

  for (let i = 0; i < vars.length; i += 1) {
    for (let j = i + 1; j < vars.length; j += 1) {
      const c = Math.abs(corr(vars[i], vars[j]));
      if (c > 0.2) {
        edges.push([vars[i], vars[j]]);
      }
    }
  }

  return edges;
}
