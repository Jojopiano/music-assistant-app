import { useState, useEffect, useCallback } from "react";
import { KeyRound, RefreshCw, Copy, Link2, Clock, AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { Card } from "./Card";
import { pairingApi, type InviteCode } from "../api/client";

interface InviteCodeGeneratorProps {
  teacherName?: string;
}

export function InviteCodeGenerator({ teacherName }: InviteCodeGeneratorProps) {
  const [inviteCode, setInviteCode] = useState<InviteCode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const fetchInviteCode = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await pairingApi.getInviteCode();
      if (response.success) {
        setInviteCode(response.data.inviteCode);
      }
    } catch (err) {
      setError((err as Error).message || "載入邀請代碼失敗");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInviteCode();
  }, [fetchInviteCode]);

  const handleRegenerate = async () => {
    try {
      setRegenerating(true);
      setError(null);
      const response = await pairingApi.generateInviteCode();
      if (response.success) {
        setInviteCode(response.data.inviteCode);
        setShowConfirm(false);
      }
    } catch (err) {
      setError((err as Error).message || "重新產生失敗");
    } finally {
      setRegenerating(false);
    }
  };

  const handleCopyCode = async () => {
    if (!inviteCode) return;
    try {
      await navigator.clipboard.writeText(inviteCode.code);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch {
      setError("複製失敗，請手動複製");
    }
  };

  const handleCopyLink = async () => {
    if (!inviteCode) return;
    const link = `${window.location.origin}/invite/${inviteCode.code}`;
    try {
      await navigator.clipboard.writeText(link);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      setError("複製失敗，請手動複製");
    }
  };

  const formatTimeRemaining = (code: InviteCode): string => {
    if (code.remainingDays > 0) {
      return `還有 ${code.remainingDays} 天 ${code.remainingHours} 小時`;
    }
    if (code.remainingHours > 0) {
      return `還有 ${code.remainingHours} 小時`;
    }
    return "即將過期";
  };

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

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-purple" />
          <h2 className="text-lg font-semibold text-gray-900">邀請代碼</h2>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-coral text-sm p-3 bg-coral-light rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {inviteCode ? (
          <div className="space-y-4">
            {/* 代碼顯示 */}
            <div className="bg-purple-light rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-purple tracking-widest font-mono">
                {inviteCode.code.slice(0, 3)} {inviteCode.code.slice(3)}
              </div>
              <div className="flex items-center justify-center gap-1 text-sm text-purple-dark mt-2">
                <Clock className="w-4 h-4" />
                <span>{formatTimeRemaining(inviteCode)}</span>
              </div>
            </div>

            {/* 操作按鈕 */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleCopyCode}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple text-white rounded-lg font-medium hover:bg-purple-dark transition-colors"
              >
                {codeCopied ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    已複製
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    複製代碼
                  </>
                )}
              </button>
              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-teal text-white rounded-lg font-medium hover:bg-teal-dark transition-colors"
              >
                {linkCopied ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    已複製
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4" />
                    複製連結
                  </>
                )}
              </button>
            </div>

            {/* 重新產生 */}
            {!showConfirm ? (
              <button
                onClick={() => setShowConfirm(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                重新產生代碼
              </button>
            ) : (
              <div className="bg-amber-light rounded-lg p-4 space-y-3">
                <p className="text-sm text-amber-dark">
                  重新產生後，目前的代碼 <strong>{inviteCode.code}</strong> 將立即失效，已分享的連結也會失效。確定要繼續嗎？
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleRegenerate}
                    disabled={regenerating}
                    className="flex-1 px-4 py-2 bg-coral text-white rounded-lg font-medium hover:bg-coral-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {regenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        產生中...
                      </>
                    ) : (
                      "確定重新產生"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">目前沒有有效的邀請代碼</p>
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="px-6 py-2.5 bg-purple text-white rounded-lg font-medium hover:bg-purple-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
            >
              {regenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  產生中...
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  產生邀請代碼
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}
