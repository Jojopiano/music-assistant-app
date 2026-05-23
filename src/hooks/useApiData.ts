import { useState, useEffect, useCallback } from 'react';
import { studentsApi, lessonsApi, notificationsApi, attendanceApi, rescheduleApi } from '../api/client';

// 學生資料 Hook
export function useStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await studentsApi.getAll();
      if (response.success) {
        setStudents(response.data?.students ?? []);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return { students, loading, error, refetch: fetchStudents };
}

// 課程資料 Hook
export function useLessons(params?: { studentId?: number; dateFrom?: string; dateTo?: string; status?: string }) {
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLessons = useCallback(async () => {
    try {
      setLoading(true);
      const response = await lessonsApi.getAll(params);
      if (response.success) {
        setLessons(response.data?.lessons ?? []);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [params?.studentId, params?.dateFrom, params?.dateTo, params?.status]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  return { lessons, loading, error, refetch: fetchLessons };
}

// 通知資料 Hook
export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await notificationsApi.getAll();
      if (response.success) {
        setNotifications(response.data?.notifications ?? []);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: number) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error('Mark as read failed:', err);
    }
  };

  return { notifications, loading, error, refetch: fetchNotifications, markAsRead };
}

// 出席資料 Hook
export function useAttendance(params?: { studentId?: number; dateFrom?: string; dateTo?: string }) {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      const response = await attendanceApi.getAll(params);
      if (response.success) {
        setRecords(response.data?.records ?? []);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [params?.studentId, params?.dateFrom, params?.dateTo]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  return { records, loading, error, refetch: fetchAttendance };
}

// 改期申請 Hook
export function useRescheduleRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await rescheduleApi.getAll();
      if (response.success) {
        setRequests(response.data?.requests ?? []);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return { requests, loading, error, refetch: fetchRequests };
}
