from sqlalchemy.orm import Session
from typing import Optional, List
from app.repositories.feedback_repository import FeedbackRepository
from app.schemas.feedback import FeedbackCreate, FeedbackResponse, FeedbackListResponse


class FeedbackService:
    """Business logic for feedback operations."""

    def __init__(self, db: Session):
        self.feedback_repo = FeedbackRepository(db)

    def create_feedback(self, user_id: int, feedback_data: FeedbackCreate) -> FeedbackResponse:
        """Create a new feedback entry."""
        feedback = self.feedback_repo.create(
            user_id=user_id,
            comment=feedback_data.comment,
            rating=feedback_data.rating,
            task_id=feedback_data.task_id,
        )
        return FeedbackResponse.model_validate(feedback)

    def get_user_feedbacks(self, user_id: int) -> FeedbackListResponse:
        """Get all feedbacks for a user."""
        feedbacks = self.feedback_repo.get_by_user(user_id)
        return FeedbackListResponse(
            feedbacks=[FeedbackResponse.model_validate(f) for f in feedbacks],
            total=len(feedbacks),
        )
