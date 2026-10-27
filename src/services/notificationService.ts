import { localStore } from '../storage/localStore';
import { audioService } from './audioService';

export const notificationService = {
  /**
   * Check if Notifications API is supported
   */
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  },

  /**
   * Get current permission state
   */
  getPermission(): NotificationPermission | 'unsupported' {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission;
  },

  /**
   * Request user permission for notifications
   */
  async requestPermission(): Promise<NotificationPermission | 'unsupported'> {
    if (!this.isSupported()) return 'unsupported';
    try {
      const res = await Notification.requestPermission();
      const settings = localStore.getNotificationSettings();
      settings.notificationPermission = res;
      localStore.saveNotificationSettings(settings);
      return res;
    } catch (e) {
      console.warn('Error requesting notification permission:', e);
      return 'denied';
    }
  },

  /**
   * Trigger test notification with sound and system banner
   */
  async testNotification(): Promise<boolean> {
    const settings = localStore.getNotificationSettings();

    // 1. Play sound
    audioService.playNotificationSound(settings.sound);

    // 2. Trigger Web Notification if allowed
    if (this.isSupported() && Notification.permission === 'granted') {
      try {
        const notif = new Notification("Jay'z Quran — Waktu Salat Tiba", {
          body: `Waktu salat Magrib telah masuk untuk wilayah Anda. Mari tunaikan salat tepat waktu.`,
          icon: '/pwa-192x192.png',
          badge: '/icon.svg',
          tag: 'jayz-prayer-test',
        });
        notif.onclick = () => {
          window.focus();
        };
        return true;
      } catch (err) {
        console.warn('Notification construct failed, trying ServiceWorker registration:', err);
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.getRegistration();
          if (reg) {
            await reg.showNotification("Jay'z Quran — Waktu Salat Tiba", {
              body: `Waktu salat Magrib telah masuk untuk wilayah Anda.`,
              icon: '/pwa-192x192.png',
              badge: '/icon.svg',
            });
            return true;
          }
        }
      }
    }

    return false;
  },
};
