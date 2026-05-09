import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { COLORS, type Student } from "../data";
import { Avatar } from "./Avatar";
import { Card } from "./Card";

interface AddLessonsViewProps {
  students: Student[];
  schedule: { studentId: number; status: string }[];
  onAddLessons: (studentId: number, amount: number) => void;
}

export function AddLessonsView({ students, schedule, onAddLessons }: AddLessonsViewProps) {
  const [selectedStudent, setSelectedStudent] = useState<number>(students[0]?.id || 1);
  const [amount, setAmount] = useState(1);

  const student = students.find((s) => s.id === selectedStudent);
  
  // 計算各種狀態的課程數量
  const studentSchedule = schedule.filter((s) => s.studentId === selectedStudent);
  const confirmedCount = studentSchedule.filter((s) => s.status === "confirmed").length;
  const pendingCount = studentSchedule.filter((s) => s.status === "pending_student").length;
  const rescheduleCount = studentSchedule.filter((s) => s.status === "reschedule_requested").length;
  const scheduledTotal = confirmedCount + pendingCount + rescheduleCount;
  
  // 尚未完成 / 尚未排程 = 總堂數 - 已使用 - 已排程
  const unscheduledRemaining = Math.max(0, (student?.lessonsTotal || 0) - (student?.lessonsUsed || 0) - scheduledTotal);

  const handleAdd = () => {
    if (amount > 0 && student) {
      onAddLessons(selectedStudent, amount);
      setAmount(1);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Card>
        <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 16, color: "var(--color-text-primary)" }}>
          新增課程堂數
        </div>

        {/* 選擇學生 */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 8 }}>選擇學生</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {students.map((s, idx) => {
              const isSelected = s.id === selectedStudent;
              const sSchedule = schedule.filter((sch) => sch.studentId === s.id);
              const sConfirmed = sSchedule.filter((sch) => sch.status === "confirmed").length;
              const sPending = sSchedule.filter((sch) => sch.status === "pending_student").length;
              const sReschedule = sSchedule.filter((sch) => sch.status === "reschedule_requested").length;
              const sScheduled = sConfirmed + sPending + sReschedule;
              const sUnscheduled = Math.max(0, s.lessonsTotal - s.lessonsUsed - sScheduled);
              
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedStudent(s.id);
                    setAmount(1);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: isSelected ? `1.5px solid ${COLORS.purple}` : "0.5px solid var(--color-border-tertiary)",
                    background: isSelected ? COLORS.purpleLight : "var(--color-background-primary)",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <Avatar initials={s.avatar} idx={idx} size={36} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>
                      {s.instrument} · 總堂數: {s.lessonsTotal} · 已用: {s.lessonsUsed}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: COLORS.teal }}>可排程: {sUnscheduled} 堂</div>
                    <div style={{ fontSize: 11, color: COLORS.amber }}>已排程: {sScheduled} 堂</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 學生課程狀態詳情 */}
        {student && (
          <div style={{ 
            background: "var(--color-background-secondary)", 
            borderRadius: 8, 
            padding: "12px 14px",
            marginBottom: 16,
          }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: "var(--color-text-primary)" }}>
              {student.name} 的課程狀態
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12 }}>
              <div style={{ color: "var(--color-text-secondary)" }}>
                總堂數: <b style={{ color: "var(--color-text-primary)" }}>{student.lessonsTotal}</b>
              </div>
              <div style={{ color: "var(--color-text-secondary)" }}>
                已完成: <b style={{ color: COLORS.teal }}>{student.lessonsUsed}</b>
              </div>
              <div style={{ color: "var(--color-text-secondary)" }}>
                已排程/已確認: <b style={{ color: COLORS.teal }}>{confirmedCount}</b>
              </div>
              <div style={{ color: "var(--color-text-secondary)" }}>
                已排程/待確認: <b style={{ color: COLORS.amber }}>{pendingCount}</b>
              </div>
              <div style={{ color: "var(--color-text-secondary)" }}>
                改期中: <b style={{ color: COLORS.pink }}>{rescheduleCount}</b>
              </div>
              <div style={{ color: "var(--color-text-secondary)" }}>
                尚未排程: <b style={{ color: COLORS.purple }}>{unscheduledRemaining}</b>
              </div>
            </div>
          </div>
        )}

        {/* 新增數量 */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 8 }}>新增堂數</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => setAmount(Math.max(1, amount - 1))}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                border: "0.5px solid var(--color-border-secondary)",
                background: "transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Minus className="w-4 h-4" />
            </button>
            <div style={{ fontSize: 20, fontWeight: 500, minWidth: 40, textAlign: "center" }}>
              {amount}
            </div>
            <button
              onClick={() => setAmount(amount + 1)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                border: "0.5px solid var(--color-border-secondary)",
                background: "transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 確認按鈕 */}
        <button
          onClick={handleAdd}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: 8,
            background: COLORS.purple,
            color: "#fff",
            border: "none",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          新增 {amount} 堂課程給 {student?.name}
        </button>
      </Card>
    </div>
  );
}
