#!/bin/bash

echo "🎵 音樂小幫手 - 開發環境啟動"
echo "================================"

# 檢查後端是否已啟動
echo "檢查後端狀態..."
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ 後端已啟動 (http://localhost:3001)"
else
    echo "⚠️  後端未啟動"
    echo "請在另一個終端機執行:"
    echo "  cd ../music-xiaobangshou-backend && npm start"
    echo ""
fi

# 啟動前端
echo ""
echo "啟動前端開發伺服器..."
echo "前端將會在 http://localhost:5173 啟動"
echo ""

npm run dev
