export function log(level: string, msg: string, meta: Record<string, unknown> = {}): void {
  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      level,
      msg,
      ...meta
    })
  );
}
