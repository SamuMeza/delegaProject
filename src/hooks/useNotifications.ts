import { useState, useEffect, useCallback, useRef } from "react";

interface NotificationState {
  permission: NotificationPermission;
  lastNotification: { title: string; body: string } | null;
  tabIndicator: number;
}

export function useNotifications() {
  const [state, setState] = useState<NotificationState>({
    permission: typeof Notification !== "undefined" ? Notification.permission : "default",
    lastNotification: null,
    tabIndicator: 0,
  });

  const originalTitle = useRef(document.title);

  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission().then((perm) => {
        setState((prev) => ({ ...prev, permission: perm }));
      });
    }
  }, []);

  useEffect(() => {
    if (state.tabIndicator > 0) {
      document.title = `(${state.tabIndicator}) ${originalTitle.current}`;
    } else {
      document.title = originalTitle.current;
    }
    return () => {
      document.title = originalTitle.current;
    };
  }, [state.tabIndicator]);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === "undefined") return "denied";
    const perm = await Notification.requestPermission();
    setState((prev) => ({ ...prev, permission: perm }));
    return perm;
  }, []);

  const notify = useCallback((title: string, body: string) => {
    setState((prev) => ({
      ...prev,
      lastNotification: { title, body },
      tabIndicator: prev.tabIndicator + 1,
    }));

    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      new Notification(title, { body, icon: "/favicon.ico" });
    }

    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        lastNotification: null,
        tabIndicator: Math.max(0, prev.tabIndicator - 1),
      }));
    }, 5000);
  }, []);

  const clearTabIndicator = useCallback(() => {
    setState((prev) => ({ ...prev, tabIndicator: 0 }));
  }, []);

  return {
    permission: state.permission,
    lastNotification: state.lastNotification,
    tabIndicator: state.tabIndicator,
    requestPermission,
    notify,
    clearTabIndicator,
  };
}
