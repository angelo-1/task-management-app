import { Component, OnInit } from '@angular/core';
import { Notification } from '../../models/user.model';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {
  notifications: Notification[] = [];
  unreadCount: number = 0;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadNotifications();
    this.getUnreadCount();
  }

  // Load notifications dynamically
  loadNotifications(): void {
    this.notificationService.notifications$.subscribe({
      next: (notifications) => {
        this.notifications = notifications;
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
      }
    });
  }

  // Mark a notification as read
  markAsRead(id: string): void {
    this.notificationService.markAsRead(id).subscribe({
      next: () => {
        // Update UI immediately without reloading
        const notification = this.notifications.find(n => n.id === id);
        if (notification) notification.read = true;
        this.getUnreadCount();
      },
      error: (error) => {
        console.error('Error marking notification as read:', error);
      }
    });
  }

  // Get the count of unread notifications
  getUnreadCount(): void {
    this.notificationService.getUnreadNotificationCount().subscribe({
      next: (count) => {
        this.unreadCount = count;
      },
      error: (error) => {
        console.error('Error fetching unread count:', error);
      }
    });
  }
}
