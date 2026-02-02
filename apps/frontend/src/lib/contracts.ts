import { env } from "./env";

export type ContractAddresses = {
  factoryAddress: string;
};

export const getContractAddresses = (): ContractAddresses => ({
  factoryAddress: env.factoryAddress,
});

// TODO: add ABI loading and contract clients when contract interfaces are finalized.
