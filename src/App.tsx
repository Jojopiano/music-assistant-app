import { useState, useEffect } from "react";
import { RoleSelection } from "./components/RoleSelection";
import { LoginView } from "./components/LoginView";
import { SocialLogin } from "./components/SocialLogin";
import { TeacherDashboard } from "./components/TeacherDashboard";
import { StudentDashboard } from "./components/StudentDashboard";
import { TeacherSettings } from "./components/TeacherSettings";
import { PairingConfirmPage } from "./components/PairingConfirmPage";
import { authApi, setToken, clearToken, getToken } from "./api/client";

type View = "home" | "socialLogin" | "login" | "dashboard" | "settings" | "pairing";

interface User {
  id: number;
  name: string;
  email: string;
  role: "teacher" | "student";
  avatar?: string;
}

function App() {
  const [view, setView] = useState<View>("home");
  const [role, setRole] = useState<"teacher" | "student" | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<string>("檢查中...");
  const [pairingCode, setPairingCode] = useState<string | undefined>(undefined);

  // 檢查 API 連接
  useEffect(() => {
    const checkApi = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'}/health`);
        if (response.ok) {
          setApiStatus("✅ 後端連接正常");
        } else {
          setApiStatus("❌ 後端無回應");
        }
      } catch {
        setApiStatus("❌ 無法連接後端");
      }
    };

    checkApi();
  }, []);

  // 檢查是否已登入
  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await authApi.me();
        if (response.success && response.data?.user) {
          const userData = response.data.user;
          setUser(userData);
          setRole(userData.role);
          setView("dashboard");
        }
      } catch (error) {
        clearToken();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleSelectRole = (selectedRole: "teacher" | "student") => {
    setRole(selectedRole);
    setView("login");
  };

  const handleSocialLogin = async (provider: "apple" | "google") => {
    const mockName = provider === "apple" ? "Apple 用戶" : "Google 用戶";
    const mockUser = {
      id: 1,
      name: mockName,
      email: `${provider}@example.com`,
      role: role || "student",
    };
    setUser(mockUser);
    setView("dashboard");
  };

  const handleLogin = async (loggedInRole: "teacher" | "student", email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      if (response.success) {
        const { token, user: userData } = response.data ?? {};
        setToken(token);
        setUser(userData);
        setRole(userData.role);
        setView("dashboard");
      }
    } catch (error) {
      alert("登入失敗：" + (error as Error).message);
    }
  };

  const handleRegister = async (name: string, email: string, password: string, registerRole: string) => {
    try {
      const response = await authApi.register(name, email, password, registerRole);
      if (response.success) {
        const { token, user: userData } = response.data ?? {};
        setToken(token);
        setUser(userData);
        setRole(userData.role);
        setView("dashboard");
      }
    } catch (error) {
      alert("註冊失敗：" + (error as Error).message);
    }
  };

  const handleBack = () => {
    setView("home");
    setRole(null);
    setUser(null);
  };

  const handleLogout = () => {
    clearToken();
    setView("home");
    setRole(null);
    setUser(null);
    setPairingCode(undefined);
  };

  const handleOpenSettings = () => {
    setView("settings");
  };

  const handleOpenPairing = (code: string) => {
    setPairingCode(code);
    setView("pairing");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* API 狀態指示器 */}
      {import.meta.env.DEV && (
        <div className="fixed top-0 right-0 z-50 p-2">
          <span className="text-xs bg-white/80 backdrop-blur px-2 py-1 rounded shadow">
            {apiStatus}
          </span>
        </div>
      )}

      {view === "home" && <RoleSelection onSelectRole={handleSelectRole} />}

      {view === "login" && (
        <LoginView
          onLogin={handleLogin}
          onRegister={handleRegister}
          onBack={handleBack}
          onSocialLogin={() => setView("socialLogin")}
          defaultRole={role || "student"}
        />
      )}

      {view === "socialLogin" && (
        <SocialLogin
          onAppleLogin={() => handleSocialLogin("apple")}
          onGoogleLogin={() => handleSocialLogin("google")}
          onBack={() => setView("login")}
        />
      )}

      {view === "dashboard" && user && (
        user.role === "teacher" ? (
          <TeacherDashboard onBack={handleLogout} userName={user.name} userId={user.id} onSettings={handleOpenSettings} />
        ) : (
          <StudentDashboard studentId={user.id} onBack={handleLogout} userName={user.name} />
        )
      )}

      {view === "settings" && user?.role === "teacher" && (
        <TeacherSettings
          userId={user.id}
          userName={user.name}
          onBack={() => setView("dashboard")}
        />
      )}

      {view === "pairing" && (
        <PairingConfirmPage
          code={pairingCode}
          onNavigateHome={() => setView("home")}
          onNavigateDashboard={() => {
            if (user) {
              setView("dashboard");
            } else {
              setView("login");
              setRole("student");
            }
          }}
        />
      )}
    </div>
  );
}

export default App;
