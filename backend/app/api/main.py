from fastapi import APIRouter

from app.api.routes import login, signup, users, fauna, classifier

api_router = APIRouter()
api_router.include_router(login.router, tags=["login"])
api_router.include_router(signup.router, tags=["signup"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(fauna.router, prefix="/fauna", tags=["fauna"])
api_router.include_router(classifier.router, prefix="/classifier", tags=["classifier"])
