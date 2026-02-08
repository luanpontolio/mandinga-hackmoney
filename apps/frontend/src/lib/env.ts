type EnvConfig = {
  rpcUrl: string;
  chainId: string;
  factoryAddress: string;
  factoryFromBlock: string;
  ensResolverUrl: string;
  ensDomain: string;
  gatewayUrl: string;
};

const required = (key: string) => {
  const value = process.env[key];
  if (!value) {
    return "";
  }
  return value;
};

export const env: EnvConfig = {
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL ?? "",
  chainId: process.env.NEXT_PUBLIC_CHAIN_ID ?? "",
  factoryAddress: process.env.NEXT_PUBLIC_FACTORY_ADDRESS ?? "",
  factoryFromBlock: process.env.NEXT_PUBLIC_FACTORY_FROM_BLOCK ?? "",
  ensResolverUrl:
    process.env.NEXT_PUBLIC_ENS_RESOLVER_URL ?? "",
  ensDomain: process.env.NEXT_PUBLIC_ENS_DOMAIN ?? "",
  gatewayUrl: process.env.NEXT_PUBLIC_GATEWAY_URL ?? "http://localhost:4000",
};

console.log("env", env);