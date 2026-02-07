"use client";

import { GAP_M, PADDING_L, TYPOGRAPHY } from "./designTokens";

type MembersCardProps = {
  members: string[];
};

export function MembersCard({ members }: MembersCardProps) {
  const maxVisibleMembers = 4;
  const hasMoreMembers = members.length > maxVisibleMembers;

  return (
    <div
      className={`rounded-xl border border-[#E5E5E5] bg-white ${PADDING_L} flex flex-col ${GAP_M}`}
    >
      <h3 className={`${TYPOGRAPHY.h3} text-[#1A1A1A]`}>Active members</h3>

      {members.length === 0 ? (
        <p className={TYPOGRAPHY.caption}>--</p>
      ) : (
        <div>
          {members.slice(0, maxVisibleMembers).map((member, index) => (
            <div
              key={member}
              className={`flex items-center justify-between gap-3 py-2 min-w-0 ${
                index < Math.min(members.length, maxVisibleMembers) - 1
                  ? "border-b border-[#F5F5F5]"
                  : ""
              }`}
            >
              <span className="text-[#1A1A1A] truncate min-w-0">{member}</span>
              <span className={TYPOGRAPHY.caption}>--</span>
            </div>
          ))}
        </div>
      )}

      {hasMoreMembers && (
        <p className={TYPOGRAPHY.caption}>
          + {members.length - maxVisibleMembers} more members
        </p>
      )}
    </div>
  );
}
