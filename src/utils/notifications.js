// Push notification utilities
export function isNotificationSupported() {
  return 'Notification' in window;
}

export async function requestNotificationPermission() {
  if (!isNotificationSupported()) return false;
  
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export function sendBrowserNotification(title, body, options = {}) {
  if (!isNotificationSupported()) return;
  if (Notification.permission !== 'granted') return;

  const notification = new Notification(title, {
    body,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: options.tag || 'smartcampus',
    ...options,
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
    if (options.onClick) options.onClick();
  };

  // Auto close after 6s
  setTimeout(() => notification.close(), 6000);
  return notification;
}
