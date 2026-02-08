import type { Address } from "viem";

export type VaultEntry = {
  name: string;
  vaultAddress: Address;
  description?: string;
  url?: string;
};

export const VAULTS: VaultEntry[] = [
  { name: "devcon", vaultAddress: "0x7ff8D73E884a23cdC45294f1f7252C98FF09EBD1" },
  { name: "house", vaultAddress: "0xC6ab32bd721A8218b9A9b79f8b4e27fcAb950EbA" },
  {
    name: "trip-to-paris",
    vaultAddress: "0x35CCC9f1fa6749FEb97f47fFa25d8dc14174478c",
  },
  {
    name: "trip-to-barcelona",
    vaultAddress: "0x9854CCE90EEB79296FE3920Aa77533c77b4c1169",
  },
  {
    name: "trip-to-rio",
    vaultAddress: "0x6c8d887c24C3d916c3EEAa6a4A7ec7D2EeC06CEd",
  },
  {
    name: "devcon-mumbai",
    vaultAddress: "0xA79479b241f03E64F8D62104ee38823b5B96Ac92",
    description: "Trip to Mumbai 2026",
    url: "https://mandinga.example",
  },
  {
    name: "devcon-mumbai2",
    vaultAddress: "0xB9F5371fbF78fc12DcfA6da6e086a725C5dA4AA9",
    description: "Trip to Mumbai 2026 2",
    url: "https://mandinga.example",
  },
  {
    name: "trip-to-bangkok",
    vaultAddress: "0xFE8425cCDa4754009d374E2dAE4ACF82c6b0D02A",
  },
  {
    name: "dev-retirement",
    vaultAddress: "0xecEC219784F7076b6c08E1B2CE1637894C050796",
    description: "Dev retirement, IA stolen my job",
    url: "https://mandinga.example",
  },
  {
    name: "trip-to-bali",
    vaultAddress: "0x42390B40183915Ef8a690194269b9a239B4d2225",
  },
  {
    name: "car-purchase",
    vaultAddress: "0x474B3efdCd564c8Ea9C9612F8AE8473D8BDdea7B",
  },
];
