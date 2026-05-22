export interface Student {
  id: number;
  name: string;
  instrument: string;
  lessonsTotal: number;
  lessonsUsed: number;
  avatar: string;
}

export interface Schedule {
  id: number;
  studentId: number;
  date: string;
  time: string;
  status: "pending_student" | "confirmed" | "reschedule_requested" | "cancelled";
  duration: number | undefined;
}

export interface RescheduleRequest {
  id: number;
  lessonId: number;
  studentId: number;
  requestedDate: string;
  requestedTime: string;
  reason: string;
  status: "pending" | "accepted" | "rejected";
  createdAt?: string;
}

export interface AttendanceRecord {
  id: number;
  studentId: number;
  date: string;
  teacherAction: "present" | "absent" | "confirmed" | null;
  studentAction: "present" | "absent" | "confirmed" | null;
  lessonId?: number;
}

export interface Notification {
  id: number;
  toRole: "teacher" | "student";
  toStudentId?: number;
  text: string;
  time: string;
  read: boolean;
  type: "warning" | "schedule" | "info" | "success" | "reschedule";
  lessonId?: number;
}

export const COLORS = {
  purple: "#7F77DD",
  purpleLight: "#EEEDFE",
  purpleDark: "#3C3489",
  teal: "#1D9E75",
  tealLight: "#E1F5EE",
  tealDark: "#085041",
  amber: "#BA7517",
  amberLight: "#FAEEDA",
  amberDark: "#633806",
  coral: "#D85A30",
  coralLight: "#FAECE7",
  coralDark: "#4A1B0C",
  pink: "#D4537E",
  pinkLight: "#FBEAF0",
};

export const avatarColors = ["#7F77DD", "#1D9E75", "#D85A30", "#D4537E"];

export const initData: {
  students: Student[];
  schedule: Schedule[];
  rescheduleRequests: RescheduleRequest[];
  attendance: AttendanceRecord[];
  notifications: Notification[];
} = {
  students: [
    { id: 1, name: "林小美", instrument: "鋼琴", lessonsTotal: 20, lessonsUsed: 8, avatar: "林" },
    { id: 2, name: "張大偉", instrument: "吉他", lessonsTotal: 12, lessonsUsed: 12, avatar: "張" },
    { id: 3, name: "陳思婷", instrument: "小提琴", lessonsTotal: 16, lessonsUsed: 5, avatar: "陳" },
    { id: 4, name: "劉建宏", instrument: "鼓", lessonsTotal: 10, lessonsUsed: 9, avatar: "劉" },
  ],
  schedule: [
    { id: 1, studentId: 1, date: "2026-05-05", time: "10:00", status: "confirmed", duration: 60 },
    { id: 2, studentId: 3, date: "2026-05-05", time: "11:30", status: "pending_student", duration: 45 },
    { id: 3, studentId: 2, date: "2026-05-06", time: "14:00", status: "confirmed", duration: 60 },
    { id: 4, studentId: 4, date: "2026-05-07", time: "16:00", status: "pending_student", duration: 30 },
    { id: 5, studentId: 1, date: "2026-05-12", time: "10:00", status: "confirmed", duration: 60 },
    { id: 6, studentId: 3, date: "2026-05-14", time: "13:00", status: "confirmed", duration: 45 },
    { id: 7, studentId: 4, date: "2026-05-19", time: "15:00", status: "pending_student", duration: 30 },
    { id: 8, studentId: 2, date: "2026-05-20", time: "11:00", status: "confirmed", duration: 60 },
    { id: 9, studentId: 1, date: "2026-05-26", time: "10:00", status: "confirmed", duration: 60 },
  ],
  rescheduleRequests: [],
  attendance: [
    { id: 1, studentId: 1, date: "2026-04-28", teacherAction: "present", studentAction: "confirmed" },
    { id: 2, studentId: 2, date: "2026-04-28", teacherAction: "present", studentAction: null },
    { id: 3, studentId: 3, date: "2026-04-29", teacherAction: "absent", studentAction: "confirmed" },
    { id: 4, studentId: 4, date: "2026-04-29", teacherAction: null, studentAction: "present" },
  ] as AttendanceRecord[],
  notifications: [
    { id: 1, toRole: "student", toStudentId: 2, text: "張大偉已完成所有12堂課程！", time: "2小時前", read: false, type: "warning" },
    { id: 2, toRole: "student", toStudentId: 3, text: "新課程已安排：5月5日 11:30 — 請確認", time: "5小時前", read: false, type: "schedule", lessonId: 2 },
    { id: 3, toRole: "teacher", text: "劉建宏只剩1堂課", time: "1天前", read: false, type: "info" },
    { id: 4, toRole: "student", toStudentId: 4, text: "新課程已安排：5月7日 16:00 — 請確認", time: "3小時前", read: false, type: "schedule", lessonId: 4 },
    { id: 5, toRole: "student", toStudentId: 4, text: "新課程已安排：5月19日 15:00 — 請確認", time: "1小時前", read: false, type: "schedule", lessonId: 7 },
  ],
};

// Normalizers: map API response field names to local TypeScript types.
// Handles both camelCase and snake_case from the backend.

export function normalizeStudent(a: any): Student {
  return {
    id: a.id,
    name: a.name ?? '',
    instrument: a.instrument ?? '',
    lessonsTotal: a.lessonsTotal ?? a.lessons_total ?? 0,
    lessonsUsed: a.lessonsUsed ?? a.lessons_used ?? 0,
    avatar: a.avatar ?? (a.name ? (a.name as string).charAt(0) : '?'),
  };
}

export function normalizeSchedule(a: any): Schedule {
  return {
    id: a.id,
    studentId: a.studentId ?? a.student_id ?? 0,
    date: a.date ?? a.lessonDate ?? a.lesson_date ?? '',
    time: a.time ?? a.lessonTime ?? a.lesson_time ?? '',
    status: a.status ?? 'pending_student',
    duration: a.duration,
  };
}

export function normalizeNotification(a: any): Notification {
  return {
    id: a.id,
    toRole: a.toRole ?? a.to_role ?? 'teacher',
    toStudentId: a.toStudentId ?? a.to_student_id,
    text: a.text ?? a.message ?? '',
    time: a.time ?? a.created_at ?? '',
    read: a.read ?? a.is_read ?? false,
    type: a.type ?? 'info',
    lessonId: a.lessonId ?? a.lesson_id,
  };
}

export function normalizeAttendance(a: any): AttendanceRecord {
  return {
    id: a.id,
    studentId: a.studentId ?? a.student_id ?? 0,
    date: a.date ?? a.recordDate ?? a.record_date ?? '',
    teacherAction: a.teacherAction ?? a.teacher_action ?? null,
    studentAction: a.studentAction ?? a.student_action ?? null,
    lessonId: a.lessonId ?? a.lesson_id,
  };
}

export function normalizeRescheduleRequest(a: any): RescheduleRequest {
  return {
    id: a.id,
    lessonId: a.lessonId ?? a.lesson_id ?? 0,
    studentId: a.studentId ?? a.student_id ?? 0,
    requestedDate: a.requestedDate ?? a.requested_date ?? '',
    requestedTime: a.requestedTime ?? a.requested_time ?? '',
    reason: a.reason ?? '',
    status: a.status ?? 'pending',
    createdAt: a.createdAt ?? a.created_at,
  };
}
