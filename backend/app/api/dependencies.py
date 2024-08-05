import random
import string
from collections.abc import Generator
from typing import Annotated
from datetime import datetime, timedelta, timezone
from pathlib import Path
from jinja2 import Environment, FileSystemLoader


from fastapi import Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import ValidationError
from sqlmodel import Session, select
from fastapi_mail import FastMail, MessageSchema

from app.core import security
from app.core.config import settings
from app.db.db import engine
from app.db.models import TokenPayload, User, UserType, EmailVerification
from app.db.email_utils import EmailSchema

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/login/access-token"
)


def get_db() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_db)]
TokenDep = Annotated[str, Depends(reusable_oauth2)]


def get_current_user(session: SessionDep, token: TokenDep) -> User:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    user = session.get(User, token_data.sub)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def get_current_active_superuser(current_user: CurrentUser) -> User:
    if current_user.user_type != UserType.SUPERUSER:
        raise HTTPException(
            status_code=400, detail="The user doesn't have enough privileges"
        )
    return current_user

def generate_password_reset_token(email: str) -> str:
    delta = timedelta(hours=settings.PASSWORD_RESET_TOKEN_EXPIRE_HOURS)
    now = datetime.now(timezone.utc)
    expires = now + delta
    exp = expires.timestamp()
    encoded_jwt = jwt.encode(
        {"exp": exp, "nbf": now, "sub": email},
        settings.SECRET_KEY,
        algorithm=security.ALGORITHM,
    )
    return encoded_jwt


def verify_password_reset_token(token: str) -> str | None:
    try:
        decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=security.ALGORITHM)
        return str(decoded_token["sub"])
    except JWTError:
        return None

def generate_verification_code(session: Session, user_id: int) -> str:
    code = ''.join(random.choices(string.digits, k=6))

    email_verification = EmailVerification(
        user_id=user_id,
        code=code,
        expires_at=datetime.now(timezone.utc) + timedelta(hours=1)
    )
    session.add(email_verification)
    session.commit()

    return code

def render_html_template(template_name: str, **kwargs) -> str:
    template_dir = Path("app/templates")
    env = Environment(loader=FileSystemLoader(template_dir))
    template = env.get_template(template_name)
    return template.render(**kwargs)

def send_verification_code(email: str, verification_code: str, background_tasks: BackgroundTasks):
    """
    Send the verification code to the user's email using an HTML template.
    """
    # Render the HTML template
    email_content = render_html_template("verification_email.html", verification_code=verification_code)
    
    # Send the verification code via email using the HTML template
    email_data = EmailSchema(
        subject="Account Verification",
        recipients=[email],
        body=email_content,
    )
    background_tasks.add_task(send_mail, email_data)

async def send_mail(email_data: EmailSchema) -> None:
    message = MessageSchema(
        subject=email_data.subject,
        recipients=email_data.recipients,
        body=email_data.body,
        cc=email_data.cc,
        bcc=email_data.bcc,
        attachments=email_data.attachments,
        subtype="html",
    )

    fm = FastMail(settings.MAIL_CONFIG)

    await fm.send_message(message)