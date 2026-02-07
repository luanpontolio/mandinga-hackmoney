declare module "node:fs" {
  export function readFileSync(
    path: string | URL,
    options?: { encoding?: string }
  ): string;
}

declare module "node:path" {
  const path: {
    resolve: (...paths: string[]) => string;
  };
  export default path;
}

declare const process: {
  env: Record<string, string | undefined>;
  cwd: () => string;
};

declare const Buffer: {
  from: (data: Uint8Array | string, encoding?: string) => {
    toString: (encoding?: string) => string;
  };
};
