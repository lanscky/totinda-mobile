import { apiRequest } from "./client";

export type NotificationType = "application_decision" | "report_submitted" | "report_validated" | "evaluation_published" | "weekly_reminder";

export type AppNotification = {
  id: number;
  notification_type: NotificationType;
  title: string;
  message: string;
  data: { stage_id?: number; report_id?: number; evaluation_id?: number; week_start?: string; application_id?: number; offer_id?: number; status?: string };
  is_read: boolean;
  read_at: string | null;
  created_at: string;
};

type Paginated<T> = { results?: T[] };

export const notificationService = {
  list: async () => {
    const data = await apiRequest<AppNotification[] | Paginated<AppNotification>>("notifications/?limit=50");
    return Array.isArray(data) ? data : data.results ?? [];
  },
  unreadCount: () => apiRequest<{ count: number }>("notifications/unread-count/"),
  markRead: (id: number) => apiRequest<AppNotification>(`notifications/${id}/mark-read/`, { method: "POST" }),
  markAllRead: () => apiRequest<{ updated: number }>("notifications/mark-all-read/", { method: "POST" }),
};
