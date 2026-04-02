export type CompiledStep =
  | { type: "action"; action: string; message?: string }
  | { type: "condition"; field: string; operator: string; value: string };

export function compileFlow(flow: any): { steps: CompiledStep[] } {
  const steps: CompiledStep[] = [];

  for (const node of flow?.nodes ?? []) {
    if (node.type === "action") {
      steps.push({
        type: "action",
        action: String(node.data?.action ?? "send_message"),
        message: node.data?.message ? String(node.data.message) : undefined
      });
    }

    if (node.type === "condition") {
      steps.push({
        type: "condition",
        field: String(node.data?.field ?? "text"),
        operator: String(node.data?.operator ?? "contains"),
        value: String(node.data?.value ?? "")
      });
    }
  }

  return { steps };
}
