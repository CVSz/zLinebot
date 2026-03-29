export type CausalEdge = [string, string];

export function doIntervene(graph: CausalEdge[], varName: string, _value: number): CausalEdge[] {
  return graph.filter(([, to]) => to !== varName);
}
