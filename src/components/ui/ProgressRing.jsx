// SVG-based circular progress ring - recharts jaisi heavy library ke bina (Attendance % dikhane ke liye) - lightweight aur fully customizable
function ProgressRing({ percentage, size = 140, strokeWidth = 14, color = "#2FB8AC", trackColor = "#E5E7EB", label, value }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Kitna hissa "bhara" hona chahiye, us hisaab se dash-offset calculate karo
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="font-display text-2xl font-bold text-ink">{value ?? `${percentage}%`}</span>
        {label && <span className="text-xs text-slate-400 mt-0.5">{label}</span>}
      </div>
    </div>
  );
}

export default ProgressRing;
