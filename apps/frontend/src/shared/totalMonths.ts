export type SlotsByWindow = {
  early: number;
  middle: number;
  late: number;
};

export const totalMonths = (slots: SlotsByWindow) =>
  Math.max(0, slots.early + slots.middle + slots.late);
