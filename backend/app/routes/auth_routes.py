from fastapi import APIRouter, Cookie, Response
from fastapi import HTTPException

from app.schemas.auth_schemas import (
    ForgotPasswordRequest,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
    VerifyOtpRequest,
)
from app.services.auth_service import (
    create_user,
    login as login_service,
    request_forgot_password_otp,
    reset_password,
    start_registration_otp,
    verify_otp,
)
from app.config.settings import get_settings
from app.config.database import get_collection


settings = get_settings()

router = APIRouter(tags=["auth"])

@router.post("/auth/rescue/register")
async def rescue_register(payload: RegisterRequest):
    user_id, _ = await create_user(
        role="rescue_team",
        full_name=payload.full_name,
        mobile_number=payload.mobile_number,
        email=payload.email,
        password=payload.password,
    )

    # Send OTP for registration verification
    await start_registration_otp(email=payload.email, purpose="register")

    return {"message": "OTP sent to email for verification", "user_id": user_id}


@router.post("/auth/admin/register")
async def admin_register(payload: RegisterRequest):
    user_id, _ = await create_user(
        role="admin",
        full_name=payload.full_name,
        mobile_number=payload.mobile_number,
        email=payload.email,
        password=payload.password,
    )

    await start_registration_otp(email=payload.email, purpose="register")

    return {"message": "OTP sent to email for verification", "user_id": user_id}


@router.post("/auth/verify-otp")
async def verify_registration_otp(payload: VerifyOtpRequest):
    await verify_otp(email=payload.email, otp=payload.otp, purpose=payload.purpose)
    return {"message": "OTP verified"}


@router.post("/auth/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest):
    await request_forgot_password_otp(email=payload.email)
    return {"message": "OTP sent to email for password reset"}


@router.post("/auth/reset-password")
async def reset_password_endpoint(payload: ResetPasswordRequest):
    await reset_password(email=payload.email, otp=payload.otp, new_password=payload.new_password)
    return {"message": "Password updated"}



@router.post("/auth/login")
async def login_endpoint(payload: LoginRequest, response: Response):
    auth = await login_service(identifier=payload.identifier, password=payload.password)

    # Rescue app needs JWT in JSON only.
    # Web dashboard uses cookies: set cookie only for admin.
    if auth["role"] == "admin":
        response.set_cookie(
            key=settings.COOKIE_NAME,
            value=auth["access_token"],
            httponly=settings.COOKIE_HTTPONLY,
            secure=settings.COOKIE_SECURE,
            samesite=settings.COOKIE_SAMESITE,
            max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        )

    return auth

