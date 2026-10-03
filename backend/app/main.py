from fastapi import FastAPI
from app.routers import user, shift, swap_request

app = FastAPI(title="Сервис обмена сменами")

app.include_router(user.router)
app.include_router(shift.router)
app.include_router(swap_request.router)