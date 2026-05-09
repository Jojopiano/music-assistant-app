import { useState } from "react";
import { Music, User, Lock, Mail } from "lucide-react";

interface LoginViewProps {
  onLogin: (role: "teacher" | "student", email: string, password: string) => void;
  onRegister: (name: string, email: string, password: string, role: string) => void;
  onBack: () => void;
  onSocialLogin: () => void;
  defaultRole?: "teacher" | "student";
}

export function LoginView({ onLogin, onRegister, onBack, onSocialLogin, defaultRole = "student" }: LoginViewProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [role, setRole] = useState<"teacher" | "student">(defaultRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email || !password) {
      setError("請填寫所有欄位");
      return;
    }

    if (isRegistering) {
      if (!name) {
        setError("請輸入姓名");
        return;
      }
      if (password !== confirmPassword) {
        setError("密碼不一致");
        return;
      }
      if (password.length < 6) {
        setError("密碼至少6個字元");
        return;
      }
      setError("");
      onRegister(name, email, password, role);
    } else {
      setError("");
      onLogin(role, email, password);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Music className="w-8 h-8 text-purple" />
            <h1 className="text-3xl font-bold text-gray-900">音樂小幫手</h1>
            <Music className="w-8 h-8 text-purple" />
          </div>
          <p className="text-gray-500">
            {isRegistering ? "註冊新帳號" : "登入"}
          </p>
        </div>

        <div className="card p-8 space-y-6">
          {/* 角色選擇 */}
          <div className="flex gap-2">
            <button
              onClick={() => setRole("teacher")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                role === "teacher"
                  ? "bg-purple text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              老師
            </button>
            <button
              onClick={() => setRole("student")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                role === "student"
                  ? "bg-teal text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              學生
            </button>
          </div>

          {/* 姓名（僅註冊時顯示） */}
          {isRegistering && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                姓名
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="請輸入姓名"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple/20 focus:border-purple"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="請輸入 Email"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple/20 focus:border-purple"
              />
            </div>
          </div>

          {/* 密碼 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              密碼
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isRegistering ? "至少6個字元" : "請輸入密碼"}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple/20 focus:border-purple"
              />
            </div>
          </div>

          {/* 確認密碼（僅註冊時顯示） */}
          {isRegistering && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                確認密碼
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="再次輸入密碼"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple/20 focus:border-purple"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="text-sm text-coral text-center">{error}</div>
          )}

          <button
            onClick={handleSubmit}
            className={`w-full py-3 text-base rounded-lg font-medium transition-colors ${
              role === "teacher"
                ? "bg-purple text-white hover:bg-purple-dark"
                : "bg-teal text-white hover:bg-teal-dark"
            }`}
          >
            {isRegistering ? "註冊" : "登入"}
          </button>

          {!isRegistering && (
            <>
              <div className="text-center text-sm text-gray-400 my-4">或</div>

              <button
                onClick={onSocialLogin}
                className="w-full py-3 text-base rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
              >
                使用 Apple / Google 登入
              </button>
            </>
          )}

          <div className="text-center text-sm">
            {isRegistering ? (
              <button
                onClick={() => {
                  setIsRegistering(false);
                  setError("");
                }}
                className="text-purple hover:text-purple-dark"
              >
                已有帳號？登入
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsRegistering(true);
                  setError("");
                }}
                className="text-purple hover:text-purple-dark"
              >
                沒有帳號？註冊
              </button>
            )}
          </div>

          {!isRegistering && (
            <div className="text-center text-xs text-gray-400 space-y-1 mt-4">
              <p>測試帳號：</p>
              <p>老師：teacher@test.com / 123456</p>
              <p>學生：lin@test.com / 123456</p>
            </div>
          )}
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={onBack}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← 返回首頁
          </button>
        </div>
      </div>
    </div>
  );
}
