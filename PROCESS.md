# Othello Web App with RL — 開発プロセスとアーキテクチャ (created by GPT-5 high-reasoning)

本書は、強化学習(RL)エージェントと対戦可能なオセロWebアプリの開発プロセス、アーキテクチャ、テスト/検証手順をまとめたものです。実装の順序、各段階での確認観点、テスト方針を詳細に記載します。

- 技術スタック
  - バックエンド: FastAPI (Python)
  - フロントエンド: React + Vite + TypeScript
  - コンテナ: Docker（backend, frontend, db を分離）、ルートで docker-compose
  - DB: PostgreSQL（対戦履歴保存）
  - テスト: pytest, httpx(TestClient), schemathesis(任意), vitest, Playwright
  - RL: Python モジュールとして推論を提供（学習はオフライン/別ジョブ想定）

---

## 全体アーキテクチャ

- ブラウザ(React/TS)
  - REST APIで対戦作成・履歴取得
  - ホットシート（同一PC二人対戦）ではWebSocket不要。手番交代はRESTの応答で最新状態を反映
- バックエンド(FastAPI)
  - ドメイン: オセロ盤面/合法手/反転/終局判定
  - セッション管理: `match_id` ごとのゲーム状態
  - 対戦相手: `random` / `agent` / `pvp`
  - 推論: `AgentPolicy` インターフェース経由でRLモデル推論（CPU推論を前提）
  - DB: 対戦履歴保存（メタ情報と棋譜）
- データベース(PostgreSQL)
  - テーブル: `matches`（メタ）、`moves`（棋譜詳細）もしくは`matches.moves_json`で一括

通信:
- REST: 対戦開始/手の送信/履歴取得（ホットシートはこれで十分）
- WebSocket: 現状不要（ホットシート要件）。オンライン対戦導入時に検討

### 参考ディレクトリ構成（提案）

- `backend/`
  - `app/main.py`（FastAPI起動）
  - `app/api/v1/`（ルータ: matches, moves, history）
  - `app/domain/othello/`（盤面/ルールエンジン）
  - `app/agents/`（`agent_policy.py`, `random_policy.py`, `rl_policy.py`）
  - `app/schemas/`（pydanticモデル）
  - `app/services/`（対戦管理、履歴保存）
  - `app/core/`（設定、DI、ロギング）
  - `tests/`（unit, api, property）
  - `Dockerfile`, `pyproject.toml` or `requirements.txt`
- `frontend/`
  - `src/components/Board.tsx`, `Controls.tsx`, `HistoryTable.tsx`
  - `src/pages/Game.tsx`, `src/pages/History.tsx`, `src/pages/Home.tsx`
  - `src/api/client.ts`（RESTクライアント）
  - `src/state/`（Zustand/Redux 等）
  - `tests/`（unit with vitest）, `e2e/`（Playwright）
  - `Dockerfile`, `vite.config.ts`, `tsconfig.json`
- `docker-compose.yml`（ルート）
- `infra/`（DB初期化SQL等, 任意）
- `PROCESS.md`（本書）

---

## ドメインモデル（要旨）

- `Color`: `black` | `white`
- `Player`: human or agent
- `OpponentType`: `random` | `agent` | `pvp`（同一PCホットシート）
- `Board`: 8x8、`apply_move()`, `legal_moves()`, `is_game_over()`, `score()`
- `Move`: `(row, col)`
- `GameState`: `board`, `turn`, `legal_moves`, `history`
- `Match`: `id`, `opponent_type`, `player_black`, `player_white`, `status`, `created_at`, `finished_at`, `winner`, `moves`

DBスキーマ（簡易案）
- `matches`
  - `id (uuid)`, `opponent_type (text)`, `player_black (text)`, `player_white (text)`
  - `created_at (timestamptz)`, `finished_at (timestamptz)`
  - `winner (text null)`, `moves_json (jsonb)`
  - インデックス: `created_at`, `winner`

---

## API設計（ドラフト）

- `POST /api/v1/matches`
  - body: `{ opponent_type: 'random'|'agent'|'pvp', player_name?: string }`
  - res: `{ match_id, color, initial_state }`
