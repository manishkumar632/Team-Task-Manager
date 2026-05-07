type AvatarCircleProps = {
  initials: string;
  className?: string;
  bgClassName?: string;
  textClassName?: string;
  size?: "sm" | "md" | "lg";
  status?: "online" | "offline" | null;
  ringed?: boolean;
};

const sizeMap = {
  sm: "size-7 text-[10px]",
  md: "size-9 text-xs",
  lg: "size-14 text-sm",
};

export function AvatarCircle({
  initials,
  bgClassName = "bg-[oklch(0.88_0.06_285)]",
  textClassName = "text-[oklch(0.35_0.15_285)]",
  size = "md",
  status = null,
  ringed = false,
  className = "",
}: AvatarCircleProps) {
  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className={`${sizeMap[size]} rounded-full grid place-items-center font-semibold ${bgClassName} ${textClassName} ${
          ringed ? "ring-2 ring-card" : ""
        }`}
      >
        {initials}
      </div>
      {status === "online" && (
        <span className="absolute bottom-0 right-0 size-3.5 rounded-full bg-[oklch(0.78_0.13_160)] ring-2 ring-card" />
      )}
    </div>
  );
}