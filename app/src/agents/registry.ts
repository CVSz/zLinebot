const agents = new Map<string, (input: unknown) => Promise<unknown> | unknown>();

export function register(name: string, fn: (input: unknown) => Promise<unknown> | unknown) {
  agents.set(name, fn);
}

export async function run(name: string, input: unknown) {
  const agent = agents.get(name);

  if (!agent) {
    throw new Error(`Agent '${name}' not found`);
  }

  return agent(input);
}
