from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import col, delete, func, select

from app.db import crud
from app.core.config import settings
from app.core.security import get_password_hash, verify_password
from app.api.dependencies import (
    get_current_active_superuser,
    SessionDep,
    CurrentUser
)
from app.db.models import (
    User,
    UserCreate,
    UserUpdate,
    UserType,
    UserUpdateCurrent,
    UpdatePassword,
    UserSignUp,
    UserOut,
    UsersOut,
    Message
)

router = APIRouter()


@router.post(
    "/", dependencies=[Depends(get_current_active_superuser)], response_model=UserOut
)
def create_user(*, session: SessionDep, user_in: UserCreate) -> Any:
    """
    Create new user.
    """
    user = crud.get_user_by_email(session=session, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )

    user = crud.create_user(session=session, user_create=user_in)
    return user
    

@router.get("/{user_id}", response_model=UserOut)
def get_user_by_id(
    user_id: int, session: SessionDep, current_user: CurrentUser
) -> Any:
    """
    Get a specific user by id.
    """
    user = session.get(User, user_id)
    if user == current_user:
        return user
    if current_user.user_type != UserType.SUPERUSER:
        raise HTTPException(
            status_code=403,
            detail="The user doesn't have enough privileges",
        )
    return user

@router.patch(
    "/{user_id}",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=UserOut,
)
def update_user(*, session: SessionDep, user_id: int, user_in: UserUpdate) -> Any:
    """
    Update a user.
    """

    db_user = session.get(User, user_id)
    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="The user with this id does not exist in the system",
        )
    if user_in.email:
        existing_user = crud.get_user_by_email(session=session, email=user_in.email)
        if existing_user and existing_user.id != user_id:
            raise HTTPException(
                status_code=409, detail="User with this email already exists"
            )

    db_user = crud.update_user(session=session, db_user=db_user, user_in=user_in)
    return db_user

@router.get("/current_user", response_model=UserOut)
def get_current_user(*, session: SessionDep, current_user: CurrentUser) -> Any:
    """
    Get current user.
    """
    return current_user


@router.patch("/current_user/update", response_model=UserOut)
def update_current_user(
    *, session: SessionDep, user_in: UserUpdateCurrent, current_user: CurrentUser
) -> Any:
    """
    Update current user.
    """

    if user_in.email:
        existing_user = crud.get_user_by_email(session=session, email=user_in.email)
        if existing_user and existing_user.id != current_user.id:
            raise HTTPException(
                status_code=409, detail="User with this email already exists"
            )
    user_data = user_in.model_dump(exclude_unset=True)
    current_user.sqlmodel_update(user_data)
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return current_user


@router.patch("/current_user/password", response_model=Message)
def update_current_user_password(
    *, session: SessionDep, body: UpdatePassword, current_user: CurrentUser
) -> Any:
    """
    Update current user's password.
    """
    if not verify_password(body.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect password")
    if body.current_password == body.new_password:
        raise HTTPException(
            status_code=400, detail="New password cannot be the same as current password."
        )
    hashed_password = get_password_hash(body.new_password)
    current_user.hashed_password = hashed_password
    session.add(current_user)
    session.commit()
    return Message(message="Password updated successfully")

@router.get(
    "/", dependencies=[Depends(get_current_active_superuser)], response_model=UsersOut
)
def get_users(session: SessionDep, skip: int = 0, limit: int = 100) -> Any:
    """
    Get users.
    """

    statment = select(func.count()).select_from(User)
    count = session.exec(statment).one()

    statement = select(User).offset(skip).limit(limit)
    users = session.exec(statement).all()

    return UsersOut(data=users, count=count)

