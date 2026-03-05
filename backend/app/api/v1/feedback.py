from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user_id
from app.services.feedback_service import FeedbackService
from app.schemas.feedback import FeedbackCreate, FeedbackResponse, FeedbackListResponse

router = APIRouter(prefix="/feedback", tags=["Feedback"])


@router.post("", response_model=FeedbackResponse, status_code=201)
def create_feedback(
    feedback_data: FeedbackCreate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Create a new feedback entry. Optionally linked to a task."""
    service = FeedbackService(db)
    return service.create_feedback(user_id, feedback_data)


@router.get("", response_model=FeedbackListResponse)
def get_feedbacks(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Get all feedbacks submitted by the current user."""
    service = FeedbackService(db)
    return service.get_user_feedbacks(user_id)
