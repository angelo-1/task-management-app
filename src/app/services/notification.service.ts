// src/app/services/notification.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Notification } from '../models/user.model';
import { AuthService } from './auth.service';
import { v4 as uuidv4 } from 'uuid';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications: Notification[] = [];
  private currentUserId: string | null = null;

  constructor(private authService: AuthService) {
    // Subscribe to changes in the current user and load their notifications
    this.authService.currentUser$.subscribe((user) => {
      this.currentUserId = user?.id || null;
      this.loadNotificationsForCurrentUser();
    });
  }

  // Fetch notifications for the currently logged-in user
  getNotifications(): Observable<Notification[]> {
    return of(this.notifications.filter(n => n.userId === this.currentUserId));
  }

  // Create a new notification and store it for the current user
  createNotification(notification: Partial<Notification>): Observable<Notification> {
    const newNotification: Notification = {
      id: uuidv4(),
      message: notification.message || '',
      type: notification.type || 'task-assigned',
      taskId: notification.taskId || '',
      userId: this.currentUserId || '',
      read: false,
      createdAt: new Date()
    };
    this.notifications.push(newNotification);
    this.saveNotificationsToStorage();
    return of(newNotification);
  }

  // Mark a specific notification as read
  markAsRead(id: string): Observable<void> {
    const index = this.notifications.findIndex(n => n.id === id && n.userId === this.currentUserId);
    if (index !== -1) {
      this.notifications[index].read = true;
      this.saveNotificationsToStorage();
    }
    return of(void 0);
  }

  // Get count of unread notifications for current user
  getUnreadNotificationCount(): Observable<number> {
    return of(this.notifications.filter(n => n.userId === this.currentUserId && !n.read).length);
  }

  // Load notifications from localStorage and filter by the current user
  private loadNotificationsForCurrentUser(): void {
    const storedNotifications = localStorage.getItem('notifications');
    if (storedNotifications) {
      const allNotifications: Notification[] = JSON.parse(storedNotifications);
      this.notifications = allNotifications.filter(n => n.userId === this.currentUserId);
    } else {
      this.notifications = [];
    }
  }

  // Save all notifications to localStorage
  private saveNotificationsToStorage(): void {
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
  }
}