- `POST /api/v1/matches/{match_id}/move`
  - body: `{ row, col }`
  - res: `{ state_after_player, state_after_opponent? }`（相手が即応答する場合）
- `POST /api/v1/matches/{match_id}/resign`
  - res: `{ result, winner }`
- `GET /api/v1/matches/{match_id}`
  - res: 現在の `GameState`
- `GET /api/v1/history?limit=&offset=&opponent_type=&from=&to=`
  - res: マッチの一覧
- WebSocket: 現状は未提供（ホットシート要件のため不要）。オンライン対戦を導入する際に設計。
契約の安定化:
- OpenAPIでスキーマ確定後、フロントと契約テストを実施

---

## 対戦相手の実装

- `RandomPolicy`：合法手から一様ランダム選択
- `RLPolicy`：保存済みモデル（例: PyTorch）をロードして推論。CPU/軽量化前提。失敗時は`RandomPolicy`にフォールバック
- `PvP`：同一PCで交互入力（ホットシート）。サーバは状態の単一ソース。

推論レイテンシ対策:
- 非同期キュー化、推論タイムアウト、事前ロード

---

## テスト戦略

- 単体テスト（backend）
  - ルール: 合法手/反転/パス/終局/スコア、同一入力に対する決定性
  - Policy: ランダムの合法性、RLのフォールバック
- APIテスト
  - `POST /matches` → 初期盤面、手番/合法手の妥当性
  - `POST /move` → 不正手400、合法手200、状態更新
  - OpenAPI契約、スキーマバリデーション
- フロント単体（vitest）
  - `Board`描画、クリックで座標算出、合法手ハイライト
- E2E（Playwright）
  - ランダム対戦開始→数手進む→終局→履歴に現れる
  - PvP: 同一画面で交互に手を入力し、手番表示・終局まで進行
- プロパティテスト（任意, hypothesis）
  - 反転の可逆性、終局時に合法手なし、など
- パフォーマンステスト
  - 推論のP95レイテンシ、同時対戦N件

---

## 品質/運用

- ロギング: リクエストID, `match_id`, 盤面遷移(要約), 推論時間
- メトリクス: 対戦数、平均手数、勝率、推論時間
- エラーハンドリング: 不正手/タイムアウト/リロード時の復元
- セキュリティ: CORS制限、レート制限(任意)

---

## Docker / Compose 方針（ドラフト）

- サービス（それぞれ専用 `Dockerfile` を用意し、Compose の `build:` で参照）
  - `backend`: `Dockerfile` で依存インストール後 `uvicorn` 起動（`AGENT_MODEL_PATH` 等の環境変数）
  - `frontend`: `Dockerfile` で `npm ci` → `npm run dev`（本番は `npm run build && npm run preview`）
  - `db`: postgres:16（公式イメージ）、永続化 volume
- ネットワーク
  - `frontend` → `backend`（REST/WS） → `db`
- ポート
  - backend: 8000, frontend: 5173, db: 5432

本番/開発の切替:
- `.env`を用意し、composeの`env_file`で注入

---

## 手順（ToDoリスト｜各ステップの確認/テスト込み）

- [x] 0. リポジトリ初期化
  - [x] ルートに `compose.yaml` の雛形、`PROCESS.md` 作成

- [x] 1. ルールエンジン（backend `app/domain/othello/`）
  - [x] 盤面・合法手・反転・パス・終局・スコアの関数実装
  - [x] pytestで網羅的ユニットテスト
  - 確認: `pytest -q` が緑、境界ケース（角、端、全埋め）が通る

- [x] 2. APIスケルトン（`/api/v1`）
  - [x] `POST /matches`, `POST /matches/{id}/move`, `GET /matches/{id}`
  - [x] pydanticスキーマ、OpenAPIドキュメント
  - [x] TestClientでAPIユニット/結合テスト
  - 確認: OpenAPI検証OK、契約テスト通過

