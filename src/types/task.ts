export type TaskStatus = "Pending" | "In Progress" | "Completed";

export interface Employee {
  id: number;
  full_name: string;
  email: string;
  role: string;
  department: string;
}

export interface Task {
  id: number;

  task_name: string;
  project: string;
  category: string;
  description: string;

  task_date: string;

  start_time: string;
  end_time: string;
  duration: string;

  status: TaskStatus;

  assigned_to: number;
  created_by: number;

  assigned_employee?: string;

  created_at: string;
}