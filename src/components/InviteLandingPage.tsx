import { useState, useEffect } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { Card } from "./Card";
import { pairingApi } from "../api/client";

interface InviteLandingPageProps {
  code: string;
  isLoggedIn: boolean;
  onNavigateToLogin: (savedCode: string) => void;
  onNavigateToPairing: (code: string) => void;
  onNavigateHome: () => void;
}

const SESSION_STORAGE_KEY = "pending_invite_code";

export function InviteLandingPage({
  code,
  isLoggedIn,
  onNavigateToLogin,
  onNavigateToPairing,
  onNavigateHome,
}: InviteLandingPageProps) {
  const [validating, setValidating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processInvite = async () => {
      if (!code) {
        setError("邀請代碼無效");
        setValidating(false);
        return;
      }

      // 未登入：保存 code 到 sessionStorage，導向登入頁
      if (!isLoggedIn) {
        try {
          sessionStorage.setItem(SESSION_STORAGE_KEY, code);
        } catch {
          // sessionStorage 不可用時靜默處理
        }
        onNavigateToLogin(code);
        return;
      }

      // 已登入：驗證邀請代碼
      try {
        setValidating(true);
        setError(null);
        const response = await pairingApi.validateInviteCode(code);
        if (response.success) {
          if (response.data.valid) {
            // 驗證成功，跳到配對確認頁
            onNavigateToPairing(code);
          } else {
            setError("此邀請已過期，請向老師索取新代碼");
          }
        } else {
          setError("此邀請已過期，請向老師索取新代碼");
        }
      } catch (err) {
        setError((err as Error).message || "驗證邀請代碼失敗");
      } finally {
        setValidating(false);
      }
    };

    processInvite();
  }, [code, isLoggedIn, onNavigateToLogin, onNavigateToPairing]);

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

  if (error) {
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

  // 正常流程會在 useEffect 中導航，不應該渲染到這裡
  return null;
}

// 工具函式：檢查並取得保留的邀請代碼
export function getPendingInviteCode(): string | null {
  try {
    return sessionStorage.getItem(SESSION_STORAGE_KEY);
  } catch {
    return null;
  }
}

// 工具函式：清除保留的邀請代碼
export function clearPendingInviteCode(): void {
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // 靜默處理
  }
}
