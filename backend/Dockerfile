# Backend Dockerfile for Voice Coach AI
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for audio processing (librosa, soundfile, ffmpeg)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    ffmpeg \
    libsndfile1 \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY . .

# Create storage directory
RUN mkdir -p storage/uploads

# Expose port
EXPOSE 8000

# Run FastAPI with uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
