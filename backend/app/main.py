import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import init_db
from .api.router import router as api_router

app = FastAPI(
    title=settings.APP_NAME,
    description="Backend API for Voice Coach AI",
    version="0.1.0"
)

# Set up CORS middleware
origins = settings.CORS_ORIGINS if settings.CORS_ORIGINS else ["*"]
if "*" in origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

@app.on_event("startup")
def on_startup():
    """Initialize DB and create upload directory on startup."""
    init_db()
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

app.include_router(api_router)

@app.get("/health", tags=["System"])
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

@app.get("/", tags=["System"])
def root():
    """Root endpoint."""
    return {
        "app_name": settings.APP_NAME,
        "version": "0.1.0",
        "docs_url": "/docs"
    }
