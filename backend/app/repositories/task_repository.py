from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Optional, List, Tuple
from datetime import datetime
from app.models.task import Task, TaskPriority, TaskStatus


class TaskRepository:
    """Data access layer for Task operations."""

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, task_id: int) -> Optional[Task]:
        return self.db.query(Task).filter(Task.id == task_id).first()

    def get_by_id_and_user(self, task_id: int, user_id: int) -> Optional[Task]:
        return self.db.query(Task).filter(
            Task.id == task_id, Task.user_id == user_id
        ).first()

    def get_tasks_paginated(
        self,
        user_id: int,
        page: int = 1,
        per_page: int = 10,
        priority: Optional[TaskPriority] = None,
        status: Optional[TaskStatus] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
    ) -> Tuple[List[Task], int]:
        query = self.db.query(Task).filter(Task.user_id == user_id)

        if priority:
            query = query.filter(Task.priority == priority)
        if status:
            query = query.filter(Task.status == status)

        total = query.count()

        # Sorting
        sort_column = getattr(Task, sort_by, Task.created_at)
        if sort_order == "asc":
            query = query.order_by(sort_column.asc())
        else:
            query = query.order_by(sort_column.desc())

        # Pagination
        offset = (page - 1) * per_page
        tasks = query.offset(offset).limit(per_page).all()

        return tasks, total

    def create(self, user_id: int, title: str, description: Optional[str],
               priority: TaskPriority, due_date: Optional[datetime]) -> Task:
        task = Task(
            user_id=user_id,
            title=title,
            description=description,
            priority=priority,
            due_date=due_date,
        )
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        return task

    def update(self, task: Task) -> Task:
        self.db.commit()
        self.db.refresh(task)
        return task

    def delete(self, task: Task) -> None:
        self.db.delete(task)
        self.db.commit()

    def get_all_by_user(self, user_id: int) -> List[Task]:
        return self.db.query(Task).filter(Task.user_id == user_id).all()

    def count_by_status(self, user_id: int, status: TaskStatus) -> int:
        return self.db.query(Task).filter(
            Task.user_id == user_id, Task.status == status
        ).count()

    def count_total(self, user_id: int) -> int:
        return self.db.query(Task).filter(Task.user_id == user_id).count()

    def get_completed_tasks(self, user_id: int) -> List[Task]:
        return self.db.query(Task).filter(
            Task.user_id == user_id, Task.status == TaskStatus.Completed
        ).all()

    def get_priority_distribution(self, user_id: int) -> List[Tuple[str, int]]:
        return (
            self.db.query(Task.priority, func.count(Task.id))
            .filter(Task.user_id == user_id)
            .group_by(Task.priority)
            .all()
        )
