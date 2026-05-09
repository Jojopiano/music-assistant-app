import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { COLORS, type Schedule, type Student, type Notification, type RescheduleRequest } from "../data";
import { CalendarGrid } from "./CalendarGrid";
import { DayDetail } from "./DayDetail";
import { Card } from "./Card";

interface ScheduleViewProps {
  schedule: Schedule[];
  students: Student[];
  notifications: Notification[];
  rescheduleRequests: RescheduleRequest[];
  role: "teacher" | "student";
  studentId?: number;
  onScheduleChange: (schedule: Schedule[]) => void;
  onNotificationsChange: (notifications: Notification[]) => void;
  onRescheduleRequestsChange: (requests: RescheduleRequest[]) => void;
}

const fmtDate = (iso: string) => iso.slice(5).replace("-", "/");
const fmtWeekRange = (dates: string[]) => `${fmtDate(dates[0])} – ${fmtDate(dates[6])}`;
const fmtMonth = (iso: string) => {
  const [y, m] = iso.split("-");
  return `${y}年${Number(m)}月`;
};

function getWeekDates(anchor: string) {
  const d = new Date(anchor);
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(monday);
    x.setDate(monday.getDate() + i);
    return x.toISOString().slice(0, 10);
  });
}

export function ScheduleView({
  schedule,
  students,
  notifications,
  rescheduleRequests,
  role,
  studentId,
  onScheduleChange,
  onNotificationsChange,
  onRescheduleRequestsChange,
}: ScheduleViewProps) {
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const [anchor, setAnchor] = useState("2026-05-02");
  const [selectedDate, setSelectedDate] = useState("2026-05-02");
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    studentId: 1,
    date: "2026-05-10",
    time: "10:00",
    duration: 60,
  });
  const [rescheduleLesson, setRescheduleLesson] = useState<Schedule | null>(null);

  const navigate = (dir: number) => {
    const d = new Date(anchor);
    if (viewMode === "week") {
      d.setDate(d.getDate() + dir * 7);
    } else {
      d.setMonth(d.getMonth() + dir);
    }
    setAnchor(d.toISOString().slice(0, 10));
  };

  const label = viewMode === "week" ? fmtWeekRange(getWeekDates(anchor)) : fmtMonth(anchor);

  const visibleSchedule =
    role === "student" && studentId
      ? schedule.filter((s) => s.studentId === studentId)
      : schedule;

  const handleDayClick = (date: string) => {
    setSelectedDate(date);
  };

  const addLesson = () => {
    const student = students.find((s) => s.id === Number(form.studentId));
    if (!student) return;

    // 計算已排程數量
    const studentSchedule = schedule.filter((s) => s.studentId === student.id);
    const scheduledCount = studentSchedule.filter(
      (s) => s.status === "confirmed" || s.status === "pending_student" || s.status === "reschedule_requested"
    ).length;
    
    // 尚未排程的剩餘堂數
    const unscheduledRemaining = Math.max(0, student.lessonsTotal - student.lessonsUsed - scheduledCount);
    
    if (unscheduledRemaining <= 0) {
      alert(`${student.name} 沒有尚未排程的課程堂數。請先新增課程堂數。`);
      return;
    }

    const newLesson: Schedule = {
      id: Date.now(),
      studentId: Number(form.studentId),
      date: form.date,
      time: form.time,
      duration: form.duration,
      status: "pending_student",
    };

    onScheduleChange([...schedule, newLesson]);

    const newNotification: Notification = {
      id: Date.now() + 1,
      toRole: "student",
      toStudentId: Number(form.studentId),
      lessonId: newLesson.id,
      text: `新課程已安排: ${newLesson.date} · ${newLesson.time} — 請確認`,
      time: "剛剛",
      read: false,
      type: "schedule",
    };
    onNotificationsChange([...notifications, newNotification]);
    setShowAddForm(false);
  };

  const teacherAction = (lessonId: number, action: "accept" | "reject") => {
    const req = rescheduleRequests.find(
      (r) => r.lessonId === lessonId && r.status === "pending"
    );
    if (!req) return;

    const updatedReqs = rescheduleRequests.map((r) =>
      r.id === req.id ? { ...r, status: action === "accept" ? ("accepted" as const) : ("rejected" as const) } : r
    );

    let updatedSchedule = schedule;
    const lesson = schedule.find((s) => s.id === lessonId);
    let notifText = "";

    if (action === "accept") {
      updatedSchedule = schedule.map((s) =>
        s.id === lessonId
          ? { ...s, date: req.requestedDate, time: req.requestedTime, status: "confirmed" as const }
          : s
      );
      notifText = `您的改期申請已接受: 新時間 ${req.requestedDate} · ${req.requestedTime}`;
    } else {
      updatedSchedule = schedule.map((s) =>
        s.id === lessonId ? { ...s, status: "confirmed" as const } : s
      );
      notifText = `您的改期申請被拒絕。保留原時間 ${lesson?.date} · ${lesson?.time}。`;
    }

    const newNotification: Notification = {
      id: Date.now(),
      toRole: "student",
      toStudentId: req.studentId,
      text: notifText,
      time: "剛剛",
      read: false,
      type: action === "accept" ? "success" : "warning",
    };

    onRescheduleRequestsChange(updatedReqs);
    onScheduleChange(updatedSchedule);
    onNotificationsChange([...notifications, newNotification]);
  };

  const studentAction = (lessonId: number, action: "confirm" | "request_reschedule") => {
    if (action === "confirm") {
      const lesson = schedule.find((s) => s.id === lessonId);
      const student = students.find((s) => s.id === studentId);

      onScheduleChange(
        schedule.map((s) => (s.id === lessonId ? { ...s, status: "confirmed" as const } : s))
      );

      const newNotification: Notification = {
        id: Date.now(),
        toRole: "teacher",
        text: `${student?.name} 確認了課程 ${lesson?.date} · ${lesson?.time}`,
        time: "剛剛",
        read: false,
        type: "success",
      };
      onNotificationsChange([...notifications, newNotification]);
    }
  };

  const submitReschedule = ({ date, time, reason }: { date: string; time: string; reason: string }) => {
    if (!rescheduleLesson) return;
    
    const lesson = rescheduleLesson;
    const req: RescheduleRequest = {
      id: Date.now(),
      lessonId: lesson.id,
      studentId: lesson.studentId,
      requestedDate: date,
      requestedTime: time,
      reason,
      status: "pending",
    };
    
    const updatedSchedule = schedule.map((s) =>
      s.id === lesson.id ? { ...s, status: "reschedule_requested" as const } : s
    );
    
    const st = students.find((s) => s.id === lesson.studentId);
    const notifText = role === "teacher"
      ? `老師申請改期 - ${st?.name}: ${lesson.date} · ${lesson.time} → ${date} · ${time}${reason ? ` (${reason})` : ""}`
      : `${st?.name} 申請改期: ${lesson.date} · ${lesson.time} → ${date} · ${time}${reason ? ` (${reason})` : ""}`;
    
    const newNotification: Notification = {
      id: Date.now() + 1,
      toRole: role === "teacher" ? "student" : "teacher",
      toStudentId: role === "teacher" ? lesson.studentId : undefined,
      text: notifText,
      time: "Just now",
      read: false,
      type: "reschedule",
      lessonId: lesson.id,
    };
    
    onRescheduleRequestsChange([...rescheduleRequests, req]);
    onScheduleChange(updatedSchedule);
    onNotificationsChange([...notifications, newNotification]);
    setRescheduleLesson(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {rescheduleLesson && (
        <RescheduleModal
          lesson={rescheduleLesson}
          student={students.find((s) => s.id === (role === "teacher" ? rescheduleLesson.studentId : studentId))}
          onSubmit={submitReschedule}
          onClose={() => setRescheduleLesson(null)}
          role={role}
        />
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: "6px",
              borderRadius: 8,
              border: "0.5px solid var(--color-border-tertiary)",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
          <button
            onClick={() => navigate(1)}
            style={{
              padding: "6px",
              borderRadius: 8,
              border: "0.5px solid var(--color-border-tertiary)",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <div
            style={{
              display: "flex",
              background: "var(--color-background-secondary, #f3f4f6)",
              borderRadius: 8,
              padding: 2,
            }}
          >
            {(["week", "month"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  padding: "5px 12px",
                  borderRadius: 6,
                  border: "none",
                  fontSize: 12,
                  cursor: "pointer",
                  background: viewMode === mode ? "#fff" : "transparent",
                  fontWeight: viewMode === mode ? 500 : 400,
                  boxShadow: viewMode === mode ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                }}
              >
                {mode === "week" ? "週" : "月"}
              </button>
            ))}
          </div>

          {role === "teacher" && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "6px 12px",
                borderRadius: 8,
                background: COLORS.purple,
                color: "#fff",
                border: "none",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              <Plus className="w-4 h-4" />
              新增
            </button>
          )}
        </div>
      </div>

      {/* Add Lesson Form */}
      {showAddForm && role === "teacher" && (
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>新增課程</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              <div>
                <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4 }}>學生</div>
                <select
                  value={form.studentId}
                  onChange={(e) => setForm({ ...form, studentId: Number(e.target.value) })}
                  style={{
                    width: "100%",
                    fontSize: 13,
                    padding: "6px 8px",
                    borderRadius: 6,
                    border: "0.5px solid var(--color-border-secondary)",
                  }}
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4 }}>日期</div>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  style={{
                    width: "100%",
                    fontSize: 13,
                    padding: "6px 8px",
                    borderRadius: 6,
                    border: "0.5px solid var(--color-border-secondary)",
                  }}
                />
              </div>
              <div>
                <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4 }}>時間</div>
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  style={{
                    width: "100%",
                    fontSize: 13,
                    padding: "6px 8px",
                    borderRadius: 6,
                    border: "0.5px solid var(--color-border-secondary)",
                  }}
                />
              </div>
              <div>
                <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4 }}>時長</div>
                <select
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                  style={{
                    width: "100%",
                    fontSize: 13,
                    padding: "6px 8px",
                    borderRadius: 6,
                    border: "0.5px solid var(--color-border-secondary)",
                  }}
                >
                  <option value={30}>30 分鐘</option>
                  <option value={45}>45 分鐘</option>
                  <option value={60}>60 分鐘</option>
                  <option value={90}>90 分鐘</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowAddForm(false)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  border: "0.5px solid var(--color-border-secondary)",
                  background: "transparent",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                取消
              </button>
              <button
                onClick={addLesson}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  border: "none",
                  background: COLORS.purple,
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                新增課程
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Calendar */}
      <Card>
        <CalendarGrid
          schedule={visibleSchedule}
          students={students}
          viewMode={viewMode}
          anchor={anchor}
          onDayClick={handleDayClick}
          selectedDate={selectedDate}
        />
      </Card>

      {/* Day Detail */}
      <Card>
        <DayDetail
          date={selectedDate}
          schedule={visibleSchedule}
          students={students}
          role={role}
          onTeacherAction={role === "teacher" ? teacherAction : undefined}
          onStudentAction={role === "student" ? studentAction : undefined}
          onRequestReschedule={setRescheduleLesson}
        />
      </Card>
    </div>
  );
}

