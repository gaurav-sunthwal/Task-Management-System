import enum
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, JSON, func
from sqlalchemy.orm import relationship
from app.core.database import Base


class ActionType(str, enum.Enum):
    created = "created"
    updated = "updated"
    completed = "completed"
    deleted = "deleted"
    archived = "archived"


class TaskHistory(Base):
    __tablename__ = "task_history"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    action_type = Column(Enum(ActionType), nullable=False)
    previous_state = Column(JSON, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    task = relationship("Task", back_populates="history")
