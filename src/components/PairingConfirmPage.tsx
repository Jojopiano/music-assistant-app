import { useState, useEffect } from "react";

import { Music, Building2, FileText, CheckCircle, XCircle, AlertCircle, Loader2, User } from "lucide-react";
import { Card } from "./Card";
import { Avatar } from "./Avatar";
import { pairingApi, type PairingTeacherInfo } from "../api/client";

interface PairingConfirmPageProps {
  code?: string;
  userRole?: string;
  onNavigateHome?: () => void;
  onNavigateDashboard?: () => void;
}

export function PairingConfirmPage({ code: propCode, userRole, onNavigateHome, onNavigateDashboard }: PairingConfirmPageProps) {
  const code = propCode;

  const [teacher, setTeacher] = useState<PairingTeacherInfo | null>(null);
  const [validating, setValidating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const validateCode = async () => {
      if (!code) {
        setError("邀請代碼無效");
        setValidating(false);
        return;
      }

      try {
        setValidating(true);
        setError(null);
        const response = await pairingApi.validateInviteCode(code);
        if (response.success) {
          if (response.data.valid && response.data.teacher) {
            setTeacher(response.data.teacher);
          } else {
            setError("此邀請已過期，請向老師索取新代碼");
          }
        }
      } catch (err) {
        setError((err as Error).message || "驗證邀請代碼失敗");
      } finally {
        setValidating(false);
      }
    };

    validateCode();
  }, [code]);

  const handleConfirm = async () => {
    if (!code) return;
    try {
      setConfirming(true);
      setError(null);
      const response = await pairingApi.confirmPairing(code);
      if (response.success) {
        setConfirmed(true);
      }
    } catch (err: any) {
      if (err.status === 409 || (err.message && err.message.includes('409'))) {
        setError('你已經是這位老師的學生了');
      } else if (err.status === 410 || (err.message && err.message.toLowerCase().includes('expir'))) {
        setError('此邀請已過期，請向老師索取新代碼');
      } else if (err.status === 403) {
        setError('老師帳號無法使用邀請連結配對，請使用學生帳號登入後再試');
      } else {
        setError('配對失敗，請稍後再試');
      }
    } finally {
      setConfirming(false);
    }
  };

  const handleCancel = () => {
    onNavigateHome?.();
  };

  if (validating) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card style={{ width: "100%", maxWidth: 420 }}>
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-purple animate-spin" />
            <p className="mt-4 text-gray-500">驗證邀請代碼中...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error && !teacher) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card style={{ width: "100%", maxWidth: 420 }}>
          <div className="flex flex-col items-center text-center py-8">
            <div className="w-16 h-16 bg-coral-light rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-coral" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">無法使用此邀請</h2>
            <p className="text-gray-500 text-sm">{error}</p>
            <button
              onClick={onNavigateHome}
              className="mt-6 px-6 py-2 bg-purple text-white rounded-lg font-medium hover:bg-purple-dark transition-colors"
            >
              返回首頁
            </button>
          </div>
        </Card>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card style={{ width: "100%", maxWidth: 420 }}>
          <div className="flex flex-col items-center text-center py-8">
            <div className="w-16 h-16 bg-teal-light rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-teal" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">配對成功！</h2>
            <p className="text-gray-500 text-sm">
              您已成功與 <strong>{teacher?.name}</strong> 老師建立配對關係
            </p>
            <button
              onClick={onNavigateDashboard}
              className="mt-6 px-6 py-2 bg-teal text-white rounded-lg font-medium hover:bg-teal-dark transition-colors"
            >
              進入學生控制台
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div style={{ width: "100%", maxWidth: 420 }} className="space-y-4">
        {/* 標題 */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Music className="w-6 h-6 text-purple" />
            <h1 className="text-xl font-bold text-gray-900">音樂小幫手</h1>
          </div>
          <p className="text-sm text-gray-500">老師邀請您加入音樂教室</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-coral text-sm p-3 bg-coral-light rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 老師資料卡片 */}
        <Card>
          <div className="flex flex-col items-center text-center py-4">
            {/* 大頭照 */}
            {teacher?.avatarUrl ? (
              <img
                src={teacher.avatarUrl}
                alt={teacher.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-purple-light mb-4"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-purple-light flex items-center justify-center mb-4">
                <User className="w-10 h-10 text-purple" />
              </div>
            )}

            {/* 姓名 */}
            <h2 className="text-xl font-bold text-gray-900">{teacher?.name}</h2>

            {/* 教室 */}
            {teacher?.studio && (
              <div className="flex items-center gap-1 text-gray-500 mt-1">
                <Building2 className="w-4 h-4" />
                <span className="text-sm">{teacher.studio}</span>
              </div>
            )}

            {/* 專長 */}
            {teacher?.specialty && (
              <div className="flex items-center gap-1 text-purple mt-2">
                <Music className="w-4 h-4" />
                <span className="text-sm font-medium">{teacher.specialty}</span>
              </div>
            )}

            {/* 分隔線 */}
            {(teacher?.bio || teacher?.studio || teacher?.specialty) && (
              <div className="w-full h-px bg-gray-100 my-4" />
            )}

            {/* 自我介紹 */}
            {teacher?.bio ? (
              <div className="text-left w-full">
                <div className="flex items-center gap-1 text-gray-400 mb-1">
                  <FileText className="w-4 h-4" />
                  <span className="text-xs">自我介紹</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{teacher.bio}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">老師尚未填寫自我介紹</p>
            )}
          </div>
        </Card>

        {/* 老師帳號警告 */}
        {userRole === 'teacher' && (
          <div className="flex items-center gap-2 text-amber-dark text-sm p-3 bg-amber-light rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>您目前以老師帳號登入，無法使用此邀請連結。請用學生帳號登入後再試。</span>
          </div>
        )}

        {/* 確認按鈕 */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleCancel}
            disabled={confirming}
            className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={confirming}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-purple text-white rounded-lg font-medium hover:bg-purple-dark transition-colors disabled:opacity-50"
          >
            {confirming ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                處理中...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                確認配對
              </>
            )}
          </button>
        </div>

        <p className="text-center text-xs text-gray-400">
          確認配對後，您將可以看到老師的課表與課程資訊
        </p>
      </div>
    </div>
  );
}
