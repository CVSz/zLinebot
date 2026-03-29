let requestsTotal = 0;

export function inc(): void {
  requestsTotal += 1;
}

export function metrics(): string {
  return `# TYPE requests_total counter\nrequests_total ${requestsTotal}\n`;
}
