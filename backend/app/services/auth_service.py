from sqlalchemy.orm import Session
from app.repositories.user_repository import UserRepository
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.core.exceptions import ConflictException, UnauthorizedException, BadRequestException
from app.schemas.user import UserCreate, UserLogin, TokenResponse, UserResponse


class AuthService:
    """Business logic for authentication operations."""

    def __init__(self, db: Session):
        self.user_repo = UserRepository(db)

    def register(self, user_data: UserCreate) -> TokenResponse:
        """Register a new user and return tokens."""
        # Check if user already exists
        if self.user_repo.exists_by_email(user_data.email):
            raise ConflictException(detail="A user with this email already exists")

        # Validate password strength
        if len(user_data.password) < 6:
            raise BadRequestException(detail="Password must be at least 6 characters")

        # Create user
        hashed = hash_password(user_data.password)
        user = self.user_repo.create(
            name=user_data.name,
            email=user_data.email,
            hashed_password=hashed,
        )

        # Generate tokens
        token_data = {"sub": str(user.id), "email": user.email}
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=UserResponse.model_validate(user),
        )

    def login(self, login_data: UserLogin) -> TokenResponse:
        """Authenticate a user and return tokens."""
        user = self.user_repo.get_by_email(login_data.email)
        if not user or not verify_password(login_data.password, user.password):
            raise UnauthorizedException(detail="Invalid email or password")

        token_data = {"sub": str(user.id), "email": user.email}
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=UserResponse.model_validate(user),
        )

    def refresh_tokens(self, refresh_token: str) -> TokenResponse:
        """Validate refresh token and issue new token pair."""
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise UnauthorizedException(detail="Invalid or expired refresh token")

        user_id = int(payload.get("sub"))
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise UnauthorizedException(detail="User not found")

        token_data = {"sub": str(user.id), "email": user.email}
        new_access = create_access_token(token_data)
        new_refresh = create_refresh_token(token_data)

        return TokenResponse(
            access_token=new_access,
            refresh_token=new_refresh,
            user=UserResponse.model_validate(user),
        )

    def get_current_user(self, user_id: int):
        """Get the current authenticated user."""
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise UnauthorizedException(detail="User not found")
        return user
