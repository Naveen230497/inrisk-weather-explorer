from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager

from app.routes.weather import router as weather_router
from app.config import settings
from app.services.storage import init_storage

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize storage client on startup
    init_storage()
    yield
    # Cleanup on shutdown (if any)

app = FastAPI(
    title="Weather Explorer API",
    description="API for InRisk Labs full-stack weather explorer case study.",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
origins = [origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom validation error handler
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    error_msgs = []
    for error in errors:
        loc = ".".join([str(l) for l in error.get("loc", [])])
        msg = error.get("msg", "")
        error_msgs.append(f"{loc}: {msg}")
        
    return JSONResponse(
        status_code=400,
        content={"status": "error", "message": "; ".join(error_msgs)}
    )

from fastapi.responses import JSONResponse, RedirectResponse

@app.get("/")
async def root():
    return RedirectResponse(url="/docs")

@app.get("/health")
async def health_check():
    return {"status": "ok"}

app.include_router(weather_router)
