import type { AgentAction } from "../agents/policy.js";
import type { Recommendation } from "../agi/recommender.js";

type Product = {
  id: number;
  name: string;
  price: string;
};

type FlexMessage = {
  type: "flex";
  altText: string;
  contents: unknown;
};

export function productFlex(products: Product[]): FlexMessage {
  return {
    type: "flex",
    altText: "Recommended products",
    contents: {
      type: "carousel",
      contents: products.map((item) => ({
        type: "bubble",
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            { type: "text", text: item.name, weight: "bold" },
            { type: "text", text: `${item.price} THB` }
          ]
        },
        footer: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "button",
              style: "primary",
              action: {
                type: "postback",
                label: "Add to cart",
                data: `add:${item.id}`
              }
            }
          ]
        }
      }))
    }
  };
}

export function buildRecommendationFlex(recommendations: Recommendation[]): FlexMessage {
  return {
    type: "flex",
    altText: "AI recommendations",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          { type: "text", text: "Top picks", weight: "bold", size: "md" },
          ...recommendations.slice(0, 5).map((item) => ({
            type: "text",
            text: `${item.id} • score ${item.score.toFixed(2)}`,
            size: "sm"
          }))
        ]
      }
    }
  };
}

export function buildAgentActionFlex(action: AgentAction): FlexMessage {
  const decisionText = action.reject
    ? "Autonomous pricing paused by safety guardrails"
    : `${Math.round(action.discount * 100)}% discount${action.pick ? ` for ${action.pick}` : ""}`;

  return {
    type: "flex",
    altText: "Agent action",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          { type: "text", text: "Agent decision", weight: "bold", size: "md" },
          { type: "text", text: decisionText, wrap: true, size: "sm" }
        ]
      }
    }
  };
}

export function recommendationFlex(recommendations: Recommendation[]): FlexMessage {
  return buildRecommendationFlex(recommendations);
}

export function agentActionText(action: AgentAction): { type: "text"; text: string } {
  if (action.reject) {
    return { type: "text", text: "Autonomous pricing is paused by safety guardrails." };
  }

  const pickText = action.pick ? ` for ${action.pick}` : "";
  return {
    type: "text",
    text: `Agent action: ${Math.round(action.discount * 100)}% discount${pickText}`
  };
}

export function textMessage(text: string): { type: "text"; text: string } {
  return { type: "text", text };
}
