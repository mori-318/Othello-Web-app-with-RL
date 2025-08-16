FROM node:20-slim

WORKDIR /app

# package.jsonをコピー
COPY package.json ./

# 依存関係をインストール
RUN npm install

# アプリケーションコードをコピー
COPY . .

# ポート5173を公開
EXPOSE 5173

# 開発サーバーを起動
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
