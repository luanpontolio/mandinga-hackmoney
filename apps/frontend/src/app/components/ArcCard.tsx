"use client";

import { GAP_M, PADDING_L, TYPOGRAPHY } from "./designTokens";

type ArcCardProps = {
  arcscanUrl: string | null;
};

export function ArcCard({ arcscanUrl }: ArcCardProps) {
  const linkUrl = arcscanUrl ?? "#";

  return (
    <div
      className={`rounded-xl border border-[#E5E5E5] bg-white ${PADDING_L} flex flex-col ${GAP_M}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg
            width="20"
            height="20"
            viewBox="0 0 298 312"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,311.98c2.53-76.38,15.48-147.66,37.13-203.09C64.54,38.67,104.23,0,148.86,0s84.32,38.67,111.74,108.9c14.26,36.52,24.75,79.92,30.97,127.13.56,4.22,1.03,8.5,1.51,12.78.16.26.25.51.22.71,0,0,3.65,22.82,4.43,62.47h-.41c-5.42-4.45-69.33-54.66-175.27-40.12,1.6-17.93,3.8-35.37,6.64-52.09.15-.85.31-1.68.46-2.53,41.55-1.25,77.92,3.57,105.81,9.9-.1-.66-.19-1.34-.3-2-5.73-35.7-14.19-68.38-25.1-96.31-17.83-45.67-41.1-74.04-60.71-74.04s-42.88,28.37-60.71,74.04c-4.32,11.05-8.25,22.83-11.77,35.25-4.95,17.41-9.11,36.08-12.44,55.69-4.92,28.97-7.99,60.03-9.12,92.22H0Z"
              fill="#1A1A1A"
            />
          </svg>
          <span className={`${TYPOGRAPHY.h3} text-[#1A1A1A]`}>Arc</span>
        </div>
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${TYPOGRAPHY.button} text-[#1A1A1A] transition-colors hover:opacity-70 whitespace-nowrap`}
        >
          View on Arcscan →
        </a>
      </div>
    </div>
  );
}
