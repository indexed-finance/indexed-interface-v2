export function createLookup<T extends { id: string }>(from: T[]) {
  return from.reduce(
    (prev, next) => {
      prev.ids.push(next.id);
      prev.entitites[next.id] = next;

      return prev;
    },
    {} as {
      ids: string[];
      entitites: Record<string, T>;
    }
  );
}
