// services/user.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly USERS_KEY = 'users';

  constructor() {
    // Initialize users array if it doesn't exist
    if (!localStorage.getItem(this.USERS_KEY)) {
      localStorage.setItem(this.USERS_KEY, JSON.stringify([]));
    }
  }

  getUsers(): Observable<User[]> {
    const users = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
    return of(users);
  }

  getUserById(id: string): Observable<User | undefined> {
    const users = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
    const user = users.find((u: User) => u.id === id);
    return of(user);
  }

  // Helper method to get users synchronously if needed
  getUsersSync(): User[] {
    return JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
  }
}