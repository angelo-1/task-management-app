import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { Task } from '../models/user.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private tasks: Task[] = [];
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  public tasks$ = this.tasksSubject.asObservable();

  constructor() {
    this.loadTasksFromLocalStorage();
  }

  getAllTasks(): Observable<Task[]> {
    return this.tasks$;
  }

  getTaskById(id: string): Observable<Task> {
    return from(Promise.resolve(this.tasks.find(task => task.id === id)!));
  }

  createTask(task: Partial<Task>): Observable<Task> {
    const newTask: Task = {
      id: uuidv4(),
      title: task.title!,
      description: task.description!,
      dueDate: task.dueDate!,
      status: 'todo',
      createdBy: task.createdBy!,
      assignedTo: task.assignedTo!,
      priority: task.priority || 'medium',
      createdAt: new Date()
    };
    this.tasks.push(newTask);
    this.saveTasksToLocalStorage();
    this.tasksSubject.next(this.tasks);
    return of(newTask);
  }

  updateTask(id: string, task: Partial<Task>): Observable<Task> {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      this.tasks[index] = {
        ...this.tasks[index],
        ...task
      };
      this.saveTasksToLocalStorage();
      this.tasksSubject.next(this.tasks);
      return from(Promise.resolve(this.tasks[index]));
    }
    return from(Promise.reject(new Error(`Task with ID ${id} not found.`)));
  }

  deleteTask(id: string): Observable<void> {
    this.tasks = this.tasks.filter(task => task.id !== id);
    this.saveTasksToLocalStorage();
    this.tasksSubject.next(this.tasks);
    return from(Promise.resolve());
  }

  private loadTasksFromLocalStorage(): void {
    const tasksData = localStorage.getItem('tasks');
    if (tasksData) {
      this.tasks = JSON.parse(tasksData);
      this.tasksSubject.next(this.tasks);
    }
  }

  private saveTasksToLocalStorage(): void {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }
}

