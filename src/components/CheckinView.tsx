import { useState } from "react";
import { COLORS, type Student, type AttendanceRecord } from "../data";
import { Avatar } from "./Avatar";
import { Badge } from "./Badge";
import { Card } from "./Card";

interface CheckinViewProps {
  attendance: AttendanceRecord[];
  students: Student[];
  role: "teacher" | "student";
  studentId?: number;
  onAttendanceChange: (attendance: AttendanceRecord[]) => void;
  onNotificationsChange: (notifications: any[]) => void;
  notifications: any[];
}

function checkinStatus(rec: AttendanceRecord | undefined) {
  if (!rec) return null;
  if (rec.teacherAction === "absent" || rec.studentAction === "absent") return "absent";
  if (rec.teacherAction && rec.studentAction) return "present";
  if (rec.teacherAction === "present" || rec.studentAction === "present") return "awaiting confirm";
  return null;
}

export function CheckinView({
  attendance,
  students,
  role,
  studentId,
  onAttendanceChange,
  onNotificationsChange,
  notifications,
}: CheckinViewProps) {
  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'));
  const getRecord = (sid: number) => attendance.find((a) => a.studentId === sid && a.date === date);

  const act = (sid: number, action: "present" | "absent" | "confirmed") => {
    const existing = getRecord(sid);
    const field = role === "teacher" ? "teacherAction" : "studentAction";
    
    let updatedAttendance: AttendanceRecord[];
    if (existing) {
      updatedAttendance = attendance.map((a) =>
        a.id === existing.id ? { ...a, [field]: action } : a
      );
    } else {
      updatedAttendance = [
        ...attendance,
        {
          id: Date.now() + sid,
          studentId: sid,
          date,
          teacherAction: role === "teacher" ? action : null,
          studentAction: role === "student" ? action : null,
        },
      ];
    }
    
    onAttendanceChange(updatedAttendance);

    // Notify the other party
    const student = students.find((s) => s.id === sid);
    const otherRole = role === "teacher" ? "student" : "teacher";
    const actionText = action === "present" ? "出席" : action === "absent" ? "缺席" : "已確認";
    const notifText =
      role === "teacher"
        ? `老師標記 ${student?.name} 為${actionText} (${date})，請確認。`
        : `${student?.name} 標記自己為${actionText} (${date})，請確認。`;

    const newNotif = {
      id: Date.now(),
      toRole: otherRole,
      toStudentId: otherRole === "student" ? sid : undefined,
      text: notifText,
      time: "剛剛",
      read: false,
      type: "schedule",
    };

    onNotificationsChange([...notifications, newNotif]);
  };

  const visibleStudents =
    role === "student" ? students.filter((s) => s.id === studentId) : students;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Card>
        <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 12, color: "var(--color-text-primary)" }}>
          打卡 · 雙方確認
        </div>
        <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 12, lineHeight: 1.6 }}>
          老師或學生其中一方先標記<b style={{ fontWeight: 500 }}>出席</b>，另一方再確認。
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <label style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>日期</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              fontSize: 13,
              padding: "4px 8px",
              borderRadius: 6,
              border: "0.5px solid var(--color-border-secondary)",
            }}
          />
        </div>
        {visibleStudents.map((s, i) => {
          const rec = getRecord(s.id);
          const status = checkinStatus(rec);
          const myField = role === "teacher" ? "teacherAction" : "studentAction";
          const otherField = role === "teacher" ? "studentAction" : "teacherAction";
          const myAction = rec?.[myField as keyof AttendanceRecord];
          const otherAction = rec?.[otherField as keyof AttendanceRecord];
          const isDone = status === "present" || status === "absent";
          
          return (
            <div
              key={s.id}
              style={{
                padding: "12px 0",
                borderBottom:
                  i < visibleStudents.length - 1
                    ? "0.5px solid var(--color-border-tertiary)"
                    : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <Avatar initials={s.avatar} idx={i} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 14, color: "var(--color-text-primary)" }}>
                    {s.name}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{s.instrument}</div>
                </div>
                {status && (
                  <Badge
                    status={
                      status === "present"
                        ? "present"
                        : status === "absent"
                        ? "absent"
                        : "awaiting confirm"
                    }
                  />
                )}
              </div>
              <div style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "center" }}>
                {["Teacher", "Student"].map((party) => {
                  const f = party === "Teacher" ? "teacherAction" : "studentAction";
                  const val = rec?.[f as keyof AttendanceRecord];
                  const dot =
                    val === "present" || val === "confirmed"
                      ? COLORS.teal
                      : val === "absent"
                      ? COLORS.coral
                      : "var(--color-border-secondary)";
                  return (
                    <div key={party} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: dot }} />
                      <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>
                        {party === "Teacher" ? "老師" : "學生"}: {val === "present" ? "出席" : val === "absent" ? "缺席" : val === "confirmed" ? "已確認" : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
              {!isDone && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {(myAction === null || myAction === undefined) && otherAction === "present" && (
                    <button
                      onClick={() => act(s.id, "confirmed")}
                      style={{
                        fontSize: 12,
                        padding: "5px 14px",
                        borderRadius: 20,
                        cursor: "pointer",
                        background: COLORS.purple,
                        color: "#fff",
                        border: "none",
                        fontWeight: 500,
                      }}
                    >
                      確認出席
                    </button>
                  )}
                  {(myAction === null || myAction === undefined) && !otherAction && (
                    <>
                      <button
                        onClick={() => act(s.id, "present")}
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
                        標記出席
                      </button>
                      <button
                        onClick={() => act(s.id, "absent")}
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
                        標記缺席
                      </button>
                    </>
                  )}
                  {myAction && !otherAction && (
                    <div style={{ fontSize: 12, color: COLORS.amber, fontWeight: 500 }}>
                      等待{role === "teacher" ? "學生" : "老師"}確認
                    </div>
                  )}
                </div>
              )}
              {isDone && (
                <div style={{ fontSize: 12, color: status === "present" ? COLORS.teal : COLORS.coral }}>
                  {status === "present"
                    ? "雙方已確認出席。"
                    : "標記為缺席。"}
                </div>
              )}
            </div>
          );
        })}
      </Card>
      <Card>
        <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 12, color: "var(--color-text-primary)" }}>
          出席紀錄
        </div>
        {attendance
          .filter((a) => (role === "student" ? a.studentId === studentId : true))
          .slice(-6)
          .reverse()
          .map((a, i, arr) => {
            const st = students.find((s) => s.id === a.studentId);
            const status = checkinStatus(a);
            return (
              <div
                key={a.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "7px 0",
                  borderBottom:
                    i < arr.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none",
                }}
              >
                <Avatar
                  initials={st?.avatar || "?"}
                  idx={students.findIndex((s) => s.id === a.studentId)}
                  size={28}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: "var(--color-text-primary)" }}>{st?.name}</div>
                  <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{a.date}</div>
                </div>
                <Badge
                  status={
                    status === "present"
                      ? "present"
                      : status === "absent"
                      ? "absent"
                      : "awaiting confirm"
                  }
                />
              </div>
            );
          })}
      </Card>
    </div>
  );
}
