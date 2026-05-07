import { AvatarCircle } from "./avatar-circle";

export function AvatarGroup({ initials }: { initials: string[] }) {
  return (
    <div className="flex -space-x-2">
      {initials.map((m) => (
        <AvatarCircle
          key={m}
          initials={m}
          size="sm"
          ringed
          bgClassName="bg-[oklch(0.92_0.04_285)]"
          textClassName="text-[oklch(0.35_0.15_285)]"
        />
      ))}
    </div>
  );
}