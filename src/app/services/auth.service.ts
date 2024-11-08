// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private readonly USERS_KEY = 'users';
  private readonly CURRENT_USER_KEY = 'currentUser';

  constructor() {
    this.loadUserFromLocalStorage();
  }

  // Login user and save to localStorage
  login(email: string, password: string): Observable<User> {
    const storedUsers = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
    const user = storedUsers.find((u: User) => u.email === email && u.password === password);

    if (user) {
      this.setCurrentUser(user);
      return of(user);
    } else {
      return throwError(() => new Error('Invalid email or password.'));
    }
  }

  // Set the current user and save to localStorage
  private setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
  }

  // Load the current user from localStorage on app start
  private loadUserFromLocalStorage(): void {
    const storedUser = localStorage.getItem(this.CURRENT_USER_KEY);
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  // Logout user and clear from localStorage
  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }

  // Register a new user and save to localStorage
  register(username: string, email: string, password: string): Observable<User> {
    const users = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');

    // Check if a user with this email already exists
    if (users.some((user: User) => user.email === email)) {
      return throwError(() => new Error('User with this email already exists.'));
    }

    // Create a new user
    const newUser: User = { id: Date.now().toString(), username, email, password };
    users.push(newUser);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

    return of(newUser); // Return the newly created user
  }

  // Get the current user value directly (optional)
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
