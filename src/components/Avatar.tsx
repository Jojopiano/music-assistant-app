import { avatarColors } from "../data";

interface AvatarProps {
  initials: string;
  idx: number;
  size?: number;
}

export function Avatar({ initials, idx, size = 36 }: AvatarProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: avatarColors[idx % 4] + "22",
        border: `1.5px solid ${avatarColors[idx % 4]}44`,
        color: avatarColors[idx % 4],
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 500,
        fontSize: size * 0.35,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}
