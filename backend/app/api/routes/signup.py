
from typing import Any, List
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from sqlmodel import select, delete
from fastapi_mail import FastMail
from pydantic import ValidationError

from app.db.email_utils import EmailSchema
from app.core.config import settings
from app.db import crud
from app.core.security import create_access_token

from app.api.dependencies import (
    SessionDep,
    generate_verification_code,
    send_verification_code,
    render_html_template,
    send_mail
)
from app.db.models import (
    UserCreate,
    UserSignUp,
    Message,
    EmailVerification,
    Token
)

router = APIRouter()

@router.post("/signup", response_model=Message)
def sign_up(session: SessionDep, user_in: UserSignUp, background_tasks: BackgroundTasks) -> Any:
    """
    New User Sign Up, to be used by user to register themselves.
    """
    if not settings.USER_SIGNUP:
        raise HTTPException(
            status_code=403,
            detail="Users are forbidden to Sign Up in this server. \
                Please contact your Administrator!",
        )
    
    user = crud.get_user_by_email(session=session, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email currently exists in the system.",
        )
    
    user_create = UserCreate.from_orm(user_in)
    user = crud.create_user(session=session, user_create=user_create)

    verification_code = generate_verification_code(session, user.id)
    # print(verification_code)

    # Send the verification code to the user's email
    send_verification_code(user.email, verification_code, background_tasks)

    return Message(message="Verification code sent Successfully")

@router.post("/signup/verify-email")
def verify_email(session: SessionDep, email: str, code: str) -> Token:
    user = crud.get_user_by_email(session=session, email=email)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get the latest verification code for the user
    email_verification = session.exec(
        select(EmailVerification)
        .where(EmailVerification.user_id == user.id)
        .order_by(EmailVerification.created_at.desc())  # Order by creation time in descending order
        .limit(1)  # Limit to the latest record
    ).one_or_none()

    if not email_verification or email_verification.code != code:
        raise HTTPException(
            status_code=400,
            detail="Invalid verification code")

    if email_verification.expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=400,
            detail="Verification code has expired")

    user.email_verified = True

    # Deleting verification code after successful verification to avoid replay attacs
    session.delete(email_verification)
    session.commit()

    access_token_expires = timedelta(days=settings.ACCESS_TOKEN_EXPIRE)
    return Token(
        access_token=create_access_token(
            user.id, expires_delta=access_token_expires
        )
    )

@router.post("/signup/resend-verification-code", response_model=Message)
def resend_verification_code(session: SessionDep, email: str, background_tasks: BackgroundTasks) -> Any:
    """
    Resend verification code to the user's email.
    """
    user = crud.get_user_by_email(session=session, email=email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.email_verified:
        raise HTTPException(status_code=400, detail="Email already verified")

    # Delete existing verification codes for the user
    session.exec(
        delete(EmailVerification)
        .where(EmailVerification.user_id == user.id)
    )

    # Generate a new verification code
    verification_code = generate_verification_code(session, user.id)
    # print(verification_code)

    # Send the new verification code to the user's email
    send_verification_code(user.email, verification_code, background_tasks)

    return Message(message="Verification code resent successfully")

@router.post("/test-email",  response_model=Message)
async def test_email(
        email_to: str
):
    email_content = render_html_template("test_email.html")

    email_data = EmailSchema(
        subject="Welcome to Fauna Finder",
        recipients=[email_to],
        body=email_content,
    )

    await send_mail(email_data)
    
    return Message(message="Email sent successfully")
