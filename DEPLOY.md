# 音樂小幫手 - 部署指南

## 專案結構

```
music-assistant-app/          # 前端 (React + Vite)
music-xiaobangshou-backend/   # 後端 (Express + PostgreSQL)
```

## 部署步驟

### 1. 部署後端 (Render)

1. 登入 [Render](https://render.com)
2. 點擊 **New** → **Web Service**
3. 連接 GitHub repo: `music-xiaobangshou-backend`
4. 設定：
   - **Name**: `music-xiaobangshou-api`
   - **Runtime**: `Docker`
   - **Plan**: Free
5. 點擊 **Create Web Service**

Render 會自動讀取 `render.yaml` 設定：
- 建立 Web Service
- 建立 PostgreSQL 資料庫
- 設定環境變數

### 2. 執行資料庫遷移

在 Render Dashboard → Shell：

```bash
# 執行遷移
npm run migrate

# 插入測試資料
npm run seed
```

### 3. 部署前端 (Render)

1. 點擊 **New** → **Static Site**
2. 連接 GitHub repo: `dreamland` (前端)
3. 設定：
   - **Name**: `music-assistant-app`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. 設定環境變數：
   - `VITE_API_URL`: `https://music-xiaobangshou-api.onrender.com/api`
5. 點擊 **Create Static Site**

### 4. 更新前端 API URL

確保 `music-assistant-app/.env`：

```env
VITE_API_URL=https://music-xiaobangshou-api.onrender.com/api
```

### 5. 測試帳號

| 角色 | Email | 密碼 |
|------|-------|------|
| 老師 | teacher@test.com | 123456 |
| 學生 | lin@test.com | 123456 |
| 學生 | zhang@test.com | 123456 |
| 學生 | chen@test.com | 123456 |
| 學生 | liu@test.com | 123456 |

## API 端點

### 認證
- `POST /api/auth/register` - 註冊
- `POST /api/auth/login` - 登入
- `GET /api/auth/me` - 取得目前用戶

### 學生
- `GET /api/students` - 取得學生列表
- `POST /api/students` - 新增學生
- `PUT /api/students/:id` - 更新學生
- `DELETE /api/students/:id` - 刪除學生

### 課程
- `GET /api/lessons` - 取得課程列表
- `POST /api/lessons` - 新增課程
- `PUT /api/lessons/:id` - 更新課程
- `DELETE /api/lessons/:id` - 刪除課程

### 出席
- `GET /api/attendance` - 取得出席紀錄
- `POST /api/attendance` - 新增出席紀錄

### 通知
- `GET /api/notifications` - 取得通知
- `PUT /api/notifications/:id/read` - 標記已讀

## 常見問題

### Q: 部署後 API 回傳 502？
A: 等 1-2 分鐘，Render Free 方案啟動較慢

### Q: 資料庫連線失敗？
A: 確認 `DATABASE_URL` 環境變數正確

### Q: 如何更新部署？
A: 推送程式碼到 GitHub，Render 會自動重新部署