// ── RescheduleModal ───────────────────────────────────────
interface RescheduleModalProps {
  lesson: Schedule;
  student?: Student;
  onSubmit: (data: { date: string; time: string; reason: string }) => void;
  onClose: () => void;
  role: "teacher" | "student";
}

function RescheduleModal({ lesson, student, onSubmit, onClose, role }: RescheduleModalProps) {
  const [date, setDate] = useState(lesson.date);
  const [time, setTime] = useState(lesson.time);
  const [reason, setReason] = useState("");

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div style={{ background: "var(--color-background-primary, #fff)", borderRadius: 14, padding: "1.25rem", width: 300, border: "0.5px solid var(--color-border-tertiary)" }}>
        <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 14, color: "var(--color-text-primary)" }}>
          {role === "teacher" ? "申請改期（老師）" : "申請改期"}
        </div>
        <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 4 }}>目前: {lesson.date} · {lesson.time}</div>
        {student && <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 4 }}>學生: {student.name}</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 4 }}>新日期</div>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: "100%", fontSize: 13, padding: "6px 8px", borderRadius: 6, border: "0.5px solid var(--color-border-secondary)", boxSizing: "border-box" }} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 4 }}>新時間</div>
            <input type="time" value={time} onChange={e => setTime(e.target.value)} style={{ width: "100%", fontSize: 13, padding: "6px 8px", borderRadius: 6, border: "0.5px solid var(--color-border-secondary)", boxSizing: "border-box" }} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 4 }}>原因（選填）</div>
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={2} placeholder="例如：考試週" style={{ width: "100%", fontSize: 13, padding: "6px 8px", borderRadius: 6, border: "0.5px solid var(--color-border-secondary)", boxSizing: "border-box", resize: "none" }} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button onClick={() => onSubmit({ date, time, reason })} style={{ flex: 1, background: COLORS.purple, color: "#fff", border: "none", borderRadius: 8, padding: "9px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>送出申請</button>
          <button onClick={onClose} style={{ padding: "9px 14px", background: "transparent", border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, fontSize: 13, cursor: "pointer", color: "var(--color-text-secondary)" }}>取消</button>
        </div>
      </div>
    </div>
  );
}
