import { useMemo } from "react";
import { COLORS, type Schedule, type Student, type AttendanceRecord } from "../data";
import { Avatar } from "./Avatar";
import { Card } from "./Card";

interface ReportViewProps {
  schedule: Schedule[];
  students: Student[];
  attendance: AttendanceRecord[];
  role: "teacher" | "student";
  studentId?: number;
}

export function ReportView({ schedule, students, attendance, role, studentId }: ReportViewProps) {
  // 計算出席率
  const attendanceStats = useMemo(() => {
    const stats = students.map((student) => {
      const studentAttendance = attendance.filter((a) => a.studentId === student.id);
      const totalRecords = studentAttendance.length;
      const presentCount = studentAttendance.filter(
        (a) => a.teacherAction && a.studentAction
      ).length;
      const absentCount = studentAttendance.filter(
        (a) => a.teacherAction === "absent" || a.studentAction === "absent"
      ).length;
      const pendingCount = totalRecords - presentCount - absentCount;

      const rate = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;

      return {
        student,
        totalRecords,
        presentCount,
        absentCount,
        pendingCount,
        rate,
      };
    });

    return role === "student"
      ? stats.filter((s) => s.student.id === studentId)
      : stats;
  }, [attendance, students, role, studentId]);

  // 計算課程進度
  const lessonProgress = useMemo(() => {
    return students.map((student) => {
      const studentSchedule = schedule.filter((s) => s.studentId === student.id);
      const confirmedLessons = studentSchedule.filter((s) => s.status === "confirmed").length;
      const pendingLessons = studentSchedule.filter((s) => s.status === "pending_student").length;
      const rescheduleLessons = studentSchedule.filter(
        (s) => s.status === "reschedule_requested"
      ).length;
      const totalLessons = studentSchedule.length;

      const completionRate =
        student.lessonsTotal > 0
          ? Math.round((student.lessonsUsed / student.lessonsTotal) * 100)
          : 0;

      return {
        student,
        confirmedLessons,
        pendingLessons,
        rescheduleLessons,
        totalLessons,
        completionRate,
        remainingLessons: student.lessonsTotal - student.lessonsUsed,
      };
    }).filter((s) => (role === "student" ? s.student.id === studentId : true));
  }, [schedule, students, role, studentId]);

  // 整體統計
  const overallStats = useMemo(() => {
    const totalStudents = students.length;
    const totalLessons = schedule.length;
    const totalConfirmed = schedule.filter((s) => s.status === "confirmed").length;
    const totalPending = schedule.filter((s) => s.status === "pending_student").length;
    const totalReschedule = schedule.filter((s) => s.status === "reschedule_requested").length;

    const totalAttendance = attendance.length;
    const totalPresent = attendance.filter((a) => a.teacherAction && a.studentAction).length;
    const overallAttendanceRate =
      totalAttendance > 0 ? Math.round((totalPresent / totalAttendance) * 100) : 0;

    return {
      totalStudents,
      totalLessons,
      totalConfirmed,
      totalPending,
      totalReschedule,
      overallAttendanceRate,
    };
  }, [students, schedule, attendance]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* 整體統計卡片 */}
      {role === "teacher" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {[
            {
              label: "總學生數",
              value: overallStats.totalStudents,
              color: COLORS.purple,
              bg: COLORS.purpleLight,
            },
            {
              label: "總課程數",
              value: overallStats.totalLessons,
              color: COLORS.teal,
              bg: COLORS.tealLight,
            },
            {
              label: "整體出席率",
              value: `${overallStats.overallAttendanceRate}%`,
              color: COLORS.amber,
              bg: COLORS.amberLight,
            },
          ].map((m) => (
            <div
              key={m.label}
              style={{ background: m.bg, borderRadius: 10, padding: "12px 14px" }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: m.color,
                  fontWeight: 500,
                  marginBottom: 4,
                }}
              >
                {m.label}
              </div>
              <div style={{ fontSize: 26, fontWeight: 500, color: m.color }}>
                {m.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 出席率報表 */}
      <Card>
        <div
          style={{
            fontSize: 16,
            fontWeight: 500,
            marginBottom: 12,
            color: "var(--color-text-primary)",
          }}
        >
          出席率報表
        </div>
        {attendanceStats.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
            暫無出席記錄
          </div>
        ) : (
          attendanceStats.map(({ student, totalRecords, presentCount, absentCount, pendingCount, rate }, idx) => (
            <div
              key={student.id}
              style={{
                padding: "12px 0",
                borderBottom:
                  idx < attendanceStats.length - 1
                    ? "0.5px solid var(--color-border-tertiary)"
                    : "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 8,
                }}
              >
                <Avatar initials={student.avatar} idx={idx} size={34} />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {student.name}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
                    {student.instrument}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 500,
                    color:
                      rate >= 80 ? COLORS.teal : rate >= 60 ? COLORS.amber : COLORS.coral,
                  }}
                >
                  {rate}%
                </div>
              </div>

              {/* 進度條 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <div
                  style={{
                    flex: 1,
                    height: 8,
                    background: "var(--color-background-secondary)",
                    borderRadius: 4,
                    overflow: "hidden",
                    display: "flex",
                  }}
                >
                  <div
                    style={{
                      width: `${rate}%`,
                      height: "100%",
                      background:
                        rate >= 80
                          ? COLORS.teal
                          : rate >= 60
                          ? COLORS.amber
                          : COLORS.coral,
                      borderRadius: 4,
                    }}
                  />
                </div>
              </div>

              {/* 詳細數據 */}
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  fontSize: 11,
                  color: "var(--color-text-secondary)",
                }}
              >
                <span>
                  總計: <b>{totalRecords}</b> 次
                </span>
                <span style={{ color: COLORS.teal }}>
                  出席: <b>{presentCount}</b>
                </span>
                <span style={{ color: COLORS.coral }}>
                  缺席: <b>{absentCount}</b>
                </span>
                {pendingCount > 0 && (
                  <span style={{ color: COLORS.amber }}>
                    待確認: <b>{pendingCount}</b>
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </Card>

      {/* 課程進度報表 */}
      <Card>
        <div
          style={{
            fontSize: 16,
            fontWeight: 500,
            marginBottom: 12,
            color: "var(--color-text-primary)",
          }}
        >
          課程進度報表
        </div>
        {lessonProgress.map(
          (
            {
              student,
              confirmedLessons,
              pendingLessons,
              rescheduleLessons,
              totalLessons,
              completionRate,
              remainingLessons,
            },
            idx
          ) => (
            <div
              key={student.id}
              style={{
                padding: "12px 0",
                borderBottom:
                  idx < lessonProgress.length - 1
                    ? "0.5px solid var(--color-border-tertiary)"
                    : "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 8,
                }}
              >
                <Avatar initials={student.avatar} idx={idx} size={34} />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {student.name}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
                    {student.instrument} · 總課堂數: {student.lessonsTotal}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color:
                      remainingLessons === 0
                        ? COLORS.coral
                        : remainingLessons <= 2
                        ? COLORS.amber
                        : COLORS.teal,
                  }}
                >
                  {remainingLessons === 0
                    ? "已用完"
                    : `剩餘 ${remainingLessons} 堂`}
                </div>
              </div>

              {/* 課程包進度 */}
              <div style={{ marginBottom: 8 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 11,
                    color: "var(--color-text-secondary)",
                    marginBottom: 4,
                  }}
                >
                  <span>課程包進度</span>
                  <span>
                    {student.lessonsUsed}/{student.lessonsTotal} ({completionRate}%)
                  </span>
                </div>
                <div
                  style={{
                    height: 6,
                    background: "var(--color-background-secondary)",
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${completionRate}%`,
                      height: "100%",
                      background:
                        completionRate >= 80
                          ? COLORS.teal
                          : completionRate >= 50
                          ? COLORS.amber
                          : COLORS.purple,
                      borderRadius: 3,
                    }}
                  />
                </div>
              </div>

              {/* 排程狀態 */}
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  fontSize: 11,
                  color: "var(--color-text-secondary)",
                }}
              >
                <span>
                  已排程: <b>{totalLessons}</b> 堂
                </span>
                <span style={{ color: COLORS.teal }}>
                  已確認: <b>{confirmedLessons}</b>
                </span>
                <span style={{ color: COLORS.amber }}>
                  待確認: <b>{pendingLessons}</b>
                </span>
                {rescheduleLessons > 0 && (
                  <span style={{ color: COLORS.pink }}>
                    改期中: <b>{rescheduleLessons}</b>
                  </span>
                )}
              </div>
            </div>
          )
        )}
      </Card>

      {/* 課程狀態分佈 */}
      {role === "teacher" && (
        <Card>
          <div
            style={{
              fontSize: 16,
              fontWeight: 500,
              marginBottom: 12,
              color: "var(--color-text-primary)",
            }}
          >
            課程狀態分佈
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
            {[
              {
                label: "已確認",
                value: overallStats.totalConfirmed,
                color: COLORS.teal,
                bg: COLORS.tealLight,
              },
              {
                label: "待確認",
                value: overallStats.totalPending,
                color: COLORS.amber,
                bg: COLORS.amberLight,
              },
              {
                label: "改期中",
                value: overallStats.totalReschedule,
                color: COLORS.pink,
                bg: COLORS.pinkLight,
              },
              {
                label: "已取消",
                value: schedule.filter((s) => s.status === "cancelled").length,
                color: COLORS.coral,
                bg: COLORS.coralLight,
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  background: item.bg,
                  borderRadius: 8,
                  padding: "10px 12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: 12, color: item.color, fontWeight: 500 }}>
                  {item.label}
                </span>
                <span style={{ fontSize: 18, fontWeight: 500, color: item.color }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
