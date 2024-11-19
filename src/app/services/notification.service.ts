import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Notification } from '../models/user.model';
import { AuthService } from './auth.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications: Notification[] = [];
  private currentUserId: string | null = null;
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);

  // Expose notifications as an observable for real-time updates
  notifications$ = this.notificationsSubject.asObservable();

  constructor(private authService: AuthService) {
    // Subscribe to the logged-in user and load notifications for them
    this.authService.currentUser$.subscribe((user) => {
      this.currentUserId = user?.id || null;
      this.loadNotificationsForCurrentUser();
    });
  }

  // Fetch notifications for the current user
  getNotifications(): Observable<Notification[]> {
    const now = new Date();
    const filteredNotifications = this.notifications.filter(
      n =>
        n.userId === this.currentUserId &&
        (!n.expiryDate || new Date(n.expiryDate) > now)
    );
    return of(filteredNotifications);
  }

  // Add a new notification
  createNotification(notification: Partial<Notification>): Observable<Notification> {
    let expiryDate: Date | null = null;
    switch (notification.type) {
      case 'task-assigned':
        expiryDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000); // 1 day
        break;
      case 'task-updated':
        expiryDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000); // 1 day
        break;
      case 'task-completed':
        expiryDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000); // 1 day
        break;
      default:
        expiryDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000); // 1 day
    }
    const newNotification: Notification = {
      id: uuidv4(),
      message: notification.message || '',
      type: notification.type || 'info',
      taskId: notification.taskId || '',
      userId: notification.userId|| '',
      read: false,
      createdAt: new Date(),
      expiryDate: expiryDate || null
    };
    this.notifications.push(newNotification);
    this.saveNotificationsToStorage();
    this.notificationsSubject.next(this.notifications);
    return of(newNotification);
  }

  // Mark a notification as read
  markAsRead(id: string): Observable<void> {
    const notification = this.notifications.find(
      n => n.id === id && n.userId === this.currentUserId
    );
    if (notification) {
      notification.read = true;
      this.saveNotificationsToStorage();
      this.notificationsSubject.next(this.notifications);
    }
    return of(void 0);
  }

  // Count unread notifications for the current user
  getUnreadNotificationCount(): Observable<number> {
    const unreadCount = this.notifications.filter(
      n => n.userId === this.currentUserId && !n.read
    ).length;
    return of(unreadCount);
  }

  // Load notifications from localStorage for the current user
  private loadNotificationsForCurrentUser(): void {
    const storedNotifications = localStorage.getItem('notifications');
    if (storedNotifications) {
      const allNotifications: Notification[] = JSON.parse(storedNotifications);
      this.notifications = allNotifications.filter(n => n.userId === this.currentUserId);
    } else {
      this.notifications = [];
    }
    this.notificationsSubject.next(this.notifications);
  }

  // Save notifications to localStorage
  private saveNotificationsToStorage(): void {
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
  }
}
