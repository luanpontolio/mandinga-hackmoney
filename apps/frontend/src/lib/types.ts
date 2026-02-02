export type CircleStatus = "ACTIVE" | "FROZEN" | "CLOSED";

export type Circle = {
  id: string;
  name: string;
  targetValue: string;
  totalInstallments: number;
  deadline: string;
  status: CircleStatus;
  factoryAddress: string;
  vaultAddress: string;
};

export type Position = {
  positionId: string;
  circleId: string;
  ownerAddress: string;
  quotaId: number;
  paidInstallments: number;
  totalPaid: string;
  status: CircleStatus;
};

export type Share = {
  shareId: string;
  circleId: string;
  ownerAddress: string;
  amount: string;
  snapshotBalance?: string;
};

export type IdentityRecord = {
  name: string;
  vaultAddress: string;
  status: CircleStatus;
  goal?: string;
  targetValue: string;
  proof?: string;
};
