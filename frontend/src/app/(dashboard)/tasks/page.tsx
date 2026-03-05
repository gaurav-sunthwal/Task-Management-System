"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Plus,
    Search,
    Filter,
    Pencil,
    Calendar as CalendarIcon,
    CheckCircle2,
    Clock,
    Archive,
    Trash2,
    History,
    ArrowUpDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import api from "@/lib/api";
import { Task, TaskListResponse, TaskPriority, TaskStatus } from "@/types";
import { toast } from "sonner";
import { format } from "date-fns";
import { TaskModal } from "@/components/tasks/task-modal";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    // Filters
    const [priorityFilter, setPriorityFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [sortBy, setSortBy] = useState("created_at");
    const [sortOrder, setSortOrder] = useState("desc");

    const fetchTasks = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                per_page: "10",
                sort_by: sortBy,
                sort_order: sortOrder,
            });

            if (priorityFilter !== "all") params.append("priority", priorityFilter);
            if (statusFilter !== "all") params.append("status", statusFilter);

            const response = await api.get<TaskListResponse>(`/tasks?${params.toString()}`);
            setTasks(response.data.tasks);
            setTotal(response.data.total);
        } catch (error) {
            toast.error("Failed to load tasks");
        } finally {
            setIsLoading(false);
        }
    }, [page, priorityFilter, statusFilter, sortBy, sortOrder]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleCreateTask = async (data: any) => {
        try {
            await api.post("/tasks", data);
            toast.success("Task created successfully");
            fetchTasks();
        } catch (error) {
            toast.error("Failed to create task");
            throw error;
        }
    };

    const handleUpdateTask = async (data: any) => {
        if (!selectedTask) return;
        try {
            await api.put(`/tasks/${selectedTask.id}`, data);
            toast.success("Task updated successfully");
            fetchTasks();
        } catch (error) {
            toast.error("Failed to update task");
            throw error;
        }
    };

    const handleDeleteTask = async (id: number) => {
        if (!confirm("Are you sure you want to delete this task?")) return;
        try {
            await api.delete(`/tasks/${id}`);
            toast.success("Task deleted");
            fetchTasks();
        } catch (error) {
            toast.error("Failed to delete task");
        }
    };

    const handleToggleComplete = async (task: Task) => {
        try {
            const newStatus = task.status === "Completed" ? "Pending" : "Completed";
            await api.put(`/tasks/${task.id}`, { status: newStatus });
            toast.success(`Task marked as ${newStatus.toLowerCase()}`);
            fetchTasks();
        } catch (error) {
            toast.error("Update failed");
        }
    };

    const getPriorityBadge = (priority: TaskPriority) => {
        switch (priority) {
            case "High": return <Badge variant="destructive" className="bg-red-500/15 text-red-400 hover:bg-red-500/20 border-red-500/30">High</Badge>;
            case "Medium": return <Badge variant="secondary" className="bg-amber-500/15 text-amber-400 hover:bg-amber-500/20 border-amber-500/30">Medium</Badge>;
            case "Low": return <Badge variant="outline" className="bg-blue-500/15 text-blue-400 hover:bg-blue-500/20 border-blue-500/30">Low</Badge>;
        }
    };

    const getStatusIcon = (status: TaskStatus) => {
        switch (status) {
            case "Completed": return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
            case "Pending": return <Clock className="h-5 w-5 text-amber-500" />;
            case "Archived": return <Archive className="h-5 w-5 text-slate-400" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Task Management</h2>
                    <p className="text-muted-foreground">
                        Manage your professional tasks and track progress.
                    </p>
                </div>
                <Button onClick={() => { setSelectedTask(null); setIsModalOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Add Task
                </Button>
            </div>

            <Card className="shadow-sm border-border overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/50 flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[200px] relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search tasks..." className="pl-9 bg-background" />
                    </div>

                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-slate-500" />
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[140px] bg-background text-xs">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                                <SelectItem value="Archived">Archived</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                            <SelectTrigger className="w-[140px] bg-background text-xs">
                                <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Priority</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="Low">Low</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9"
                            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                        >
                            <ArrowUpDown className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <CardContent className="p-0">
                    <div className="divide-y divide-border">
                        {isLoading ? (
                            Array(5).fill(0).map((_, i) => (
                                <div key={i} className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Skeleton className="h-6 w-6 rounded-full" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-5 w-[200px]" />
                                            <Skeleton className="h-3 w-[100px]" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-8 w-[100px]" />
                                </div>
                            ))
                        ) : tasks.length === 0 ? (
                            <div className="p-12 text-center text-muted-foreground bg-background">
                                <p>No tasks found matching your filters.</p>
                                <Button variant="link" onClick={() => { setPriorityFilter("all"); setStatusFilter("all"); }}>Clear filters</Button>
                            </div>
                        ) : (
                            tasks.map((task) => (
                                <div key={task.id} className="p-4 flex items-start justify-between hover:bg-muted/50 transition-colors group">
                                    <div className="flex items-start gap-4 flex-1 min-w-0">
                                        <button
                                            onClick={() => handleToggleComplete(task)}
                                            className="mt-1 transition-transform active:scale-90"
                                        >
                                            {getStatusIcon(task.status)}
                                        </button>
                                        <div className="min-w-0 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <p className={cn(
                                                    "font-semibold truncate",
                                                    task.status === "Completed" && "text-slate-400 line-through"
                                                )}>
                                                    {task.title}
                                                </p>
                                                {getPriorityBadge(task.priority)}
                                            </div>
                                            {task.description && (
                                                <p className="text-sm text-muted-foreground truncate max-w-md">
                                                    {task.description}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                {task.due_date && (
                                                    <div className="flex items-center gap-1">
                                                        <CalendarIcon className="h-3 w-3" />
                                                        {format(new Date(task.due_date), "MMM d, yyyy")}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    Created {format(new Date(task.created_at), "MMM d")}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 ml-4">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-blue-400 hover:bg-blue-500/10" onClick={() => { setSelectedTask(task); setIsModalOpen(true); }}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Edit task</TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" className={cn("h-8 w-8", task.status === "Completed" ? "text-amber-400 hover:text-amber-300 hover:bg-amber-500/10" : "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10")} onClick={() => handleToggleComplete(task)}>
                                                    {task.status === "Completed" ? <Clock className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>{task.status === "Completed" ? "Mark as Pending" : "Mark as Completed"}</TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-500/10" onClick={() => handleDeleteTask(task.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Delete task</TooltipContent>
                                        </Tooltip>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>

                {total > 10 && (
                    <div className="p-4 border-t border-border bg-muted/30 flex items-center justify-between font-medium text-xs">
                        <p className="text-muted-foreground">Showing {tasks.length} of {total} tasks</p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page * 10 >= total}
                                onClick={() => setPage(p => p + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={selectedTask ? handleUpdateTask : handleCreateTask}
                task={selectedTask}
            />
        </div>
    );
}
