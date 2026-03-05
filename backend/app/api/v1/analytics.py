from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user_id
from app.services.analytics_service import AnalyticsService
from app.schemas.analytics import AnalyticsResponse

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("", response_model=AnalyticsResponse)
def get_analytics(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Get comprehensive analytics for the current user.

    Returns:
    - Task counts (total, completed, pending, archived)
    - Completion percentage
    - Time-based completions (today, this week, this month)
    - Most productive day of the week
    - Average completion time in hours
    - Priority distribution
    - Daily completion trend (last 30 days)
    - Productivity score (0-100) with explanation
    """
    service = AnalyticsService(db)
    return service.get_analytics(user_id)
