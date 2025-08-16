FROM python:3.11-slim

WORKDIR /app

# システムの依存関係をインストール
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# 必要なPythonパッケージを直接インストール
RUN pip install fastapi uvicorn pydantic

# アプリケーションコードをコピー
COPY . .

# ポート8000を公開
EXPOSE 8000

# FastAPIアプリケーションを起動
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
