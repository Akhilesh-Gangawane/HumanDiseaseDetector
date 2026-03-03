interface ProgressBarProps {
  value: number;
  showLabel?: boolean;
}

export default function ProgressBar({ value, showLabel = true }: ProgressBarProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 bg-gray-200 rounded-full h-2 relative overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full absolute top-0 left-0 transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-sm font-semibold text-gray-700 min-w-[3rem]">
          {value}%
        </span>
      )}
    </div>
  );
}
