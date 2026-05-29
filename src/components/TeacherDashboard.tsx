import { useState, useEffect } from "react";
import { Users, Bell, ChevronLeft, AlertCircle, BookOpen, CheckCircle, Settings } from "lucide-react";
import {
  initData,
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
  onSettings?: () => void;
}

export function TeacherDashboard({ onBack, userName, userId, onSettings }: TeacherDashboardProps) {
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
            <button onClick={onBack} aria-label="返回" className="p-3 hover:bg-gray-100 rounded-lg transition-colors">
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
              aria-label="通知"
              className="relative p-3 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-coral text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={onSettings}
              aria-label="設定"
              className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="relative">
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
            <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white to-transparent" />
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
                { label: "學生數", value: students.length, bg: "bg-purple-light", text: "text-purple" },
                { label: "今日課程", value: todayLessons, bg: "bg-teal-light", text: "text-teal" },
                { label: "改期申請", value: pendingRescheduleCount, bg: "bg-coral-light", text: "text-coral" },
              ].map(m => (
                <div key={m.label} className={`${m.bg} rounded-xl px-3.5 py-3`}>
                  <div className={`text-[11px] ${m.text} font-medium mb-1`}>{m.label}</div>
                  <div className={`text-2xl font-medium ${m.text}`}>{m.value}</div>
                </div>
              ))}
            </div>

            <Card>
              <div className="text-base font-medium mb-3 text-gray-900">學生列表</div>
              {students.map((s, i) => (
                <div key={s.id} className={`flex items-center gap-2.5 py-2 ${i < students.length - 1 ? "border-b border-gray-100" : ""}`}>
                  <Avatar initials={s.avatar} idx={i} />
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">{s.name}</div>
                    <div className="text-xs text-gray-500">{s.instrument}</div>
                  </div>
                  <div className={`text-xs font-medium ${s.lessonsUsed >= s.lessonsTotal ? "text-coral" : "text-teal"}`}>
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
