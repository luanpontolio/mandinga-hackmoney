type EnvConfig = {
  rpcUrl: string;
  chainId: string;
  factoryAddress: string;
  ensResolverUrl: string;
  ensDomain: string;
};

const required = (key: string) => {
  const value = process.env[key];
  if (!value) {
    return "";
  }
  return value;
};

export const env: EnvConfig = {
  rpcUrl: required("NEXT_PUBLIC_RPC_URL"),
  chainId: required("NEXT_PUBLIC_CHAIN_ID"),
  factoryAddress: required("NEXT_PUBLIC_FACTORY_ADDRESS"),
  ensResolverUrl: required("NEXT_PUBLIC_ENS_RESOLVER_URL"),
  ensDomain: required("NEXT_PUBLIC_ENS_DOMAIN"),
};

console.log("env", env);