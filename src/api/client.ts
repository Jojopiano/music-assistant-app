// API 客戶端 - 連接後端
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// 儲存 token
let authToken: string | null = localStorage.getItem('token');

export const setToken = (token: string) => {
  authToken = token;
  localStorage.setItem('token', token);
};

export const clearToken = () => {
  authToken = null;
  localStorage.removeItem('token');
};

export const getToken = () => authToken;

// 通用請求函數
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    const err = new Error(data.error || '請求失敗') as Error & { status: number };
    err.status = response.status;
    throw err;
  }

  return data;
}

// ==================== 認證 API ====================
export const authApi = {
  login: (email: string, password: string) =>
    request<{ success: boolean; data: { token: string; user: unknown } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string, role: string) =>
    request<{ success: boolean; data: { token: string; user: unknown } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    }),

  me: () =>
    request<{ success: boolean; data: { user: unknown } }>('/auth/me'),
};

// ==================== 學生 API ====================
export const studentsApi = {
  getAll: () =>
    request<{ success: boolean; data: { students: unknown[] } }>('/students'),

  getById: (id: number) =>
    request<{ success: boolean; data: { student: unknown } }>(`/students/${id}`),

  create: (student: { name: string; email: string; instrument: string; lessonsTotal?: number; phone?: string }) =>
    request<{ success: boolean; data: { student: unknown } }>('/students', {
      method: 'POST',
      body: JSON.stringify(student),
    }),

  update: (id: number, student: Partial<{ name: string; instrument: string; lessonsTotal: number; phone: string }>) =>
    request<{ success: boolean; data: { student: unknown } }>(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(student),
    }),

  delete: (id: number) =>
    request<{ success: boolean; data: { message: string } }>(`/students/${id}`, {
      method: 'DELETE',
    }),
};

// ==================== 課程 API ====================
export const lessonsApi = {
  getAll: (params?: { studentId?: number; dateFrom?: string; dateTo?: string; status?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.studentId) queryParams.append('studentId', params.studentId.toString());
    if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
    if (params?.dateTo) queryParams.append('dateTo', params.dateTo);
    if (params?.status) queryParams.append('status', params.status);
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return request<{ success: boolean; data: { lessons: unknown[] } }>(`/lessons${query}`);
  },

  create: (lesson: { studentId: number; lessonDate: string; lessonTime: string; duration?: number }) =>
    request<{ success: boolean; data: { lesson: unknown } }>('/lessons', {
      method: 'POST',
      body: JSON.stringify(lesson),
    }),

  update: (id: number, lesson: Partial<{ lessonDate: string; lessonTime: string; duration: number; status: string }>) =>
    request<{ success: boolean; data: { lesson: unknown } }>(`/lessons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(lesson),
    }),

  delete: (id: number) =>
    request<{ success: boolean; data: { message: string } }>(`/lessons/${id}`, {
      method: 'DELETE',
    }),

  addCredits: (studentId: number, amount: number, reason?: string) =>
    request<{ success: boolean; data: { creditChange: unknown } }>('/lessons/credits', {
      method: 'POST',
      body: JSON.stringify({ studentId, amount, reason }),
    }),

  getCredits: (studentId: number) =>
    request<{ success: boolean; data: { creditChanges: unknown[] } }>(`/lessons/credits/${studentId}`),
};

// ==================== 改期 API ====================
export const rescheduleApi = {
  getAll: () =>
    request<{ success: boolean; data: { requests: unknown[] } }>('/reschedule'),

  create: (payload: { lessonId: number; requestedDate: string; requestedTime: string; reason?: string }) =>
    request<{ success: boolean; data: { request: unknown } }>('/reschedule', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateStatus: (id: number, status: 'accepted' | 'rejected') =>
    request<{ success: boolean; data: { request: unknown } }>(`/reschedule/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
};

// ==================== 出席 API ====================
export const attendanceApi = {
  getAll: (params?: { studentId?: number; dateFrom?: string; dateTo?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.studentId) queryParams.append('studentId', params.studentId.toString());
    if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
    if (params?.dateTo) queryParams.append('dateTo', params.dateTo);
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return request<{ success: boolean; data: { records: unknown[] } }>(`/attendance${query}`);
  },

  create: (record: { studentId: number; lessonId?: number; recordDate: string; teacherAction?: string; studentAction?: string }) =>
    request<{ success: boolean; data: { record: unknown } }>('/attendance', {
      method: 'POST',
      body: JSON.stringify(record),
    }),

  update: (id: number, record: Partial<{ teacherAction: string; studentAction: string }>) =>
    request<{ success: boolean; data: { record: unknown } }>(`/attendance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(record),
    }),
};

// ==================== 通知 API ====================
export const notificationsApi = {
  getAll: () =>
    request<{ success: boolean; data: { notifications: unknown[] } }>('/notifications'),

  getUnread: () =>
    request<{ success: boolean; data: { notifications: unknown[] } }>('/notifications/unread'),

  markAsRead: (id: number) =>
    request<{ success: boolean; data: { notification: unknown } }>(`/notifications/${id}/read`, {
      method: 'PUT',
    }),

  markAllAsRead: () =>
    request<{ success: boolean; data: { message: string } }>('/notifications/read-all', {
      method: 'PUT',
    }),
};

// ==================== 師生配對 API ====================

export interface TeacherProfile {
  id: number;
  name: string;
  studio: string;
  specialty: string;
  bio: string;
  avatarUrl: string | null;
}

export interface InviteCode {
  code: string;
  expiresAt: string;
  remainingDays: number;
  remainingHours: number;
}

export interface StudentListItem {
  id: number;
  relationshipId: number;
  name: string;
  email: string;
  avatar: string;
  status: 'paired' | 'invited';
  joinedAt: string | null;
}

export function normalizeStudentListItem(a: any): StudentListItem {
  return {
    id: a.related_user_id ?? a.id,
    relationshipId: a.id,
    name: a.related_display_name || a.related_name || a.name || '',
    email: a.related_email || a.email || '',
    avatar: (a.related_display_name || a.related_name || a.name || '?').charAt(0),
    status: a.status === 'active' ? 'paired' : 'invited',
    joinedAt: a.activated_at || a.joined_at || a.joinedAt || null,
  };
}

export interface PairingTeacherInfo {
  id: number;
  name: string;
  studio: string;
  specialty: string;
  bio: string;
  avatarUrl: string | null;
}

export const pairingApi = {
  generateInviteCode: () =>
    request<{ success: boolean; data: { inviteCode: InviteCode } }>('/invite-codes', {
      method: 'POST',
    }),

  getInviteCode: () =>
    request<{ success: boolean; data: { inviteCode: InviteCode | null } }>('/invite-codes/me'),

  validateInviteCode: (code: string) =>
    request<{ success: boolean; data: { valid: boolean; teacher: PairingTeacherInfo | null } }>(`/invite-codes/validate/${code}`),

  confirmPairing: (code: string) =>
    request<{ success: boolean; data: { message: string } }>('/relationships', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),

  getStudentList: () =>
    request<{ success: boolean; data: { relationships: StudentListItem[] } }>('/relationships'),

  dissolveRelationship: (relationshipId: number) =>
    request<{ success: boolean; data: { message: string } }>(`/relationships/${relationshipId}`, {
      method: 'DELETE',
    }),

  updateTeacherProfile: (data: Partial<TeacherProfile>) =>
    request<{ success: boolean; data: { user: TeacherProfile } }>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getTeacherProfile: (userId: number) =>
    request<{ success: boolean; data: { user: TeacherProfile } }>(`/users/profile/${userId}`),
};
