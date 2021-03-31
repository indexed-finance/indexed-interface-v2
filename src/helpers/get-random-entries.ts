import cloneDeep from "lodash.clonedeep";

// Fisher-Yates Shuffle.
// https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
function shuffle(array: any[]) {
  let currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

export function getRandomEntries<T>(amount: number, from: T[]): T[] {
  if (from.length < amount) {
    throw new Error(
      `getRandomEntries requires an amount equal to or less than the provided array.`
    );
  }

  const cloned = cloneDeep(from);
  const values: T[] = [];

  while (values.length < amount) {
    shuffle(cloned);
    values.push(cloned.shift()!);
  }

  return values;
}
