from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user_id
from app.services.auth_service import AuthService
from app.schemas.user import UserCreate, UserLogin, TokenRefresh, TokenResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user.
    Returns access token, refresh token, and user info.
    """
    service = AuthService(db)
    return service.register(user_data)


@router.post("/login", response_model=TokenResponse)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate user with email and password.
    Returns access token, refresh token, and user info.
    """
    service = AuthService(db)
    return service.login(login_data)


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(token_data: TokenRefresh, db: Session = Depends(get_db)):
    """
    Refresh access token using a valid refresh token.
    Returns new access token and refresh token pair.
    """
    service = AuthService(db)
    return service.refresh_tokens(token_data.refresh_token)


@router.get("/me", response_model=UserResponse)
def get_me(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Get the currently authenticated user's profile."""
    service = AuthService(db)
    user = service.get_current_user(user_id)
    return UserResponse.model_validate(user)
