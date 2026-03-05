from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings
from app.api.v1 import auth, tasks, analytics, feedback

# Import all models to register them with SQLAlchemy
from app.models import user, task, task_history, feedback as feedback_model  # noqa


def create_app() -> FastAPI:
    """Application factory for creating the FastAPI app instance."""
    app = FastAPI(
        title=settings.APP_NAME,
        description="A full-stack task management system with authentication, historical tracking, and analytics.",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include API routers
    app.include_router(auth.router, prefix="/api/v1")
    app.include_router(tasks.router, prefix="/api/v1")
    app.include_router(analytics.router, prefix="/api/v1")
    app.include_router(feedback.router, prefix="/api/v1")

    @app.get("/", tags=["Health"])
    def health_check():
        return {"status": "healthy", "app": settings.APP_NAME, "version": "1.0.0"}

    return app


app = create_app()
