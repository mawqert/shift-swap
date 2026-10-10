from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import user, shift, swap_request

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