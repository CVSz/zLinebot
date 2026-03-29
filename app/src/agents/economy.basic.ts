export function chooseAction<T>(actions: T[]) {
  if (actions.length === 0) {
    throw new Error("No actions available");
  }

  return actions[Math.floor(Math.random() * actions.length)];
}
