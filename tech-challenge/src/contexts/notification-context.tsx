import { createContext, useContext, useState, type ReactNode } from 'react';

export type AppNotification = { id: string; title: string; message: string };

type NotificationContextValue = {
  notifications: AppNotification[];
  push: (notification: Omit<AppNotification, 'id'>) => void;
  dismiss: (id: string) => void;
};

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

/**
 * Placeholder: sem backend de push configurado ainda. Hoje só gerencia uma fila local de
 * notificações in-app; quando houver push real (Expo Notifications + Cloud Functions), a
 * inscrição do token entra aqui, mantendo o resto do app desacoplado dessa implementação.
 */
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const push: NotificationContextValue['push'] = (notification) => {
    setNotifications((current) => [...current, { ...notification, id: Date.now().toString() }]);
  };

  const dismiss = (id: string) => {
    setNotifications((current) => current.filter((notification) => notification.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, push, dismiss }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext(): NotificationContextValue {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotificationContext deve ser usado dentro de <NotificationProvider>.');
  return context;
}
