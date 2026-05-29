import { useState } from "react";
import { Settings, ChevronLeft, User, KeyRound, Users } from "lucide-react";
import { TeacherProfile } from "./TeacherProfile";
import { InviteCodeGenerator } from "./InviteCodeGenerator";
import { StudentList } from "./StudentList";

type SettingsTab = "profile" | "invite" | "students";

interface TeacherSettingsProps {
  userId?: number;
  userName?: string;
  onBack: () => void;
  onNameUpdate?: (name: string) => void;
}

export function TeacherSettings({ userId, userName, onBack, onNameUpdate }: TeacherSettingsProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  const tabs = [
    { id: "profile" as SettingsTab, label: "個人資料", icon: User },
    { id: "invite" as SettingsTab, label: "邀請代碼", icon: KeyRound },
    { id: "students" as SettingsTab, label: "我的學生", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            aria-label="返回"
            className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple" />
            <h1 className="font-semibold text-gray-900">設定</h1>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <nav className="space-y-1">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === id
                      ? "bg-purple-light text-purple-dark font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="md:col-span-3 space-y-6">
            {activeTab === "profile" && <TeacherProfile userId={userId} onNameUpdate={onNameUpdate} />}
            {activeTab === "invite" && <InviteCodeGenerator teacherName={userName} />}
            {activeTab === "students" && <StudentList teacherId={userId} />}
          </div>
        </div>
      </div>
    </div>
  );
}
