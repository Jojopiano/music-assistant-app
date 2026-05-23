import { useState, useEffect, useCallback } from "react";
import { Users, UserCheck, UserX, Clock, AlertCircle, Loader2, Trash2, XCircle } from "lucide-react";
import { Card } from "./Card";
import { Avatar } from "./Avatar";
import { pairingApi, type StudentListItem } from "../api/client";

interface StudentListProps {
  teacherId?: number;
}

export function StudentList({ teacherId }: StudentListProps) {
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dissolvingId, setDissolvingId] = useState<number | null>(null);
  const [confirmDissolve, setConfirmDissolve] = useState<number | null>(null);
  const [dissolveError, setDissolveError] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await pairingApi.getStudentList();
      if (response.success) {
        setStudents(response.data.students);
      }
    } catch (err) {
      setError((err as Error).message || "載入學生列表失敗");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents, teacherId]);

  const handleDissolve = async (studentId: number) => {
    try {
      setDissolvingId(studentId);
      setDissolveError(null);
      const response = await pairingApi.dissolveRelationship(studentId);
      if (response.success) {
        setStudents((prev) => prev.filter((s) => s.id !== studentId));
        setConfirmDissolve(null);
      }
    } catch (err) {
      setDissolveError((err as Error).message || "解除配對失敗");
    } finally {
      setDissolvingId(null);
    }
  };

  const pairedStudents = students.filter((s) => s.status === "paired");
  const invitedStudents = students.filter((s) => s.status === "invited");

  const renderStudentItem = (student: StudentListItem, index: number) => (
    <div
      key={student.id}
      className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0"
    >
      <Avatar initials={student.avatar || student.name.charAt(0)} idx={index} size={40} />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 truncate">{student.name}</div>
        <div className="text-xs text-gray-500 truncate">{student.email}</div>
      </div>
      <div className="flex items-center gap-2">
        {student.status === "paired" ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-teal-light text-teal-dark">
            <UserCheck className="w-3 h-3" />
            已配對
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-light text-amber-dark">
            <Clock className="w-3 h-3" />
            邀請中
          </span>
        )}

        {confirmDissolve === student.id ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setConfirmDissolve(null)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="取消"
            >
              <XCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDissolve(student.id)}
              disabled={dissolvingId === student.id}
              className="p-1.5 text-coral hover:text-coral-dark hover:bg-coral-light rounded-lg transition-colors"
              title="確認解除"
            >
              {dissolvingId === student.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setConfirmDissolve(student.id);
              setDissolveError(null);
            }}
            className="p-1.5 text-gray-400 hover:text-coral hover:bg-coral-light rounded-lg transition-colors"
            title="解除配對"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-purple animate-spin" />
          <span className="ml-2 text-gray-500">載入中...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="flex items-center gap-2 text-coral py-4">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple" />
            <h2 className="text-lg font-semibold text-gray-900">我的學生</h2>
          </div>
          <span className="text-sm text-gray-500">
            共 {students.length} 位
          </span>
        </div>

        {dissolveError && (
          <div className="flex items-center gap-2 text-coral text-sm p-3 bg-coral-light rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{dissolveError}</span>
          </div>
        )}

        {students.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">尚無學生</p>
            <p className="text-sm text-gray-400 mt-1">使用邀請代碼邀請學生加入</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 已配對 */}
            {pairedStudents.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <UserCheck className="w-4 h-4 text-teal" />
                  已配對 ({pairedStudents.length})
                </h3>
                <div className="bg-gray-50 rounded-lg px-3">
                  {pairedStudents.map((s, i) => renderStudentItem(s, i))}
                </div>
              </div>
            )}

            {/* 邀請中 */}
            {invitedStudents.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <Clock className="w-4 h-4 text-amber" />
                  邀請中 ({invitedStudents.length})
                </h3>
                <div className="bg-gray-50 rounded-lg px-3">
                  {invitedStudents.map((s, i) => renderStudentItem(s, i + pairedStudents.length))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
