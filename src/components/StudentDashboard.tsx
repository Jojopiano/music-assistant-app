import { useState, useEffect } from "react";
import { Bell, ChevronLeft, CheckCircle, AlertCircle, BookOpen, RotateCcw } from "lucide-react";
import { format, isToday, isPast, parseISO } from "date-fns";
import { zhTW } from "date-fns/locale";
import {
  initData,
  normalizeStudent, normalizeSchedule, normalizeNotification, normalizeAttendance, normalizeRescheduleRequest,
  type Student, type Schedule, type Notification, type RescheduleRequest, type AttendanceRecord,
} from "../data";
import { useStudents, useLessons, useNotifications, useAttendance, useRescheduleRequests } from "../hooks/useApiData";
import { notificationsApi } from "../api/client";
import { Avatar } from "./Avatar";
import { Badge } from "./Badge";
import { Card } from "./Card";
import { ScheduleView } from "./ScheduleView";
import { CheckinView } from "./CheckinView";
import { ReportView } from "./ReportView";
import { NotificationsView } from "./NotificationsView";

type Tab = "schedule" | "checkin" | "lessons" | "reports" | "notifications";

interface StudentDashboardProps {
  studentId: number;
  onBack: () => void;
  userName?: string;
}

export function StudentDashboard({ studentId, onBack, userName }: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>("schedule");
  const [students, setStudents] = useState<Student[]>(initData.students);
  const [schedule, setSchedule] = useState<Schedule[]>(initData.schedule);
  const [notifications, setNotifications] = useState<Notification[]>(initData.notifications);
  const [rescheduleRequests, setRescheduleRequests] = useState<RescheduleRequest[]>(initData.rescheduleRequests);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(initData.attendance);
  const [showRescheduleModal, setShowRescheduleModal] = useState<number | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");

  // Load real data from API; fall back to initData only if the API errors
  const { students: apiStudents, loading: studentsLoading, error: studentsError } = useStudents();
  const { lessons: apiLessons, loading: lessonsLoading, error: lessonsError } = useLessons({ studentId });
  const { notifications: apiNotifications, loading: notificationsLoading, error: notificationsError } = useNotifications();
  const { records: apiAttendance, loading: attendanceLoading, error: attendanceError } = useAttendance({ studentId });
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

  const student = students.find(s => s.id === studentId);
  const studentSchedule = schedule.filter(s => s.studentId === studentId);
  const studentNotifications = notifications.filter(n =>
    n.toRole === "student" && n.toStudentId === studentId
  );
  const unreadCount = studentNotifications.filter(n => !n.read).length;

  const handleConfirmLesson = (lessonId: number) => {
    setSchedule(prev => prev.map(s =>
      s.id === lessonId ? { ...s, status: "confirmed" as const } : s
    ));

    setNotifications(prev => prev.map(n =>
      n.lessonId === lessonId ? { ...n, read: true } : n
    ));

    const lesson = schedule.find(s => s.id === lessonId);
    const newNotification: Notification = {
      id: Date.now(),
      toRole: "teacher",
      text: `${student?.name} 確認了課程 ${lesson?.date} · ${lesson?.time}`,
      time: "剛剛",
      read: false,
      type: "success",
    };
    setNotifications(prev => [...prev, newNotification]);
  };

  const handleRequestReschedule = (lessonId: number) => {
    if (!rescheduleDate || !rescheduleTime || !rescheduleReason) return;

    const newRequest: RescheduleRequest = {
      id: Date.now(),
      lessonId,
      studentId,
      requestedDate: rescheduleDate,
      requestedTime: rescheduleTime,
      reason: rescheduleReason,
      status: "pending",
    };

    setRescheduleRequests([...rescheduleRequests, newRequest]);

    setSchedule(prev => prev.map(s =>
      s.id === lessonId ? { ...s, status: "reschedule_requested" as const } : s
    ));

    const lesson = schedule.find(s => s.id === lessonId);
    const newNotification: Notification = {
      id: Date.now() + 1,
      toRole: "teacher",
      text: `${student?.name} 申請改期: ${lesson?.date} · ${lesson?.time} → ${rescheduleDate} · ${rescheduleTime} (${rescheduleReason})`,
      time: "剛剛",
      read: false,
      type: "schedule",
      lessonId: lessonId,
    };
    setNotifications(prev => [...prev, newNotification]);

    setShowRescheduleModal(null);
    setRescheduleDate("");
    setRescheduleTime("");
    setRescheduleReason("");
  };

  const markNotificationRead = async (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await notificationsApi.markAsRead(id);
    } catch (err) {
      console.error("標記通知已讀 API 失敗:", err);
    }
  };

  const upcomingLessons = studentSchedule
    .filter(s => !isPast(parseISO(s.date)) || isToday(parseISO(s.date)))
    .sort((a, b) => new Date(a.date + "T" + a.time).getTime() - new Date(b.date + "T" + b.time).getTime());

  const pastLessons = studentSchedule
    .filter(s => isPast(parseISO(s.date)) && !isToday(parseISO(s.date)))
    .sort((a, b) => new Date(b.date + "T" + b.time).getTime() - new Date(a.date + "T" + a.time).getTime());

  const progress = student ? (student.lessonsUsed / student.lessonsTotal) * 100 : 0;

  const tabs = [
    { id: "schedule" as Tab, label: "課表", badge: 0 },
    { id: "checkin" as Tab, label: "打卡", badge: 0 },
    { id: "lessons" as Tab, label: "課程", badge: 0 },
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
            <div className="flex items-center gap-3">
              <Avatar initials={student?.avatar || "?"} idx={studentId - 1} size={40} />
              <div>
                <h1 className="font-semibold text-gray-900">{userName || student?.name}</h1>
                <p className="text-xs text-gray-500">{student?.instrument} 學生</p>
              </div>
            </div>
          </div>

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
                      ? "border-teal text-teal"
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
        {activeTab === "schedule" && (
          <div className="space-y-6">
            <ScheduleView
              schedule={schedule}
              students={students}
              notifications={notifications}
              rescheduleRequests={rescheduleRequests}
              role="student"
              studentId={studentId}
              onScheduleChange={setSchedule}
              onNotificationsChange={setNotifications}
              onRescheduleRequestsChange={setRescheduleRequests}
            />

            {/* 即將到來的課程 */}
            <div>
              <h2 className="text-xl font-semibold mb-4">即將到來的課程</h2>

              {upcomingLessons.length === 0 ? (
                <Card>
                  <div className="p-12 text-center">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">暫無即將到來的課程</p>
                  </div>
                </Card>
              ) : (
                <div className="space-y-3">
                  {upcomingLessons.map(lesson => (
                    <Card key={lesson.id} style={{ marginBottom: 0 }}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            lesson.status === "confirmed" ? "bg-teal-light" : "bg-amber-light"
                          }`}>
                            <BookOpen className={`w-6 h-6 ${
                              lesson.status === "confirmed" ? "text-teal" : "text-amber"
                            }`} />
                          </div>
                          <div>
                            <div className="font-semibold">
                              {format(parseISO(lesson.date), "yyyy年M月d日 EEEE", { locale: zhTW })}
                            </div>
                            <div className="text-sm text-gray-500">
                              {lesson.time} · {lesson.duration} 分鐘
                            </div>
                          </div>
                        </div>
                        <Badge status={lesson.status} />
                      </div>

                      {lesson.status === "pending_student" && (
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => handleConfirmLesson(lesson.id)}
                            className="btn-teal flex items-center gap-1"
                          >
                            <CheckCircle className="w-4 h-4" />
                            確認
                          </button>
                          <button
                            onClick={() => setShowRescheduleModal(lesson.id)}
                            className="btn-secondary flex items-center gap-1"
                          >
                            <RotateCcw className="w-4 h-4" />
                            申請改期
                          </button>
                        </div>
                      )}

                      {lesson.status === "confirmed" && (
                        <button
                          onClick={() => setShowRescheduleModal(lesson.id)}
                          className="mt-4 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                        >
                          <RotateCcw className="w-4 h-4" />
                          申請改期
                        </button>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* 過去的課程 */}
            {pastLessons.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">過去的課程</h2>
                <div className="space-y-3">
                  {pastLessons.map(lesson => (
                    <Card key={lesson.id} style={{ opacity: 0.6, marginBottom: 0, transition: 'opacity 0.2s' }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="font-medium">{format(parseISO(lesson.date), "yyyy年M月d日", { locale: zhTW })}</div>
                            <div className="text-sm text-gray-500">{lesson.time}</div>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">{lesson.duration} 分鐘</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "checkin" && (
          <CheckinView
            attendance={attendance}
            students={students}
            role="student"
            studentId={studentId}
            onAttendanceChange={setAttendance}
            onNotificationsChange={setNotifications}
            notifications={notifications}
          />
        )}

        {activeTab === "lessons" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">我的進度</h2>

            {/* 進度卡片 */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">課程方案</h3>
                  <p className="text-sm text-gray-500">{student?.instrument}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple">{student?.lessonsUsed}</div>
                  <div className="text-sm text-gray-500">共 {student?.lessonsTotal} 堂</div>
                </div>
              </div>

              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="bg-purple h-3 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="mt-4 flex justify-between text-sm">
                <span className="text-gray-500">{progress.toFixed(0)}% 完成</span>
                <span className="text-gray-500">剩餘 {student ? student.lessonsTotal - student.lessonsUsed : 0} 堂</span>
              </div>

              {progress >= 100 && (
                <div className="mt-4 p-4 bg-amber-light rounded-lg flex items-center gap-2 text-amber-dark">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">您已完成所有課程！考慮續約方案。</span>
                </div>
              )}
            </Card>

            {/* 統計 */}
            <div className="grid grid-cols-2 gap-4">
              <Card style={{ textAlign: "center" }}>
                <div className="text-3xl font-bold text-teal mb-1">
                  {studentSchedule.filter(s => s.status === "confirmed").length}
                </div>
                <div className="text-sm text-gray-500">已確認課程</div>
              </Card>
              <Card style={{ textAlign: "center" }}>
                <div className="text-3xl font-bold text-purple mb-1">
                  {upcomingLessons.length}
                </div>
                <div className="text-sm text-gray-500">即將到來</div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "reports" && (
          <ReportView
            schedule={schedule}
            students={students}
            attendance={attendance}
            role="student"
            studentId={studentId}
          />
        )}

        {activeTab === "notifications" && (
          <NotificationsView
            notifications={studentNotifications}
            onMarkRead={markNotificationRead}
            role="student"
          />
        )}
      </main>

      {/* 改期彈窗 */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">申請改期</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">新日期</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">新時間</label>
                <input
                  type="time"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">原因</label>
                <textarea
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="為什麼需要改期？"
                  className="input min-h-[100px] resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRescheduleModal(null)}
                className="btn-secondary flex-1"
              >
                取消
              </button>
              <button
                onClick={() => handleRequestReschedule(showRescheduleModal)}
                disabled={!rescheduleDate || !rescheduleTime || !rescheduleReason}
                className="btn-primary flex-1"
              >
                送出申請
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
