export type Amount = {
  exactAsString: string;
  displayed: string;
};

export type TimeLockData = {
  id: string;
  owner: string;
  createdAt: number;
  ndxAmount: string;
  duration: number;
  dndxShares: string;
};