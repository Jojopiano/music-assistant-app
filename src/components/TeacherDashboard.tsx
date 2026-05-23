import { useState, useEffect } from "react";
import { Users, Bell, ChevronLeft, AlertCircle, BookOpen, CheckCircle } from "lucide-react";
import {
  COLORS, initData,
  normalizeStudent, normalizeSchedule, normalizeNotification, normalizeAttendance, normalizeRescheduleRequest,
  type Student, type Schedule, type Notification, type RescheduleRequest, type AttendanceRecord,
} from "../data";
import { useStudents, useLessons, useNotifications, useAttendance, useRescheduleRequests } from "../hooks/useApiData";
import { lessonsApi, notificationsApi } from "../api/client";
import { Avatar } from "./Avatar";
import { Card } from "./Card";
import { ScheduleView } from "./ScheduleView";
import { CheckinView } from "./CheckinView";
import { ReportView } from "./ReportView";
import { AddLessonsView } from "./AddLessonsView";
import { NotificationsView } from "./NotificationsView";

type Tab = "dashboard" | "schedule" | "checkin" | "lessons" | "addLessons" | "reports" | "notifications";

interface TeacherDashboardProps {
  onBack: () => void;
  userName?: string;
  userId?: number;
}

export function TeacherDashboard({ onBack, userName, userId }: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [students, setStudents] = useState<Student[]>(initData.students);
  const [schedule, setSchedule] = useState<Schedule[]>(initData.schedule);
  const [notifications, setNotifications] = useState<Notification[]>(initData.notifications);
  const [rescheduleRequests, setRescheduleRequests] = useState<RescheduleRequest[]>(initData.rescheduleRequests);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(initData.attendance);

  // Load real data from API; fall back to initData only if the API errors
  const { students: apiStudents, loading: studentsLoading, error: studentsError } = useStudents();
  const { lessons: apiLessons, loading: lessonsLoading, error: lessonsError } = useLessons();
  const { notifications: apiNotifications, loading: notificationsLoading, error: notificationsError } = useNotifications();
  const { records: apiAttendance, loading: attendanceLoading, error: attendanceError } = useAttendance();
  const { requests: apiReschedule, loading: rescheduleLoading, error: rescheduleError } = useRescheduleRequests();

  useEffect(() => {
    if (!studentsLoading && studentsError === null) {
      setStudents((apiStudents ?? []).map(normalizeStudent));
    }
  }, [apiStudents, studentsLoading, studentsError]);

  useEffect(() => {
    if (!lessonsLoading && lessonsError === null) {
      setSchedule((apiLessons ?? []).map(normalizeSchedule));
    }
  }, [apiLessons, lessonsLoading, lessonsError]);

  useEffect(() => {
    if (!notificationsLoading && notificationsError === null) {
      setNotifications((apiNotifications ?? []).map(normalizeNotification));
    }
  }, [apiNotifications, notificationsLoading, notificationsError]);

  useEffect(() => {
    if (!attendanceLoading && attendanceError === null) {
      setAttendance((apiAttendance ?? []).map(normalizeAttendance));
    }
  }, [apiAttendance, attendanceLoading, attendanceError]);

  useEffect(() => {
    if (!rescheduleLoading && rescheduleError === null) {
      setRescheduleRequests((apiReschedule ?? []).map(normalizeRescheduleRequest));
    }
  }, [apiReschedule, rescheduleLoading, rescheduleError]);

  const today = new Date().toLocaleDateString('en-CA');
  const unreadCount = notifications.filter(n => !n.read && n.toRole === "teacher").length;
  const pendingRescheduleCount = rescheduleRequests.filter(r => r.status === "pending").length;
  const todayLessons = schedule.filter(s => s.date === today).length;

  const markNotificationRead = async (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await notificationsApi.markAsRead(id);
    } catch (err) {
      console.error("標記通知已讀 API 失敗:", err);
    }
  };

  const tabs = [
    { id: "dashboard" as Tab, label: "首頁", badge: 0 },
    { id: "schedule" as Tab, label: "課表", badge: 0 },
    { id: "checkin" as Tab, label: "打卡", badge: 0 },
    { id: "lessons" as Tab, label: "課程", badge: 0 },
    { id: "addLessons" as Tab, label: "新增堂數", badge: 0 },
    { id: "reports" as Tab, label: "報表", badge: 0 },
    { id: "notifications" as Tab, label: "通知", badge: unreadCount },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-purple-light flex items-center justify-center">
                <Users className="w-5 h-5 text-purple" />
              </div>
              <div>
                <h1 className="font-semibold text-gray-900">{userName || "老師"}控制台</h1>
                <p className="text-xs text-gray-500">管理您的音樂教室</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("notifications")}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-coral text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map(({ id, label, badge }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors relative whitespace-nowrap ${
                  activeTab === id
                    ? "border-purple text-purple"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <span className="text-sm font-medium">{label}</span>
                {badge > 0 && (
                  <span className="bg-coral text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "學生數", value: students.length, color: COLORS.purple, bg: COLORS.purpleLight },
                { label: "今日課程", value: todayLessons, color: COLORS.teal, bg: COLORS.tealLight },
                { label: "改期申請", value: pendingRescheduleCount, color: COLORS.coral, bg: COLORS.coralLight },
              ].map(m => (
                <div key={m.label} style={{ background: m.bg, borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ fontSize: 11, color: m.color, fontWeight: 500, marginBottom: 4 }}>{m.label}</div>
                  <div style={{ fontSize: 26, fontWeight: 500, color: m.color }}>{m.value}</div>
                </div>
              ))}
            </div>

            <Card>
              <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 12, color: "var(--color-text-primary)" }}>學生列表</div>
              {students.map((s, i) => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < students.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                  <Avatar initials={s.avatar} idx={i} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 14, color: "var(--color-text-primary)" }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{s.instrument}</div>
                  </div>
                  <div style={{ fontSize: 12, color: s.lessonsUsed >= s.lessonsTotal ? COLORS.coral : COLORS.teal, fontWeight: 500 }}>
                    {s.lessonsUsed}/{s.lessonsTotal}
                  </div>
                </div>
              ))}
            </Card>
          </div>
        )}

        {activeTab === "schedule" && (
          <ScheduleView
            schedule={schedule}
            students={students}
            notifications={notifications}
            rescheduleRequests={rescheduleRequests}
            role="teacher"
            onScheduleChange={setSchedule}
            onNotificationsChange={setNotifications}
            onRescheduleRequestsChange={setRescheduleRequests}
          />
        )}

        {activeTab === "checkin" && (
          <CheckinView
            attendance={attendance}
            students={students}
            role="teacher"
            onAttendanceChange={setAttendance}
            onNotificationsChange={setNotifications}
            notifications={notifications}
          />
        )}

        {activeTab === "addLessons" && (
          <AddLessonsView
            students={students}
            schedule={schedule}
            onAddLessons={async (studentId, amount) => {
              setStudents(prev => prev.map(s =>
                s.id === studentId ? { ...s, lessonsTotal: s.lessonsTotal + amount } : s
              ));
              try {
                await lessonsApi.addCredits(studentId, amount);
              } catch (err) {
                console.error("新增堂數 API 失敗:", err);
              }
            }}
          />
        )}

        {activeTab === "reports" && (
          <ReportView
            schedule={schedule}
            students={students}
            attendance={attendance}
            role="teacher"
          />
        )}

        {activeTab === "lessons" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">學生課程進度</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {students.map((student, idx) => {
                const studentLessons = schedule.filter(s => s.studentId === student.id);
                const completedLessons = studentLessons.filter(s => s.status === "confirmed").length;
                const progress = (student.lessonsUsed / student.lessonsTotal) * 100;

                return (
                  <Card key={student.id} style={{ marginBottom: 0 }}>
                    <div className="flex items-start gap-4">
                      <Avatar initials={student.avatar} idx={idx} size={48} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-lg">{student.name}</h3>
                          <span className="text-sm text-gray-500">{student.instrument}</span>
                        </div>

                        <div className="mt-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-500">課程進度</span>
                            <span className="font-medium">{student.lessonsUsed}/{student.lessonsTotal}</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-purple h-2 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="mt-4 flex gap-4 text-sm">
                          <div className="flex items-center gap-1 text-gray-500">
                            <BookOpen className="w-4 h-4" />
                            <span>{studentLessons.length} 已排程</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-500">
                            <CheckCircle className="w-4 h-4" />
                            <span>{completedLessons} 已確認</span>
                          </div>
                        </div>

                        {progress >= 100 && (
                          <div className="mt-3 flex items-center gap-1 text-amber">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">所有課程已完成！</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <NotificationsView
            notifications={notifications.filter(n => n.toRole === "teacher")}
            onMarkRead={markNotificationRead}
            role="teacher"
          />
        )}
      </main>
    </div>
  );
}
