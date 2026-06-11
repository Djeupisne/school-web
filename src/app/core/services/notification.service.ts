import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notifications: Notification[] = [];
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();
  private counter = 0;

  success(message: string, duration = 4000) { this.add('success', message, duration); }
  error(message: string, duration = 6000) { this.add('error', message, duration); }
  warning(message: string, duration = 5000) { this.add('warning', message, duration); }
  info(message: string, duration = 4000) { this.add('info', message, duration); }

  private add(type: Notification['type'], message: string, duration: number) {
    const id = ++this.counter;
    const notification: Notification = { id, type, message, duration };
    this.notifications.push(notification);
    this.notificationsSubject.next([...this.notifications]);

    setTimeout(() => this.remove(id), duration);
  }

  remove(id: number) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notificationsSubject.next([...this.notifications]);
  }
}