# 2026 世界盃｜台灣時間戰況站

靜態 GitHub Pages 網站，包含台灣時間每日賽程、戰果、小組晉級戰況、進球榜、中文新聞、精彩影片與賽前 1X2 賠率。

## 本機執行

```bash
npm run update
npm run serve
```

開啟 `http://localhost:4173`。

## 自動更新與賠率

GitHub Actions 每三小時更新一次。賽程與戰果來自 openfootball 公開資料；中文新聞來自 Google News RSS。若要顯示賠率，請在 repository 的 Settings → Secrets and variables → Actions 新增 `ODDS_API_KEY`（The Odds API）。沒有金鑰時網站不會顯示虛構賠率。

在 Settings → Pages 將 Source 設為 **GitHub Actions** 即可發佈。
