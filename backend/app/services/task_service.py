import math
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from app.repositories.task_repository import TaskRepository
from app.repositories.task_history_repository import TaskHistoryRepository
from app.models.task import TaskPriority, TaskStatus
from app.models.task_history import ActionType
from app.core.exceptions import NotFoundException, ForbiddenException
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse, TaskListResponse


class TaskService:
    """Business logic for task operations."""

    def __init__(self, db: Session):
        self.task_repo = TaskRepository(db)
        self.history_repo = TaskHistoryRepository(db)

    def _task_to_dict(self, task) -> dict:
        """Serialize task to dict for history storage."""
        return {
            "title": task.title,
            "description": task.description,
            "priority": task.priority.value if task.priority else None,
            "status": task.status.value if task.status else None,
            "due_date": task.due_date.isoformat() if task.due_date else None,
        }

    def create_task(self, user_id: int, task_data: TaskCreate) -> TaskResponse:
        """Create a new task and record history."""
        task = self.task_repo.create(
            user_id=user_id,
            title=task_data.title,
            description=task_data.description,
            priority=task_data.priority,
            due_date=task_data.due_date,
        )
        # Record creation in history
        self.history_repo.create(
            task_id=task.id,
            action_type=ActionType.created,
            previous_state=None,
        )
        return TaskResponse.model_validate(task)

    def get_tasks(
        self,
        user_id: int,
        page: int = 1,
        per_page: int = 10,
        priority: Optional[TaskPriority] = None,
        status: Optional[TaskStatus] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
    ) -> TaskListResponse:
        """Get paginated task list with filters."""
        tasks, total = self.task_repo.get_tasks_paginated(
            user_id=user_id,
            page=page,
            per_page=per_page,
            priority=priority,
            status=status,
            sort_by=sort_by,
            sort_order=sort_order,
        )
        total_pages = math.ceil(total / per_page) if per_page > 0 else 0
        return TaskListResponse(
            tasks=[TaskResponse.model_validate(t) for t in tasks],
            total=total,
            page=page,
            per_page=per_page,
            total_pages=total_pages,
        )

    def get_task(self, task_id: int, user_id: int) -> TaskResponse:
        """Get a single task by ID."""
        task = self.task_repo.get_by_id_and_user(task_id, user_id)
        if not task:
            raise NotFoundException(detail="Task not found")
        return TaskResponse.model_validate(task)

    def update_task(self, task_id: int, user_id: int, task_data: TaskUpdate) -> TaskResponse:
        """Update a task and record history."""
        task = self.task_repo.get_by_id_and_user(task_id, user_id)
        if not task:
            raise NotFoundException(detail="Task not found")

        # Save previous state
        previous_state = self._task_to_dict(task)

        # Update fields
        update_data = task_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(task, field, value)

        # If status changed to Completed, set completed_at
        if task_data.status == TaskStatus.Completed and task.completed_at is None:
            task.completed_at = datetime.utcnow()

        # Determine action type
        action_type = ActionType.updated
        if task_data.status == TaskStatus.Completed:
            action_type = ActionType.completed
        elif task_data.status == TaskStatus.Archived:
            action_type = ActionType.archived

        updated_task = self.task_repo.update(task)

        # Record in history
        self.history_repo.create(
            task_id=task.id,
            action_type=action_type,
            previous_state=previous_state,
        )

        return TaskResponse.model_validate(updated_task)

    def delete_task(self, task_id: int, user_id: int) -> None:
        """Delete a task and record history."""
        task = self.task_repo.get_by_id_and_user(task_id, user_id)
        if not task:
            raise NotFoundException(detail="Task not found")

        # Record deletion in history before deleting
        previous_state = self._task_to_dict(task)
        self.history_repo.create(
            task_id=task.id,
            action_type=ActionType.deleted,
            previous_state=previous_state,
        )

        self.task_repo.delete(task)

    def get_task_history(self, task_id: int, user_id: int):
        """Get history for a specific task."""
        task = self.task_repo.get_by_id_and_user(task_id, user_id)
        if not task:
            raise NotFoundException(detail="Task not found")
        return self.history_repo.get_by_task_id(task_id)
