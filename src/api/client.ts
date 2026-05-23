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
    throw new Error(data.error || '請求失敗');
  }

  return data;
}

// ==================== 認證 API ====================
export const authApi = {
  login: (email: string, password: string) =>
    request<{ success: boolean; data: { token: string; user: any } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string, role: string) =>
    request<{ success: boolean; data: { token: string; user: any } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    }),

  me: () =>
    request<{ success: boolean; data: { user: any } }>('/auth/me'),
};

// ==================== 學生 API ====================
export const studentsApi = {
  getAll: () =>
    request<{ success: boolean; data: { students: any[] } }>('/students'),

  getById: (id: number) =>
    request<{ success: boolean; data: { student: any } }>(`/students/${id}`),

  create: (student: { name: string; email: string; instrument: string; lessonsTotal?: number; phone?: string }) =>
    request<{ success: boolean; data: { student: any } }>('/students', {
      method: 'POST',
      body: JSON.stringify(student),
    }),

  update: (id: number, student: Partial<{ name: string; instrument: string; lessonsTotal: number; phone: string }>) =>
    request<{ success: boolean; data: { student: any } }>(`/students/${id}`, {
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
    return request<{ success: boolean; data: { lessons: any[] } }>(`/lessons${query}`);
  },

  create: (lesson: { studentId: number; lessonDate: string; lessonTime: string; duration?: number }) =>
    request<{ success: boolean; data: { lesson: any } }>('/lessons', {
      method: 'POST',
      body: JSON.stringify(lesson),
    }),

  update: (id: number, lesson: Partial<{ lessonDate: string; lessonTime: string; duration: number; status: string }>) =>
    request<{ success: boolean; data: { lesson: any } }>(`/lessons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(lesson),
    }),

  delete: (id: number) =>
    request<{ success: boolean; data: { message: string } }>(`/lessons/${id}`, {
      method: 'DELETE',
    }),

  addCredits: (studentId: number, amount: number, reason?: string) =>
    request<{ success: boolean; data: { creditChange: any } }>('/lessons/credits', {
      method: 'POST',
      body: JSON.stringify({ studentId, amount, reason }),
    }),

  getCredits: (studentId: number) =>
    request<{ success: boolean; data: { creditChanges: any[] } }>(`/lessons/credits/${studentId}`),
};

// ==================== 改期 API ====================
export const rescheduleApi = {
  getAll: () =>
    request<{ success: boolean; data: { requests: any[] } }>('/reschedule'),

  create: (payload: { lessonId: number; requestedDate: string; requestedTime: string; reason?: string }) =>
    request<{ success: boolean; data: { request: any } }>('/reschedule', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateStatus: (id: number, status: 'accepted' | 'rejected') =>
    request<{ success: boolean; data: { request: any } }>(`/reschedule/${id}`, {
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
    return request<{ success: boolean; data: { records: any[] } }>(`/attendance${query}`);
  },

  create: (record: { studentId: number; lessonId?: number; recordDate: string; teacherAction?: string; studentAction?: string }) =>
    request<{ success: boolean; data: { record: any } }>('/attendance', {
      method: 'POST',
      body: JSON.stringify(record),
    }),

  update: (id: number, record: Partial<{ teacherAction: string; studentAction: string }>) =>
    request<{ success: boolean; data: { record: any } }>(`/attendance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(record),
    }),
};

// ==================== 通知 API ====================
export const notificationsApi = {
  getAll: () =>
    request<{ success: boolean; data: { notifications: any[] } }>('/notifications'),

  getUnread: () =>
    request<{ success: boolean; data: { notifications: any[] } }>('/notifications/unread'),

  markAsRead: (id: number) =>
    request<{ success: boolean; data: { notification: any } }>(`/notifications/${id}/read`, {
      method: 'PUT',
    }),

  markAllAsRead: () =>
    request<{ success: boolean; data: { message: string } }>('/notifications/read-all', {
      method: 'PUT',
    }),
};