- [ ] 3. フロントエンド足場（React/Vite/TS）
  - [x] 初期ディレクトリ作成（`src/components/`, `src/pages/`, `src/api/`, `src/state/`, `src/hooks/`, `src/styles/`, `src/types/`, `tests/`, `e2e/`）
  - [ ] 画面: Home（対戦開始設定）、Game（盤面/操作）、History
  - [ ] `Board`コンポーネント（クリックで座標→API）
  - [ ] 簡易スタイル（Tailwind/Chakra 任意）
  - [ ] vitestでコンポーネント単体テスト
  - 確認: `npm run dev`で描画し操作できる（モックAPI可）

- [ ] 4. Docker 化（最小起動）
  - [ ] backend用 `Dockerfile`（uvicorn起動）
  - [ ] frontend用 `Dockerfile`（dev or build）
  - [ ] postgresサービス、初期化
  - [ ] `compose.yaml` に `build: ./backend` / `build: ./frontend` を設定
  - 確認: `docker-compose up` で3サービスが起動

- [ ] 5. ランダム対戦相手
  - [ ] `RandomPolicy` 実装、`/move`で合法な応答
  - [ ] APIテスト: 不正手→400, 合法→200, 応答内に相手手
  - 確認: UIから数手進行できる

- [ ] 6. PvP（ホットシート／同一PC）
  - [ ] フロントに手番表示・交互入力処理
  - [ ] パス判定とUI（置けない場合のガイダンス）
  - [ ] E2E（Playwright）でPvPシナリオ（同一画面）
  - 確認: 同一PCで交互に手を入力し終局まで進行し、履歴保存される

- [ ] 7. 履歴保存（DB）
  - [ ] 対戦終了時に `matches.moves_json` へ保存
  - [ ] `GET /history` で一覧/フィルタ/ページング
  - [ ] フロント `History` 画面実装
  - 確認: 複数対戦後に履歴が表示・ソート可能

- [ ] 8. RLエージェント推論
  - [ ] `AgentPolicy` 抽象 & 実装（モデルロード/推論）
  - [ ] タイムアウト/フォールバック、起動時ウォームアップ
  - [ ] 性能測定（P95レイテンシ）
  - 確認: 対戦設定で `agent` 選択時に推論が機能

- [ ] 9. UI/UX強化
  - [ ] 合法手ハイライト、置けない場合のパス案内
  - [ ] リスタート/投了/先手後手切替
  - [ ] モバイル対応
  - 確認: ユーザテスト、アクセシビリティ基本要件

- [ ] 10. E2E/結合テストの拡充
  - [ ] ランダム/エージェント/PvPの主要シナリオ
  - [ ] レースコンディション（同時入力）
  - [ ] リグレッションスイート整備
  - 確認: ローカルスクリプトで安定的に通過

- [ ] 11. 監視/ロギング/運用整備
  - [ ] 構造化ログ、相関ID
  - [ ] メトリクス、ヘルスチェック/レディネス
  - [ ] 本番ビルド/リリース手順
  - 確認: 稼働監視・障害時トリアージ手順文書化

---

## 受入基準（Definition of Done）

- ルールエンジンの全ユニットテストが緑
- ランダム/エージェント/PvP で終局まで遊べる
- 履歴に対戦相手・日時・勝敗・棋譜が保存され、UIで閲覧可能
- 主要E2Eシナリオがローカルスクリプトで安定通過
- Docker Composeでワンコマンド起動

---

## リスクと緩和策

- RL推論のレイテンシ: 事前ロード/軽量モデル/フォールバック
- 同時手入力の競合: サーバを唯一の状態源とし、`move`を楽観制御ではなくサーバ決定
- ブラウザリロードで進行中対戦の喪失: サーバ保存/`match_id`で復元し、フロントは再取得UIを提供
- データ肥大: `moves_json`を要約し、古い棋譜のアーカイブ

---

## 将来拡張

- モデルバージョニングとABテスト
- 段階的難易度（探索深さ/温度）
- 自動対戦/自己対戦での継続学習パイプライン

---

## 開発者向けクイックスタート（目安）

1) 依存の準備（後続タスクでDockerfile整備）
2) `docker-compose up -d` で backend/frontend/db 起動
3) `http://localhost:5173` にアクセス（開発時）
4) `http://localhost:8000/docs` でAPI確認

以上。
