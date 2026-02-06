export const formatUsd = (value: bigint) => {
  const valueString = (value / 10n ** 18n).toString();
  return Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    Number(valueString)
  );
};

export const formatExitFee = (exitFeeBps: number) => {
  return (exitFeeBps / 100).toFixed(2);
};

export const formatAddress = (address: string) =>
  `${address.slice(0, 6)}...${address.slice(-4)}`;
