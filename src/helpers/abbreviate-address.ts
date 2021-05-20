export function abbreviateAddress(address: string) {
  if (!address.startsWith("0x") || address.length !== 42) {
    return "...";
  }

  const prefix = address.slice(0, 6);
  const suffix = address.slice(-4);

  return `${prefix}...${suffix}`;
}
