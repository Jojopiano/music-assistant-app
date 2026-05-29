import { Settings, ChevronLeft, User } from "lucide-react";
import { StudentProfile } from "./StudentProfile";

interface StudentSettingsProps {
  onBack: () => void;
  onNameUpdate?: (name: string) => void;
}

export function StudentSettings({ onBack, onNameUpdate }: StudentSettingsProps) {
  return (
    <div className="min-h-screen bg-gray-50">
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
              <div className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-purple-light text-purple-dark font-medium">
                <User className="w-5 h-5" />
                <span className="text-sm">個人資料</span>
              </div>
            </nav>
          </div>

          {/* Content */}
          <div className="md:col-span-3">
            <StudentProfile onNameUpdate={onNameUpdate} />
          </div>
        </div>
      </div>
    </div>
  );
}
