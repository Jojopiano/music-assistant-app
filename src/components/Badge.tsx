import { COLORS } from "../data";

const statusMap: Record<string, { bg: string; color: string; label: string }> = {
  confirmed: { bg: COLORS.tealLight, color: COLORS.tealDark, label: "已確認" },
  pending_student: { bg: COLORS.amberLight, color: COLORS.amberDark, label: "等待學生確認" },
  reschedule_requested: { bg: COLORS.pinkLight, color: "#72243E", label: "改期申請中" },
  cancelled: { bg: COLORS.coralLight, color: COLORS.coralDark, label: "已取消" },
  present: { bg: COLORS.tealLight, color: COLORS.tealDark, label: "已出席" },
  absent: { bg: COLORS.coralLight, color: COLORS.coralDark, label: "缺席" },
  "awaiting confirm": { bg: COLORS.amberLight, color: COLORS.amberDark, label: "等待確認" },
  pending: { bg: COLORS.amberLight, color: COLORS.amberDark, label: "待處理" },
  accepted: { bg: COLORS.tealLight, color: COLORS.tealDark, label: "已接受" },
  rejected: { bg: COLORS.coralLight, color: COLORS.coralDark, label: "已拒絕" },
};

interface BadgeProps {
  status: string;
}

export function Badge({ status }: BadgeProps) {
  const s = statusMap[status] || { bg: "#eee", color: "#333", label: status };
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        borderRadius: 20,
        padding: "2px 10px",
        fontSize: 11,
        fontWeight: 500,
        whiteSpace: "nowrap",
        display: "inline-block",
      }}
    >
      {s.label}
    </span>
  );
}
