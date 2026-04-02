import initJaegerTracer from "jaeger-client";

export function initTracer() {
  const config = {
    serviceName: process.env.JAEGER_SERVICE_NAME ?? "zlinebot-api",
    sampler: { type: "const", param: 1 },
    reporter: {
      logSpans: true,
      agentHost: process.env.JAEGER_AGENT_HOST ?? "jaeger-agent.observability",
      agentPort: Number(process.env.JAEGER_AGENT_PORT ?? 6831)
    }
  };

  return initJaegerTracer(config as any, {} as any);
}
