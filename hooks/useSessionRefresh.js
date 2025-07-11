import { useSession } from "next-auth/react";
import { useEffect, useCallback } from "react";

export function useSessionRefresh() {
  const { data: session, update } = useSession();

  const refreshSession = useCallback(async () => {
    await update();
  }, [update]);

  useEffect(() => {
    // Sayfa odağa geldiğinde session'ı refresh et
    const handleFocus = () => {
      refreshSession();
    };

    // Visibility change olayını dinle (sekme değiştirme)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshSession();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshSession]);

  return { session, refreshSession };
}
