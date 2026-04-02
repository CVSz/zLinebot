export function compileFlow(flow: any) {
  const steps: any[] = [];

  for (const node of flow.nodes ?? []) {
    if (node.type === "action") {
      steps.push({
        type: "action",
        action: node.data.action,
        message: node.data.message
      });
    }

    if (node.type === "condition") {
      steps.push({
        type: "condition",
        field: node.data.field,
        operator: node.data.operator,
        value: node.data.value
      });
    }
  }

  return { steps };
}
