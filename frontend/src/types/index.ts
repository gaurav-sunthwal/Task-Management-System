// ============================================
// Type Definitions for the Task Management System
// ============================================

// --- User & Auth ---
export interface User {
    id: number;
    name: string;
    email: string;
    created_at: string;
}

export interface TokenResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    user: User;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    name: string;
    email: string;
    password: string;
}

// --- Task ---
export type TaskPriority = "Low" | "Medium" | "High";
export type TaskStatus = "Pending" | "Completed" | "Archived";

export interface Task {
    id: number;
    user_id: number;
    title: string;
    description: string | null;
    priority: TaskPriority;
    status: TaskStatus;
    due_date: string | null;
    created_at: string;
    updated_at: string;
    completed_at: string | null;
}

export interface TaskCreate {
    title: string;
    description?: string;
    priority?: TaskPriority;
    due_date?: string;
}

export interface TaskUpdate {
    title?: string;
    description?: string;
    priority?: TaskPriority;
    status?: TaskStatus;
    due_date?: string;
}

export interface TaskListResponse {
    tasks: Task[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
}

export interface TaskHistory {
    id: number;
    task_id: number;
    action_type: string;
    previous_state: Record<string, unknown> | null;
    timestamp: string;
}

// --- Feedback ---
export interface Feedback {
    id: number;
    user_id: number;
    task_id: number | null;
    comment: string;
    rating: number;
    created_at: string;
}

export interface FeedbackCreate {
    task_id?: number;
    comment: string;
    rating: number;
}

// --- Analytics ---
export interface PriorityDistribution {
    priority: string;
    count: number;
}

export interface DailyCompletion {
    date: string;
    count: number;
}

export interface Analytics {
    total_tasks: number;
    completed_tasks: number;
    pending_tasks: number;
    archived_tasks: number;
    completion_percentage: number;
    tasks_completed_today: number;
    tasks_completed_this_week: number;
    tasks_completed_this_month: number;
    most_productive_day: string | null;
    average_completion_time_hours: number | null;
    priority_distribution: PriorityDistribution[];
    daily_completions: DailyCompletion[];
    productivity_score: number;
    productivity_score_explanation: string;
}
