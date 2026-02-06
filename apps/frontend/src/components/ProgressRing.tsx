type ProgressRingProps = {
  progress: number;
  label?: string;
};

const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ProgressRing({ progress, label }: ProgressRingProps) {
  const safeProgress = Number.isFinite(progress)
    ? Math.max(0, Math.min(progress, 100))
    : 0;
  const strokeDashoffset =
    CIRCUMFERENCE - (CIRCUMFERENCE * safeProgress) / 100;

  return (
    <div className="relative flex h-40 w-40 items-center justify-center">
      <svg className="h-full w-full" viewBox="0 0 100 100">
        <circle
          className="text-gray-200 stroke-current"
          strokeWidth="10"
          cx="50"
          cy="50"
          r={RADIUS}
          fill="transparent"
        />
        <circle
          className="progress-ring__circle text-indigo-500 stroke-current"
          strokeWidth="10"
          strokeLinecap="round"
          cx="50"
          cy="50"
          r={RADIUS}
          fill="transparent"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
        />
        <text
          x="50"
          y="50"
          fontFamily="Verdana"
          fontSize="12"
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          {label ?? `${Math.round(safeProgress)}%`}
        </text>
      </svg>
    </div>
  );
}
