export interface User {
    id: string;
    username: string;
    email: string;
    password: string;
  }
  
  export interface Task {
    id: string;
    title: string;
    description: string;
    dueDate: Date;
    status: 'todo' | 'in-progress' | 'completed';
    createdBy: string;
    assignedTo: string;
    priority: 'low' | 'medium' | 'high';
    createdAt: Date;
  }
  
  export interface Notification {
    id: string;
    message: string;
    type: "task-assigned" | "task-updated" | "task-completed" | "info";
    taskId: string;
    userId: string;
    read: boolean;
    createdAt: Date;
    expiryDate?: Date | null;
  }