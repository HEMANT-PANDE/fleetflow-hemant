import os
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from dotenv import load_dotenv

load_dotenv()

conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=int(os.getenv("MAIL_PORT")),
    MAIL_SERVER=os.getenv("MAIL_SERVER"),
    MAIL_STARTTLS=True,     # ✅ NEW
    MAIL_SSL_TLS=False,     # ✅ NEW
    USE_CREDENTIALS=True
)

async def send_otp_email(email: str, otp: str):
    message = MessageSchema(
        subject="FleetFlow Password Reset OTP",
        recipients=[email],
        body=f"Your OTP is {otp}. It expires in 5 minutes.",
        subtype="plain"
    )

    fm = FastMail(conf)
    await fm.send_message(message)