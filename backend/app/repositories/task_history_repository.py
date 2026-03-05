from sqlalchemy.orm import Session
from typing import Optional, List
from app.models.task_history import TaskHistory, ActionType


class TaskHistoryRepository:
    """Data access layer for TaskHistory operations."""

    def __init__(self, db: Session):
        self.db = db

    def create(self, task_id: int, action_type: ActionType,
               previous_state: Optional[dict] = None) -> TaskHistory:
        history = TaskHistory(
            task_id=task_id,
            action_type=action_type,
            previous_state=previous_state,
        )
        self.db.add(history)
        self.db.commit()
        self.db.refresh(history)
        return history

    def get_by_task_id(self, task_id: int) -> List[TaskHistory]:
        return (
            self.db.query(TaskHistory)
            .filter(TaskHistory.task_id == task_id)
            .order_by(TaskHistory.timestamp.desc())
            .all()
        )

    def get_by_user_tasks(self, task_ids: List[int]) -> List[TaskHistory]:
        return (
            self.db.query(TaskHistory)
            .filter(TaskHistory.task_id.in_(task_ids))
            .order_by(TaskHistory.timestamp.desc())
            .all()
        )
