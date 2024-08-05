from typing import Any, Optional, List

from fastapi import APIRouter, HTTPException, Query
from sqlmodel import func, select
from sqlalchemy import or_

from app.api.dependencies import CurrentUser, SessionDep
from app.db.models import User, UserType, Message
from app.db.fauna import Fauna, FaunaOut, FaunasOut, FaunaUpdate

router = APIRouter()


@router.get(
    "/",  response_model=FaunasOut
)
def get_faunas(session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100) -> Any:
    """
    Get Faunas.
    """
    if current_user.user_type not in [UserType.SUPERUSER, UserType.DASHBOARD]:
        raise HTTPException(
            status_code=403,
            detail="The user doesn't have enough privileges",
        )
    
    statment = select(func.count()).select_from(Fauna)
    count = session.exec(statment).one()

    statement = select(Fauna).offset(skip).limit(limit)
    faunas = session.exec(statement).all()

    return FaunasOut(data=faunas, count=count)

@router.get("/search", response_model=List[FaunaOut])
def get_fauna_by_identifier(
    session: SessionDep,
    current_user: CurrentUser,
    label: Optional[int] = Query(None),
    scientific_name: Optional[str] = Query(None),
    common_name: Optional[str] = Query(None),
) -> Any:
    """
    Get fauna by label, scientific name, or common name.
    """
    if current_user.user_type not in [UserType.SUPERUSER, UserType.DASHBOARD]:
        raise HTTPException(
            status_code=403,
            detail="The user doesn't have enough privileges",
        )

    if label is None and scientific_name is None and common_name is None:
        raise HTTPException(
            status_code=400,
            detail="At least one of label, scientific_name, or common_name must be provided",
        )

    search_conditions = []
    if label is not None:
        search_conditions.append(Fauna.image_label == label)
    if scientific_name is not None:
        search_conditions.append(Fauna.scientific_name.ilike(f"%{scientific_name}%"))
    if common_name is not None:
        search_conditions.append(Fauna.common_name.ilike(f"%{common_name}%"))

    fauna_list = session.query(Fauna).filter(or_(*search_conditions)).all()

    if not fauna_list:
        raise HTTPException(
            status_code=404,
            detail="No fauna found",
        )

    return [FaunaOut(**fauna.dict()) for fauna in fauna_list]

@router.get("/{id}", response_model=FaunaOut)
def get_fauna_by_id(
    id: int, session: SessionDep, current_user: CurrentUser
) -> Any:
    """
    Get a specific Fauna by id.
    """
    if current_user.user_type not in [UserType.SUPERUSER, UserType.DASHBOARD]:
        raise HTTPException(
            status_code=403,
            detail="The user doesn't have enough privileges",
        )
    fauna = session.get(Fauna, id)
    return fauna

@router.put("/{id}", response_model=FaunaOut)
def update_fauna(
    *, session: SessionDep, current_user: CurrentUser, id: int, fauna_in: FaunaUpdate
) -> Any:
    """
    Update a Fauna.
    """
    if current_user.user_type not in [UserType.SUPERUSER, UserType.DASHBOARD]:
        raise HTTPException(
            status_code=403,
            detail="The user doesn't have enough privileges",
        )
    
    fauna = session.get(Fauna, id)
    if not fauna:
        raise HTTPException(status_code=404, detail="Fauna not found")
    
    update_dict = fauna_in.model_dump(exclude_unset=True)
    fauna.sqlmodel_update(update_dict)
    session.add(fauna)
    session.commit()
    session.refresh(fauna)
    return fauna

@router.delete("/{id}")
def delete_fauna(session: SessionDep, current_user: CurrentUser, id: int) -> Message:
    """
    Delete a fauna.
    """
    if current_user.user_type not in [UserType.SUPERUSER]:
        raise HTTPException(
            status_code=403,
            detail="The user doesn't have enough privileges",
        )
    
    fauna = session.get(Fauna, id)
    if not fauna:
        raise HTTPException(status_code=404, detail="fauna not found")
    
    session.delete(fauna)
    session.commit()
    return Message(message="Fauna deleted successfully")
