from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import engine
from app.models import Base
from app.routers import user, shift, swap_request

Base.metadata.create_all(bind=engine)
app = FastAPI(title="Сервис обмена сменами")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user.router)
app.include_router(shift.router)
app.include_router(swap_request.router)