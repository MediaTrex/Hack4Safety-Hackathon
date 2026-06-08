from pydantic import BaseModel, EmailStr, Field
from typing import Literal, Optional


UserRole = Literal["rescue_team", "admin"]


class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    mobile_number: str = Field(min_length=6, max_length=30)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str = Field(min_length=4, max_length=12)
    purpose: Literal["register", "reset"]


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str = Field(min_length=4, max_length=12)
    new_password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    identifier: str = Field(min_length=3, max_length=80, description="Email or mobile number")
    password: str = Field(min_length=8, max_length=128)


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: UserRole
    user_id: str
    full_name: str
    email: EmailStr

