import { Component, OnInit } from '@angular/core';
import { Notification } from '../../models/user.model';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})

export class NotificationComponent implements OnInit {
  notifications: Notification[] = [];

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe({
      next: (notifications) => {
        this.notifications = notifications;
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
      }
    });
  }


  markAsRead(id: string): void {
    this.notificationService.markAsRead(id).subscribe({
      next: () => {
        this.notifications.find(n => n.id === id)!.read = true;
      },
      error: (error) => {
        console.error('Error marking notification as read:', error);
      }
    });
  }
}