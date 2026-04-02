import initJaegerTracer from "jaeger-client";

export function initWorkerTracer() {
  return initJaegerTracer(
    {
      serviceName: process.env.JAEGER_SERVICE_NAME ?? "zlinebot-worker",
      sampler: { type: "const", param: 1 },
      reporter: {
        logSpans: true,
        agentHost: process.env.JAEGER_AGENT_HOST ?? "jaeger-agent.observability",
        agentPort: Number(process.env.JAEGER_AGENT_PORT ?? 6831)
      }
    } as any,
    {} as any
  );
}
