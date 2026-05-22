import { Bell, AlertCircle, Users, BookOpen } from "lucide-react";
import { type Notification } from "../data";
import { Card } from "./Card";

interface NotificationsViewProps {
  notifications: Notification[];
  onMarkRead: (id: number) => void;
  role: "teacher" | "student";
}

export function NotificationsView({ notifications, onMarkRead, role }: NotificationsViewProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">通知中心</h2>

      <div className="space-y-3">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`card p-4 flex items-start gap-4 cursor-pointer transition-colors ${
              !notification.read ? (role === "teacher" ? "bg-purple-light/30" : "bg-teal-light/30") : ""
            }`}
            onClick={() => onMarkRead(notification.id)}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              notification.type === "warning" ? "bg-amber-light" :
              notification.type === "schedule" ? "bg-purple-light" :
              "bg-teal-light"
            }`}>
              {notification.type === "warning" ? <AlertCircle className="w-5 h-5 text-amber" /> :
               notification.type === "schedule" ? (role === "teacher" ? <Users className="w-5 h-5 text-purple" /> : <BookOpen className="w-5 h-5 text-purple" />) :
               <Bell className="w-5 h-5 text-teal" />}
            </div>
            <div className="flex-1">
              <p className={`text-sm ${!notification.read ? "font-medium" : ""}`}>
                {notification.text}
              </p>
              <span className="text-xs text-gray-400 mt-1">{notification.time}</span>
            </div>
            {!notification.read && (
              <div className={`w-2 h-2 ${role === "teacher" ? "bg-purple" : "bg-teal"} rounded-full flex-shrink-0 mt-2`} />
            )}
          </div>
        ))}

        {notifications.length === 0 && (
          <Card>
            <div className="p-12 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">暫無通知</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
