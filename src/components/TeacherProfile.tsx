import { useState, useEffect, useRef, type ChangeEvent, type FormEvent } from "react";
import { User, Building2, Music, FileText, Camera, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Card } from "./Card";
import { pairingApi, type TeacherProfile } from "../api/client";

interface TeacherProfileProps {
  userId?: number;
}

interface FormData {
  name: string;
  studio: string;
  specialty: string;
  bio: string;
}

interface FormErrors {
  name?: string;
  studio?: string;
  specialty?: string;
  bio?: string;
}

const MAX_NAME_LENGTH = 20;
const MAX_STUDIO_LENGTH = 50;
const MAX_SPECIALTY_LENGTH = 30;
const MAX_BIO_LENGTH = 150;

export function TeacherProfile({ userId }: TeacherProfileProps) {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    studio: "",
    specialty: "",
    bio: "",
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 載入現有資料
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await pairingApi.getTeacherProfile();
        if (response.success && response.data.profile) {
          const p = response.data.profile;
          setProfile(p);
          setFormData({
            name: p.name || "",
            studio: p.studio || "",
            specialty: p.specialty || "",
            bio: p.bio || "",
          });
          if (p.avatarUrl) {
            setAvatarPreview(p.avatarUrl);
          }
        }
      } catch (err) {
        setError((err as Error).message || "載入資料失敗");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "姓名為必填欄位";
    } else if (formData.name.length > MAX_NAME_LENGTH) {
      newErrors.name = `姓名上限 ${MAX_NAME_LENGTH} 字`;
    }

    if (formData.studio.length > MAX_STUDIO_LENGTH) {
      newErrors.studio = `教室名稱上限 ${MAX_STUDIO_LENGTH} 字`;
    }

    if (formData.specialty.length > MAX_SPECIALTY_LENGTH) {
      newErrors.specialty = `專長上限 ${MAX_SPECIALTY_LENGTH} 字`;
    }

    if (formData.bio.length > MAX_BIO_LENGTH) {
      newErrors.bio = `自我介紹上限 ${MAX_BIO_LENGTH} 字`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FormData) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 清除該欄位錯誤
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    setSuccess(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 檢查檔案大小 (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setSaveError("圖片大小超過 2MB 限制");
      return;
    }

    // 檢查檔案類型
    if (!file.type.startsWith("image/")) {
      setSaveError("請上傳圖片檔案");
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setSaveError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      setSaveError(null);
      setSuccess(false);

      // 如果有新頭像，先上傳（這裡模擬為 base64，實際應使用 FormData 上傳到檔案服務）
      const payload: Partial<TeacherProfile> = {
        name: formData.name.trim(),
        studio: formData.studio.trim(),
        specialty: formData.specialty.trim(),
        bio: formData.bio.trim(),
      };

      if (avatarPreview && avatarPreview.startsWith("data:")) {
        payload.avatarUrl = avatarPreview;
      }

      const response = await pairingApi.updateTeacherProfile(payload);
      if (response.success) {
        setProfile(response.data.profile);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
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

        {/* 大頭照 */}
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={handleAvatarClick}
            className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-gray-300 hover:border-purple transition-colors bg-gray-50 flex items-center justify-center"
          >
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="大頭照預覽"
                className="w-full h-full object-cover"
              />
            ) : (
              <Camera className="w-8 h-8 text-gray-400" />
            )}
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
          <p className="text-xs text-gray-400 mt-2">點擊上傳大頭照（建議 1:1，上限 2MB）</p>
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
              value={formData.name}
              onChange={handleChange("name")}
              placeholder="請輸入姓名"
              maxLength={MAX_NAME_LENGTH}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                errors.name
                  ? "border-coral focus:ring-coral/20 focus:border-coral"
                  : "border-gray-200 focus:ring-purple/20 focus:border-purple"
              }`}
            />
          </div>
          <div className="flex justify-between mt-1">
            {errors.name ? (
              <span className="text-xs text-coral">{errors.name}</span>
            ) : (
              <span />
            )}
            <span className="text-xs text-gray-400">
              {formData.name.length}/{MAX_NAME_LENGTH}
            </span>
          </div>
        </div>

        {/* 所屬音樂教室 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            所屬音樂教室
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={formData.studio}
              onChange={handleChange("studio")}
              placeholder="例如：台北音樂教室"
              maxLength={MAX_STUDIO_LENGTH}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                errors.studio
                  ? "border-coral focus:ring-coral/20 focus:border-coral"
                  : "border-gray-200 focus:ring-purple/20 focus:border-purple"
              }`}
            />
          </div>
          <div className="flex justify-between mt-1">
            {errors.studio ? (
              <span className="text-xs text-coral">{errors.studio}</span>
            ) : (
              <span />
            )}
            <span className="text-xs text-gray-400">
              {formData.studio.length}/{MAX_STUDIO_LENGTH}
            </span>
          </div>
        </div>

        {/* 樂器專長 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            樂器專長
          </label>
          <div className="relative">
            <Music className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={formData.specialty}
              onChange={handleChange("specialty")}
              placeholder="例如：鋼琴、小提琴"
              maxLength={MAX_SPECIALTY_LENGTH}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                errors.specialty
                  ? "border-coral focus:ring-coral/20 focus:border-coral"
                  : "border-gray-200 focus:ring-purple/20 focus:border-purple"
              }`}
            />
          </div>
          <div className="flex justify-between mt-1">
            {errors.specialty ? (
              <span className="text-xs text-coral">{errors.specialty}</span>
            ) : (
              <span />
            )}
            <span className="text-xs text-gray-400">
              {formData.specialty.length}/{MAX_SPECIALTY_LENGTH}
            </span>
          </div>
        </div>

        {/* 自我介紹 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            自我介紹
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <textarea
              value={formData.bio}
              onChange={handleChange("bio")}
              placeholder="簡短介紹您的教學風格..."
              maxLength={MAX_BIO_LENGTH}
              rows={4}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none ${
                errors.bio
                  ? "border-coral focus:ring-coral/20 focus:border-coral"
                  : "border-gray-200 focus:ring-purple/20 focus:border-purple"
              }`}
            />
          </div>
          <div className="flex justify-between mt-1">
            {errors.bio ? (
              <span className="text-xs text-coral">{errors.bio}</span>
            ) : (
              <span />
            )}
            <span className="text-xs text-gray-400">
              {formData.bio.length}/{MAX_BIO_LENGTH}
            </span>
          </div>
        </div>

        {/* 錯誤訊息 */}
        {saveError && (
          <div className="flex items-center gap-2 text-coral text-sm p-3 bg-coral-light rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        {/* 成功訊息 */}
        {success && (
          <div className="flex items-center gap-2 text-teal text-sm p-3 bg-teal-light rounded-lg">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>個人資料已更新</span>
          </div>
        )}

        {/* 儲存按鈕 */}
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
          ) : (
            "儲存資料"
          )}
        </button>
      </form>
    </Card>
  );
}
