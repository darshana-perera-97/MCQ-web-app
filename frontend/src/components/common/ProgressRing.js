function ProgressRing({ 
  completed, 
  total, 
  size = 120, 
  strokeWidth = 8,
  /** 'fraction' = show completed/total, 'percentage' = show only % in center */
  centerLabel = 'fraction'
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? Math.min(completed / total, 1) : 0;
  const strokeDashoffset = circumference - progress * circumference;
  const percentage = Math.round(progress * 100);

  const showPercentage = centerLabel === 'percentage';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle with gradient */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#667eea" />
            <stop offset="100%" stopColor="#764ba2" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-2xl font-semibold bg-gradient-to-br from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
          {showPercentage ? `${percentage}%` : `${completed}/${total}`}
        </div>
        {!showPercentage && (
          <div className="text-xs text-gray-500 mt-1">{percentage}%</div>
        )}
      </div>
    </div>
  );
}

export { ProgressRing };

