from datetime import timedelta
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm

from app.db import crud
from app.core.config import settings
from app.core.security import get_password_hash, create_access_token
from app.db.email_utils import EmailSchema

from app.db.models import (
    Token,
    NewPassword,
    Message
)
from app.api.dependencies import (
    SessionDep,
    generate_password_reset_token,
    verify_password_reset_token,
    render_html_template,
    send_mail
)

router = APIRouter()

@router.post("/login/access-token")
def login_access_token(
    session: SessionDep, form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
) -> Token:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = crud.authenticate(
        session=session, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    elif not user.email_verified:
        raise HTTPException(status_code=400, detail="User not verified")
    access_token_expires = timedelta(days=settings.ACCESS_TOKEN_EXPIRE)
    return Token(
        access_token=create_access_token(
            user.id, expires_delta=access_token_expires
        )
    )

@router.post("/recover-password/{email}", response_model=Message)
def recover_password(email: str, session: SessionDep, background_tasks: BackgroundTasks = None) -> Any:
    """
    Password Recovery
    """
    user = crud.get_user_by_email(session=session, email=email)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this email does not exist in the system.",
        )

    password_reset_token = generate_password_reset_token(email=email)
    
    # TODO: update reset link with with mobile deeplink url
    # reset_link = f"https://0.0.0.0:8888/reset-password?token={password_reset_token}"
    # exp:// is not supported , 
    reset_link = f"https://192.168.1.181:8081/reset-password?token={password_reset_token}"


    # Load the password reset email template
    email_content = render_html_template("password_reset_email.html", name=user.full_name, reset_link=reset_link)
    email_data = EmailSchema(
        subject="Password Reset Request",
        recipients=[user.email],
        body=email_content,
    )
    background_tasks.add_task(send_mail, email_data)

    return Message(message="Password recovery email sent")

@router.post("/reset-password/")
def reset_password(session: SessionDep, body: NewPassword) -> Message:
    """
    Reset password
    """
    email = verify_password_reset_token(token=body.token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid token")
    user = crud.get_user_by_email(session=session, email=email)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this email does not exist in the system.",
        )
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    hashed_password = get_password_hash(password=body.new_password)
    user.hashed_password = hashed_password
    session.add(user)
    session.commit()
    return Message(message="Password updated successfully")
