"use client";

import { useState } from "react";

type TermStepProps = {
  onSign: () => void;
};

export function TermStep({ onSign }: TermStepProps) {
  const [agreed, setAgreed] = useState(false);

  const terms = [
    {
      num: "01",
      title: "Shared Financial Risk",
      desc: "Collective system. Other members may affect outcomes.",
    },
    {
      num: "02",
      title: "Missed Payments",
      desc: "Penalties may apply. Rules enforced automatically.",
    },
    {
      num: "03",
      title: "Blockchain Finality",
      desc: "Transactions irreversible once confirmed.",
    },
    {
      num: "04",
      title: "Legal Responsibility",
      desc: "You handle legal/tax obligations in your country.",
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

      <div className="px-5 lg:px-6 py-5">
        <div className="p-4 bg-[#FAFAFA] rounded-lg border border-[#E5E5E5]">
          <p className="font-mono text-sm text-[#1A1A1A] mb-4">
            If you accept, you agree that:
          </p>
          <div className="flex flex-col gap-4">
            {terms.map((t) => (
              <div key={t.num} className="font-mono text-sm flex gap-3">
                <span className="text-[#1A1A1A] font-semibold shrink-0">
                  {t.num}.
                </span>
                <div>
                  <span className="text-[#1A1A1A] font-medium">{t.title}</span>
                  <p className="text-[#666666] text-xs font-bold mt-0.5">
                    {t.desc}
                  </p>
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
            <span className="text-sm text-[#1A1A1A]">
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
