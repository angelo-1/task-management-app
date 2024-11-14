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
  currentUser$: Observable<User | null>;
  unreadNotificationCount: number = 0;
  currentUser: User;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    this.currentUser$.subscribe((user) => {
      if (user) {
        this.currentUser = user;
      }
    });
    this.unreadNotificationCount = 3;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.currentUser = null
  }
}
