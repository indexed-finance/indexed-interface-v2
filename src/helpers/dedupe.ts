export default function dedupe<T>(stuff: T[]): T[] {
  return Array.from(new Set([...stuff]));
}
