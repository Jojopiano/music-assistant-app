import { Music, GraduationCap, User } from "lucide-react";

interface RoleSelectionProps {
  onSelectRole: (role: "teacher" | "student") => void;
}

export function RoleSelection({ onSelectRole }: RoleSelectionProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Music className="w-8 h-8 text-purple" />
          <h1 className="text-3xl font-bold text-gray-900">音樂小幫手</h1>
          <Music className="w-8 h-8 text-purple" />
        </div>
        <p className="text-gray-500">請選擇您的身份開始使用</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-lg">
        <button
          onClick={() => onSelectRole("teacher")}
          className="card p-8 hover:shadow-lg hover:border-purple/30 transition-all duration-300 group"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-light flex items-center justify-center group-hover:scale-110 transition-transform">
              <GraduationCap className="w-8 h-8 text-purple" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">老師</h2>
              <p className="text-sm text-gray-500">管理學生、課表與出席</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => onSelectRole("student")}
          className="card p-8 hover:shadow-lg hover:border-teal/30 transition-all duration-300 group"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-light flex items-center justify-center group-hover:scale-110 transition-transform">
              <User className="w-8 h-8 text-teal" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">學生</h2>
              <p className="text-sm text-gray-500">查看課表、課程與進度</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
