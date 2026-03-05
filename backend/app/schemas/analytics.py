from pydantic import BaseModel
from typing import List, Optional
from datetime import date


class PriorityDistribution(BaseModel):
    priority: str
    count: int


class DailyCompletion(BaseModel):
    date: str
    count: int


class AnalyticsResponse(BaseModel):
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    archived_tasks: int
    completion_percentage: float
    tasks_completed_today: int
    tasks_completed_this_week: int
    tasks_completed_this_month: int
    most_productive_day: Optional[str]
    average_completion_time_hours: Optional[float]
    priority_distribution: List[PriorityDistribution]
    daily_completions: List[DailyCompletion]
    productivity_score: float
    productivity_score_explanation: str
