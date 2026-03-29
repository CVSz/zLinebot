type EventInput = {
  uid_hash: string;
  product_id: string;
  ts: number;
  signal: string;
};

export function minimize(event: EventInput): { uid: string; pid: string; ts: number; signal: string } {
  return {
    uid: event.uid_hash,
    pid: event.product_id,
    ts: event.ts,
    signal: event.signal
  };
}
