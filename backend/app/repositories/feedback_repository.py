from sqlalchemy.orm import Session
from typing import Optional, List
from app.models.feedback import Feedback


class FeedbackRepository:
    """Data access layer for Feedback operations."""

    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: int, comment: str, rating: int,
               task_id: Optional[int] = None) -> Feedback:
        feedback = Feedback(
            user_id=user_id,
            task_id=task_id,
            comment=comment,
            rating=rating,
        )
        self.db.add(feedback)
        self.db.commit()
        self.db.refresh(feedback)
        return feedback

    def get_by_user(self, user_id: int) -> List[Feedback]:
        return (
            self.db.query(Feedback)
            .filter(Feedback.user_id == user_id)
            .order_by(Feedback.created_at.desc())
            .all()
        )

    def get_by_task(self, task_id: int) -> List[Feedback]:
        return (
            self.db.query(Feedback)
            .filter(Feedback.task_id == task_id)
            .order_by(Feedback.created_at.desc())
            .all()
        )
