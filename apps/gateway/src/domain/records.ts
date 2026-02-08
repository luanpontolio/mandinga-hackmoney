const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const EMPTY_BYTES = "0x";

export type NameRecord = {
  addresses?: Record<string, string>;
  text?: Record<string, string>;
};

export type ZoneData = Record<string, NameRecord>;

export class JsonRecords {
  private data: ZoneData;

  constructor(data: ZoneData) {
    this.data = { ...data };
    for (const key of Object.keys(this.data)) {
      if (!key.startsWith("*.") && !this.data[`*.${key}`]) {
        this.data[`*.${key}`] = {};
      }
    }
  }

  addr(name: string, coinType: number) {
    const record = this.findName(name);
    const value = record?.addresses?.[String(coinType)];
    if (!value) return ZERO_ADDRESS;
    return value;
  }

  addrBytes(name: string, coinType: number) {
    const record = this.findName(name);
    const value = record?.addresses?.[String(coinType)];
    if (!value) return EMPTY_BYTES;
    return value;
  }

  text(name: string, key: string) {
    const record = this.findName(name);
    const value = record?.text?.[key];
    return value ?? "";
  }

  private findName(name: string) {
    if (this.data[name]) {
      return this.data[name];
    }

    const labels = name.split(".");
    for (let i = 1; i < labels.length + 1; i += 1) {
      const wildcard = ["*", ...labels.slice(i)].join(".");
      if (this.data[wildcard]) {
        return this.data[wildcard];
      }
    }
    return null;
  }
}
