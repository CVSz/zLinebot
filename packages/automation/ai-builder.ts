import OpenAI from "openai";

type FlowStep =
  | {
      type: "condition";
      field: string;
      operator: "equals" | "contains" | "starts_with" | "ends_with";
      value: string;
    }
  | {
      type: "action";
      action: "reply";
      message: string;
    }
  | {
      type: "action";
      action: "delay";
      ms: number;
    };

export type AutomationFlow = {
  steps: FlowStep[];
};

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateFlow(prompt: string): Promise<AutomationFlow> {
  const res = await client.chat.completions.create({
    model: process.env.OPENAI_FLOW_MODEL ?? "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Convert user request into JSON automation flow.

Allowed format:
{
  "steps": [
    { "type": "condition", "field": "message", "operator": "contains", "value": "hello" },
    { "type": "action", "action": "reply", "message": "Hi" },
    { "type": "action", "action": "delay", "ms": 5000 }
  ]
}

Rules:
- Return valid JSON only.
- Keep steps deterministic.
- Delay must be in milliseconds.`
      },
      { role: "user", content: prompt }
    ]
  });

  const content = res.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Model did not return a flow.");
  }

  const parsed = JSON.parse(content) as Partial<AutomationFlow>;
  if (!Array.isArray(parsed.steps)) {
    throw new Error("Invalid flow: missing steps[]");
  }

  return { steps: parsed.steps as FlowStep[] };
}
