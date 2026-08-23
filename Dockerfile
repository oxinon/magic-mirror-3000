FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .
COPY config ./config
COPY static ./static

ENV DATA_ROOT=/app/data \
    API_PORT=5031 \
    MIRROR_PORT=5032

EXPOSE 5031 5032

CMD ["python", "app.py"]
