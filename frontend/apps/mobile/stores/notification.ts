import { create } from 'zustand';
import { storage } from '../services/storage';
const PUSH_TOKEN_KEY = 'push_notification_token';
const NOTIFICATIONS_ENABLED_KEY = 'notifications_enabled';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

export interface NotificationPreferences {
  applicationUpdates: boolean;
  permitAlerts: boolean;
  paymentReminders: boolean;
  systemAnnouncements: boolean;
}

export interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  pushToken: string | null;
  pushEnabled: boolean;
  preferences: NotificationPreferences;

  // Actions
  addNotification: (notification: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  setPushToken: (token: string | null) => void;
  setPushEnabled: (enabled: boolean) => void;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void;
  loadSettings: () => void;
}

const defaultPreferences: NotificationPreferences = {
  applicationUpdates: true,
  permitAlerts: true,
  paymentReminders: true,
  systemAnnouncements: true,
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  pushToken: null,
  pushEnabled: storage.getBoolean(NOTIFICATIONS_ENABLED_KEY) ?? true,
  preferences: defaultPreferences,

  addNotification: (notification) => {
    const newNotification: AppNotification = {
      ...notification,
      id: Date.now().toString(),
      read: false,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAsRead: (id: string) => {
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id);
      if (!notification || notification.read) return state;

      return {
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    });
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  removeNotification: (id: string) => {
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id);
      const unreadDelta = notification && !notification.read ? 1 : 0;

      return {
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: Math.max(0, state.unreadCount - unreadDelta),
      };
    });
  },

  clearAll: () => {
    set({ notifications: [], unreadCount: 0 });
  },

  setPushToken: (token: string | null) => {
    if (token) {
      storage.set(PUSH_TOKEN_KEY, token);
    } else {
      storage.delete(PUSH_TOKEN_KEY);
    }
    set({ pushToken: token });
  },

  setPushEnabled: (enabled: boolean) => {
    storage.set(NOTIFICATIONS_ENABLED_KEY, enabled);
    set({ pushEnabled: enabled });
  },

  updatePreferences: (preferences: Partial<NotificationPreferences>) => {
    set((state) => ({
      preferences: { ...state.preferences, ...preferences },
    }));
  },

  loadSettings: () => {
    const token = storage.getString(PUSH_TOKEN_KEY);
    const enabled = storage.getBoolean(NOTIFICATIONS_ENABLED_KEY) ?? true;
    set({ pushToken: token ?? null, pushEnabled: enabled });
  },
}));
