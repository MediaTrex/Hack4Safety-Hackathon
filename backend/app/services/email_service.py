import smtplib
from email.message import EmailMessage

from app.config.settings import get_settings


settings = get_settings()


def send_otp_email(to_email: str, otp: str, purpose: str) -> None:
    """Send OTP via Google SMTP.

    Expected env vars:
      - SMTP_HOST
      - SMTP_PORT
      - SMTP_USER
      - SMTP_PASSWORD

    purpose: "register" | "reset"
    """

    subject = f"SAJAG AI OTP Verification ({purpose})"
    body = (
        f"Your SAJAG AI verification code is: {otp}\n"
        f"Purpose: {purpose}\n"
        f"This code will expire shortly."
    )

    msg = EmailMessage()
    msg["From"] = settings.SMTP_USER
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.set_content(body)

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.send_message(msg)

