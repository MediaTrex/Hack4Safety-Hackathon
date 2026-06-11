import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple

from fastapi import HTTPException
from passlib.context import CryptContext

from app.config.database import get_collection
from app.config.security import JWTHandler
from app.config.settings import get_settings
from app.services.email_service import send_otp_email


settings = get_settings()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _normalize_email(email: str) -> str:
    return email.strip().lower()


def _normalize_mobile(mobile: str) -> str:
    return mobile.strip()


def _generate_otp() -> str:
    # 6-digit numeric OTP
    return str(secrets.randbelow(900000) + 100000)


def _hash_otp(otp: str) -> str:
    # Hash OTP so OTP is not stored in plaintext.
    return pwd_context.hash(otp)


def _verify_otp(plain_otp: str, hashed_otp: str) -> bool:
    try:
        return pwd_context.verify(plain_otp, hashed_otp)
    except Exception:
        return False


async def create_user(
    *,
    role: str,
    full_name: str,
    mobile_number: str,
    email: str,
    password: str,
) -> Tuple[str, bool]:
    """Create a user in MongoDB.

    Returns: (user_id, is_newly_created)
    """

    users = await get_collection("users")

    email_n = _normalize_email(email)
    mobile_n = _normalize_mobile(mobile_number)

    existing = await users.find_one({"$or": [{"email": email_n}, {"mobile_number": mobile_n}]})
    if existing:
        raise HTTPException(status_code=409, detail="User already exists")

    password_hash = JWTHandler.hash_password(password)

    doc = {
        "role": role,
        "full_name": full_name,
        "mobile_number": mobile_n,
        "email": email_n,
        "password_hash": password_hash,
        "is_email_verified": False,

        "created_at": _utcnow(),
        "updated_at": _utcnow(),
    }

    res = await users.insert_one(doc)
    return str(res.inserted_id), True


async def start_registration_otp(*, email: str, purpose: str) -> None:
    email_n = _normalize_email(email)

    users = await get_collection("users")
    otp_requests = await get_collection("otp_requests")

    user = await users.find_one({"email": email_n})
    if not user:
        # Do not reveal existence too much; but for better UX we can allow.
        raise HTTPException(status_code=404, detail="User not found")

    otp = _generate_otp()
    otp_hash = _hash_otp(otp)

    expires_at = _utcnow() + timedelta(minutes=settings.OTP_TTL_MINUTES)

    await otp_requests.insert_one(
        {
            "email": email_n,
            "purpose": purpose,
            "otp_hash": otp_hash,
            "expires_at": expires_at,
            "created_at": _utcnow(),
            "verified_at": None,
        }
    )

    send_otp_email(email_n, otp, purpose)


async def verify_otp(*, email: str, otp: str, purpose: str) -> None:
    email_n = _normalize_email(email)

    otp_requests = await get_collection("otp_requests")
    users = await get_collection("users")

    # Get latest unexpired OTP request for this purpose.
    now = _utcnow()
    req = await otp_requests.find_one(
        {
            "email": email_n,
            "purpose": purpose,
            "expires_at": {"$gt": now},
            "verified_at": None,
        },
        sort=[("created_at", -1)],
    )

    if not req:
        raise HTTPException(status_code=400, detail="OTP is invalid or expired")

    if not _verify_otp(otp, req["otp_hash"]):
        raise HTTPException(status_code=400, detail="OTP is invalid or expired")

    # Mark OTP verified
    await otp_requests.update_one(
        {"_id": req["_id"]},
        {"$set": {"verified_at": _utcnow()}},
    )

    if purpose == "register":
        await users.update_one(
            {"email": email_n},
            {"$set": {"is_email_verified": True, "updated_at": _utcnow()}},
        )


async def request_forgot_password_otp(*, email: str) -> None:
    # Works for both rescue_team and admin users.
    await start_registration_otp(email=email, purpose="reset")

async def reset_password(*, email: str, otp: str, new_password: str) -> None:
    # Works for both rescue_team and admin users.
    email_n = _normalize_email(email)


    otp_requests = await get_collection("otp_requests")
    users = await get_collection("users")

    now = _utcnow()
    req = await otp_requests.find_one(
        {
            "email": email_n,
            "purpose": "reset",
            "expires_at": {"$gt": now},
            "verified_at": None,
        },
        sort=[("created_at", -1)],
    )

    if not req:
        raise HTTPException(status_code=400, detail="OTP is invalid or expired")

    if not _verify_otp(otp, req["otp_hash"]):
        raise HTTPException(status_code=400, detail="OTP is invalid or expired")

    # Mark OTP verified
    await otp_requests.update_one(
        {"_id": req["_id"]},
        {"$set": {"verified_at": _utcnow()}},
    )

    password_hash = JWTHandler.hash_password(new_password)
    res = await users.update_one(
        {"email": email_n},
        {"$set": {"password_hash": password_hash, "updated_at": _utcnow()}},
    )

    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")


async def login(*, identifier: str, password: str) -> dict:
    users = await get_collection("users")

    identifier = identifier.strip()

    query = {}
    if "@" in identifier:
        query = {"email": _normalize_email(identifier)}
    else:
        query = {"mobile_number": _normalize_mobile(identifier)}

    user = await users.find_one(query)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # For mobile rescue team: require verification. For admin: also verify.
    if not user.get("is_email_verified", False):
        raise HTTPException(status_code=403, detail="Email not verified")

    if not JWTHandler.verify_password(password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = JWTHandler.create_access_token(
        {"user_id": str(user["_id"]), "role": user["role"]}
    )

    return {
        "access_token": token,
        "role": user["role"],
        "user_id": str(user["_id"]),
        "full_name": user.get("full_name", ""),
        "email": user["email"],
    }

