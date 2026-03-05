from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.models.task import TaskPriority, TaskStatus


# --- Request Schemas ---

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: TaskPriority = TaskPriority.Medium
    due_date: Optional[datetime] = None

    class Config:
        use_enum_values = True


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[TaskPriority] = None
    status: Optional[TaskStatus] = None
    due_date: Optional[datetime] = None

    class Config:
        use_enum_values = True


# --- Response Schemas ---

class TaskResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str]
    priority: TaskPriority
    status: TaskStatus
    due_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True


class TaskHistoryResponse(BaseModel):
    id: int
    task_id: int
    action_type: str
    previous_state: Optional[dict]
    timestamp: datetime

    class Config:
        from_attributes = True


class TaskListResponse(BaseModel):
    tasks: List[TaskResponse]
    total: int
    page: int
    per_page: int
    total_pages: int
