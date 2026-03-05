import enum
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, func
from sqlalchemy.orm import relationship
from app.core.database import Base


class TaskPriority(str, enum.Enum):
    Low = "Low"
    Medium = "Medium"
    High = "High"


class TaskStatus(str, enum.Enum):
    Pending = "Pending"
    Completed = "Completed"
    Archived = "Archived"


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(Enum(TaskPriority), default=TaskPriority.Medium, nullable=False, index=True)
    status = Column(Enum(TaskStatus), default=TaskStatus.Pending, nullable=False, index=True)
    due_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", back_populates="tasks")
    history = relationship("TaskHistory", back_populates="task", cascade="all, delete-orphan")
    feedbacks = relationship("Feedback", back_populates="task", cascade="all, delete-orphan")
