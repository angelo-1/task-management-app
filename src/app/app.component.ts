import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { User } from './models/user.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  currentUser$: Observable<User | null>; // Observable for the current user
  unreadNotificationCount: number = 0;
  currentUser: User;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Initialize the currentUser$ observable
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    // You can also set up a subscription if needed
    this.currentUser$.subscribe((user) => {
      if (user) {
        this.currentUser = user;
      }
    });

    // Mock notification count or replace it with actual notification service logic
    this.unreadNotificationCount = 3; // Example: 3 unread notifications
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
