import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { Task, User } from '../../models/user.model';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  users: User[] = [];
  currentUserId: string | null = null;
  showCreateForm = false;
  taskForm: FormGroup;
  selectedTask: Task | null = null;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private userService: UserService
  ) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      dueDate: ['', Validators.required],
      priority: ['medium', Validators.required],
      assignedTo: ['', Validators.required],
      status: ['todo']
    });
  }

  ngOnInit(): void {
    this.userService.getUsers().subscribe(users => {
      this.users = users;
    });
    combineLatest([
      this.taskService.getAllTasks(),
      this.authService.currentUser$
    ]).subscribe(([tasks, user]) => {
      this.tasks = tasks;
      this.currentUserId = user?.id || null;
    });
  }

  get createdTasks(): Task[] {
    return this.tasks.filter(task => task.createdBy === this.currentUserId);
  }

  get assignedTasks(): Task[] {
    return this.tasks.filter(task => task.assignedTo === this.currentUserId);
  }

  isCreatingTask(): boolean {
    return !this.selectedTask;
  }

  isAssignedUser(): boolean {
    return !!this.selectedTask && this.selectedTask.assignedTo === this.currentUserId;
  }

  canEditOtherFields(): boolean {
    return !!this.selectedTask && this.selectedTask.createdBy === this.currentUserId;
  }

  openCreateForm(): void {
    this.showCreateForm = true;
    this.selectedTask = null;
    this.taskForm.reset({
      status: 'todo',
      priority: 'medium'
    });
  }

  openEditForm(task: Task): void {
    this.showCreateForm = true;
    this.selectedTask = task;
    this.taskForm.patchValue({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      priority: task.priority,
      assignedTo: task.assignedTo,
      status: task.status
    });
  }

  submitTask(): void {
    if (this.taskForm.valid) {
      const taskData = {
        ...this.taskForm.value,
        createdBy: this.currentUserId
      };
      this.taskForm.disable();
      if (this.selectedTask) {
        taskData.createdBy = this.selectedTask.createdBy;
        this.taskService.updateTask(this.selectedTask.id, taskData).subscribe({
          next: (updatedTask) => {
            const index = this.tasks.findIndex(t => t.id === updatedTask.id);
            if (index !== -1) {
              this.tasks[index] = updatedTask;
            }
            this.closeForm();
          },
          error: (error) => {
            console.error('Error updating task:', error);
            this.taskForm.enable();
          },
          complete: () => {
            this.taskForm.enable();
          }
        });
      } else {
        this.taskService.createTask(taskData).subscribe({
          next: (newTask) => {
            // this.tasks.push(newTask);
            this.closeForm();
          },
          error: (error) => {
            console.error('Error creating task:', error);
            this.taskForm.enable();
          },
          complete: () => {
            this.taskForm.enable();
          }
        });
      }
    }
  }
  closeForm(): void {
    this.showCreateForm = false;
    this.selectedTask = null;
    this.taskForm.reset();
  }

  deleteTask(taskId: string): void {
    this.taskService.deleteTask(taskId).subscribe(() => {
      this.tasks = this.tasks.filter(task => task.id !== taskId);
    });
  }
}
