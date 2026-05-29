import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { User, Mail, Phone, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Card } from "./Card";
import { pairingApi } from "../api/client";

interface StudentProfileProps {
  onNameUpdate?: (name: string) => void;
}

interface FormData {
  displayName: string;
  phone: string;
}

const MAX_NAME_LENGTH = 20;

export function StudentProfile({ onNameUpdate }: StudentProfileProps) {
  const [email, setEmail] = useState("");
  const [formData, setFormData] = useState<FormData>({ displayName: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [nameError, setNameError] = useState<string | undefined>();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await pairingApi.getMyProfile();
        if (response.success && response.data?.user) {
          const u = response.data.user;
          setEmail(u.email || "");
          setFormData({
            displayName: u.display_name || u.name || "",
            phone: u.phone || "",
          });
        }
      } catch (err) {
        setError((err as Error).message || "載入資料失敗");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (field: keyof FormData) => (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (field === "displayName") setNameError(undefined);
    setSuccess(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.displayName.trim()) {
      setNameError("姓名為必填欄位");
      return;
    }
    if (formData.displayName.length > MAX_NAME_LENGTH) {
      setNameError(`姓名上限 ${MAX_NAME_LENGTH} 字`);
      return;
    }

    try {
      setSaving(true);
      setSaveError(null);
      const response = await pairingApi.updateTeacherProfile({
        displayName: formData.displayName.trim(),
        phone: formData.phone.trim(),
      });
      if (response.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        onNameUpdate?.(formData.displayName.trim());
      }
    } catch (err) {
      setSaveError((err as Error).message || "儲存失敗，請稍後再試");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-12">
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
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">個人資料設定</h2>

        {/* 帳號 ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">帳號 ID（Email）</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={email}
              readOnly
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">帳號 ID 無法修改</p>
        </div>

        {/* 姓名 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            姓名／暱稱 <span className="text-coral">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={formData.displayName}
              onChange={handleChange("displayName")}
              placeholder="請輸入姓名"
              maxLength={MAX_NAME_LENGTH}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                nameError
                  ? "border-coral focus:ring-coral/20 focus:border-coral"
                  : "border-gray-200 focus:ring-purple/20 focus:border-purple"
              }`}
            />
          </div>
          <div className="flex justify-between mt-1">
            {nameError ? (
              <span className="text-xs text-coral">{nameError}</span>
            ) : <span />}
            <span className="text-xs text-gray-400">{formData.displayName.length}/{MAX_NAME_LENGTH}</span>
          </div>
        </div>

        {/* 聯絡手機 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">聯絡手機</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="tel"
              value={formData.phone}
              onChange={handleChange("phone")}
              placeholder="例如：0912345678"
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple/20 focus:border-purple transition-all"
            />
          </div>
        </div>

        {saveError && (
          <div className="flex items-center gap-2 text-coral text-sm p-3 bg-coral-light rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 text-teal text-sm p-3 bg-teal-light rounded-lg">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>個人資料已更新</span>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2.5 bg-purple text-white rounded-lg font-medium hover:bg-purple-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              儲存中...
            </>
          ) : "儲存資料"}
        </button>
      </form>
    </Card>
  );
}
