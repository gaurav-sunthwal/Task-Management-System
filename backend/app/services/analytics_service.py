from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from collections import Counter, defaultdict
from app.repositories.task_repository import TaskRepository
from app.models.task import TaskStatus
from app.schemas.analytics import AnalyticsResponse, PriorityDistribution, DailyCompletion


class AnalyticsService:
    """Business logic for calculating analytics and productivity metrics."""

    def __init__(self, db: Session):
        self.task_repo = TaskRepository(db)

    def get_analytics(self, user_id: int) -> AnalyticsResponse:
        """
        Calculate comprehensive analytics for a user.

        Productivity Score Formula:
        =========================
        The productivity score (0-100) is calculated as a weighted combination of:
        - Completion Rate (40%): percentage of tasks completed vs total
        - Consistency (30%): how many of the last 7 days had at least one completion
        - On-time Rate (20%): percentage of tasks completed before their due date
        - Volume (10%): normalized count of tasks completed this week (capped at 10)

        Score = (completion_rate * 0.4) + (consistency * 0.3) + (on_time_rate * 0.2) + (volume_score * 0.1)
        """
        all_tasks = self.task_repo.get_all_by_user(user_id)
        total_tasks = len(all_tasks)

        if total_tasks == 0:
            return AnalyticsResponse(
                total_tasks=0,
                completed_tasks=0,
                pending_tasks=0,
                archived_tasks=0,
                completion_percentage=0.0,
                tasks_completed_today=0,
                tasks_completed_this_week=0,
                tasks_completed_this_month=0,
                most_productive_day=None,
                average_completion_time_hours=None,
                priority_distribution=[],
                daily_completions=[],
                productivity_score=0.0,
                productivity_score_explanation="No tasks yet. Create and complete tasks to see your productivity score.",
            )

        now = datetime.utcnow()
        today = now.date()
        week_start = today - timedelta(days=today.weekday())
        month_start = today.replace(day=1)

        # Basic counts
        completed_tasks = [t for t in all_tasks if t.status == TaskStatus.Completed]
        pending_tasks = [t for t in all_tasks if t.status == TaskStatus.Pending]
        archived_tasks = [t for t in all_tasks if t.status == TaskStatus.Archived]

        completed_count = len(completed_tasks)
        pending_count = len(pending_tasks)
        archived_count = len(archived_tasks)
        completion_percentage = round((completed_count / total_tasks) * 100, 1) if total_tasks > 0 else 0.0

        # Time-based completions
        tasks_today = sum(1 for t in completed_tasks if t.completed_at and t.completed_at.date() == today)
        tasks_this_week = sum(1 for t in completed_tasks if t.completed_at and t.completed_at.date() >= week_start)
        tasks_this_month = sum(1 for t in completed_tasks if t.completed_at and t.completed_at.date() >= month_start)

        # Most productive day of the week
        day_counts = Counter()
        for t in completed_tasks:
            if t.completed_at:
                day_name = t.completed_at.strftime("%A")
                day_counts[day_name] += 1
        most_productive_day = day_counts.most_common(1)[0][0] if day_counts else None

        # Average completion time (hours between created_at and completed_at)
        completion_times = []
        for t in completed_tasks:
            if t.completed_at and t.created_at:
                delta = t.completed_at - t.created_at
                completion_times.append(delta.total_seconds() / 3600)
        avg_completion_hours = round(sum(completion_times) / len(completion_times), 1) if completion_times else None

        # Priority distribution
        priority_dist = self.task_repo.get_priority_distribution(user_id)
        priority_distribution = [
            PriorityDistribution(priority=p.value if hasattr(p, 'value') else str(p), count=c)
            for p, c in priority_dist
        ]

        # Daily completions (last 30 days)
        daily_map = defaultdict(int)
        for t in completed_tasks:
            if t.completed_at:
                day_str = t.completed_at.strftime("%Y-%m-%d")
                daily_map[day_str] += 1

        # Fill in zeros for the last 30 days
        daily_completions = []
        for i in range(29, -1, -1):
            day = (today - timedelta(days=i)).isoformat()
            daily_completions.append(DailyCompletion(date=day, count=daily_map.get(day, 0)))

        # Productivity Score Calculation
        # 1. Completion Rate (40%)
        completion_rate = (completed_count / total_tasks) * 100 if total_tasks > 0 else 0

        # 2. Consistency (30%) - days with completions in last 7 days
        last_7_days = set()
        for t in completed_tasks:
            if t.completed_at and (today - t.completed_at.date()).days < 7:
                last_7_days.add(t.completed_at.date())
        consistency = (len(last_7_days) / 7) * 100

        # 3. On-time Rate (20%) - completed before due date
        on_time = 0
        with_due = 0
        for t in completed_tasks:
            if t.due_date:
                with_due += 1
                if t.completed_at and t.completed_at <= t.due_date:
                    on_time += 1
        on_time_rate = (on_time / with_due * 100) if with_due > 0 else 100

        # 4. Volume Score (10%) - tasks completed this week, capped at 10
        volume_score = min(tasks_this_week / 10, 1.0) * 100

        productivity_score = round(
            (completion_rate * 0.4) + (consistency * 0.3) + (on_time_rate * 0.2) + (volume_score * 0.1),
            1
        )

        explanation = (
            f"Score: {productivity_score}/100. "
            f"Based on: Completion Rate ({round(completion_rate, 1)}% × 40%), "
            f"Consistency ({round(consistency, 1)}% × 30%), "
            f"On-time Rate ({round(on_time_rate, 1)}% × 20%), "
            f"Weekly Volume ({round(volume_score, 1)}% × 10%)."
        )

        return AnalyticsResponse(
            total_tasks=total_tasks,
            completed_tasks=completed_count,
            pending_tasks=pending_count,
            archived_tasks=archived_count,
            completion_percentage=completion_percentage,
            tasks_completed_today=tasks_today,
            tasks_completed_this_week=tasks_this_week,
            tasks_completed_this_month=tasks_this_month,
            most_productive_day=most_productive_day,
            average_completion_time_hours=avg_completion_hours,
            priority_distribution=priority_distribution,
            daily_completions=daily_completions,
            productivity_score=productivity_score,
            productivity_score_explanation=explanation,
        )
