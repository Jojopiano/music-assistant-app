import { COLORS, type Schedule, type Student } from "../data";
import { Avatar } from "./Avatar";
import { Badge } from "./Badge";

interface DayDetailProps {
  date: string;
  schedule: Schedule[];
  students: Student[];
  role: "teacher" | "student";
  onTeacherAction?: (lessonId: number, action: "accept" | "reject") => void;
  onStudentAction?: (lessonId: number, action: "confirm" | "request_reschedule") => void;
  onRequestReschedule?: (lesson: Schedule) => void;
}

export function DayDetail({
  date,
  schedule,
  students,
  role,
  onTeacherAction,
  onStudentAction,
  onRequestReschedule,
}: DayDetailProps) {
  const lessons = schedule.filter((s) => s.date === date);

  if (!date || lessons.length === 0) {
    return (
      <div
        style={{
          marginTop: 12,
          borderTop: "0.5px solid var(--color-border-tertiary, #e5e7eb)",
          paddingTop: 12,
          fontSize: 13,
          color: "var(--color-text-secondary, #6b7280)",
        }}
      >
        {date ? "這天沒有課程。" : ""}
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: 12,
        borderTop: "0.5px solid var(--color-border-tertiary, #e5e7eb)",
        paddingTop: 12,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: "var(--color-text-secondary, #6b7280)",
          marginBottom: 8,
        }}
      >
        {date} · {lessons.length} 堂課
      </div>
      {lessons.map((sc, i) => {
        const st = students.find((s) => s.id === sc.studentId);
        const idx = students.findIndex((s) => s.id === sc.studentId);
        return (
          <div
            key={sc.id}
            style={{
              padding: "9px 0",
              borderBottom:
                i < lessons.length - 1
                  ? "0.5px solid var(--color-border-tertiary, #e5e7eb)"
                  : "none",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom:
                  sc.status === "pending_student" || sc.status === "reschedule_requested"
                    ? 8
                    : 0,
              }}
            >
              <Avatar initials={st?.avatar || "?"} idx={idx} size={30} />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--color-text-primary, #111827)",
                  }}
                >
                  {st?.name}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--color-text-secondary, #6b7280)",
                  }}
                >
                  {sc.time} · {sc.duration} 分鐘
                </div>
              </div>
              <Badge status={sc.status} />
            </div>

            {role === "teacher" &&
              sc.status === "reschedule_requested" &&
              onTeacherAction && (
                <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                  <button
                    onClick={() => onTeacherAction(sc.id, "accept")}
                    style={{
                      fontSize: 12,
                      padding: "5px 14px",
                      borderRadius: 20,
                      cursor: "pointer",
                      background: COLORS.teal,
                      color: "#fff",
                      border: "none",
                      fontWeight: 500,
                    }}
                  >
                    接受改期
                  </button>
                  <button
                    onClick={() => onTeacherAction(sc.id, "reject")}
                    style={{
                      fontSize: 12,
                      padding: "5px 14px",
                      borderRadius: 20,
                      cursor: "pointer",
                      background: COLORS.coralLight,
                      color: COLORS.coralDark,
                      border: `0.5px solid ${COLORS.coral}44`,
                    }}
                  >
                    拒絕
                  </button>
                </div>
              )}

            {sc.status === "pending_student" && onStudentAction && (
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => onStudentAction(sc.id, "confirm")}
                  style={{
                    fontSize: 12,
                    padding: "5px 14px",
                    borderRadius: 20,
                    cursor: "pointer",
                    background: COLORS.teal,
                    color: "#fff",
                    border: "none",
                    fontWeight: 500,
                  }}
                >
                  確認
                </button>
                <button
                  onClick={() => onRequestReschedule?.(sc)}
                  style={{
                    fontSize: 12,
                    padding: "5px 14px",
                    borderRadius: 20,
                    cursor: "pointer",
                    background: COLORS.amberLight,
                    color: COLORS.amberDark,
                    border: `0.5px solid ${COLORS.amber}44`,
                  }}
                >
                  申請改期
                </button>
              </div>
            )}

            {sc.status === "confirmed" && onRequestReschedule && (
              <button
                onClick={() => onRequestReschedule(sc)}
                style={{
                  fontSize: 11,
                  padding: "3px 10px",
                  borderRadius: 16,
                  cursor: "pointer",
                  background: "transparent",
                  border: "0.5px solid var(--color-border-secondary, #d1d5db)",
                  color: "var(--color-text-secondary, #6b7280)",
                }}
              >
                申請改期
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
