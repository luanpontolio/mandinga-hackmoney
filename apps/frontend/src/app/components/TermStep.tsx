"use client";

import { useState } from "react";
import { formatAdaptiveDate } from "../../lib/formatDate";

type TermStepProps = {
  monthlyAmount?: string;
  totalMonths?: number;
  totalRounds?: number;
  startDate?: string | Date | number | null;
  endDate?: string | Date | number | null;
  onSign: () => void;
};

export function TermStep({ monthlyAmount, totalMonths, totalRounds, startDate, endDate, onSign }: TermStepProps) {
  const [agreed, setAgreed] = useState(false);

  // Build the dynamic first term depending on props available
  let firstDesc = "You agree to pay the monthly installment for the duration of the circle. Early exit is not guaranteed.";
  if (monthlyAmount && totalMonths && totalMonths > 0) {
    firstDesc = `You agree to pay ${monthlyAmount} every month for ${totalMonths} months. Early exit is not guaranteed.`;
  } else if (monthlyAmount && totalRounds && totalRounds > 0) {
    const s = formatAdaptiveDate(startDate);
    const e = formatAdaptiveDate(endDate);
    firstDesc = `You agree to pay ${monthlyAmount} for ${totalRounds} rounds from ${s} to ${e}.`;
  }

  const terms = [
    {
      num: "01",
      title: "Fixed Monthly Installment",
      desc: firstDesc,
    },
    {
      num: "02",
      title: "Missed Payments",
      desc: "Penalties may apply. Rules are enforced automatically.",
    },
    {
      num: "03",
      title: "Shared Financial Risk",
      desc: "This is a collective system. Other members may affect outcomes.",
    },
    {
      num: "04",
      title: "Legal Responsibility",
      desc: "You are responsible for handling legal and tax obligations in your country.",
    },
    {
      num: "05",
      title: "Blockchain Finality",
      desc: "Transactions are irreversible once confirmed.",
    },
  ];

  return (
    <div className="rounded-xl border border-[#E5E5E5] bg-white">
      <div className="px-5 lg:px-6 pt-5 lg:pt-6">
        <h2 className="text-lg font-semibold text-[#1A1A1A]">
          Terms and Participation Agreement
        </h2>
        <p className="text-sm text-[#666666] mt-1">
          Please review before joining.
        </p>
      </div>

      <div className="px-5 lg:px-6 py-6">
        <div className="p-6 bg-[#FAFAFA] rounded-lg border border-[#E5E5E5]">
          <p className="font-mono text-sm text-[#1A1A1A] mb-4">If you accept, you agree that:</p>
          <div className="flex flex-col gap-6">
            {terms.map((t) => (
              <div key={t.num} className="font-mono text-sm flex gap-4 items-start">
                <div className="w-12 flex-shrink-0">
                  <div className="text-[#1A1A1A] font-semibold">{t.num}.</div>
                </div>
                <div className="flex-1">
                  <div className="text-[#1A1A1A] font-medium mb-1">{t.title}</div>
                  <div className="text-[#666666] text-xs font-medium leading-snug">{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 lg:px-6 pb-5 lg:pb-6 pt-4 border-t border-[#F0F0F0]">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-4 h-4 rounded border-[#E5E5E5] text-[#1A1A1A] focus:ring-[#1A1A1A]"
            />
            <span className="text-sm text-[#1A1A1A] lg:whitespace-nowrap">
              I understand and agree to these terms and accept all risks.
            </span>
          </label>
          <button
            type="button"
            onClick={onSign}
            disabled={!agreed}
            className={`shrink-0 rounded-full px-6 py-4 text-sm font-semibold lg:w-auto w-full ${
              agreed
                ? "bg-[#1A1A1A] text-white hover:bg-[#333333]"
                : "bg-[#E5E5E5] text-[#999999] cursor-not-allowed"
            }`}
          >
            Sign and Accept Terms
          </button>
        </div>
      </div>
    </div>
  );
}
