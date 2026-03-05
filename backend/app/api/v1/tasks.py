from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.api.deps import get_current_user_id
from app.services.task_service import TaskService
from app.models.task import TaskPriority, TaskStatus
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse, TaskListResponse, TaskHistoryResponse

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("", response_model=TaskListResponse)
def get_tasks(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    priority: Optional[TaskPriority] = None,
    status: Optional[TaskStatus] = None,
    sort_by: str = Query("created_at", regex="^(created_at|due_date|priority|status|title)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Get paginated list of tasks with optional filters.
    Supports filtering by priority and status, sorting, and pagination.
    """
    service = TaskService(db)
    return service.get_tasks(
        user_id=user_id,
        page=page,
        per_page=per_page,
        priority=priority,
        status=status,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.post("", response_model=TaskResponse, status_code=201)
def create_task(
    task_data: TaskCreate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Create a new task. Automatically records creation in task history."""
    service = TaskService(db)
    return service.create_task(user_id, task_data)


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Get a single task by its ID."""
    service = TaskService(db)
    return service.get_task(task_id, user_id)


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Update a task. Records the update in task history with previous state.
    Automatically sets completed_at when status changes to Completed.
    """
    service = TaskService(db)
    return service.update_task(task_id, user_id, task_data)


@router.delete("/{task_id}", status_code=204)
def delete_task(
    task_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Delete a task. Records deletion in history before removing."""
    service = TaskService(db)
    service.delete_task(task_id, user_id)


@router.get("/{task_id}/history", response_model=list[TaskHistoryResponse])
def get_task_history(
    task_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Get the modification history of a specific task."""
    service = TaskService(db)
    history = service.get_task_history(task_id, user_id)
    return [TaskHistoryResponse.model_validate(h) for h in history]
