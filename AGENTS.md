# AGENTS

- 使用 `pnpm` 作為套件管理工具。
- 前端技術棧固定為 `React`、`Vite`、`TypeScript`、`Tailwind CSS`。
- UI 採 `mobile-first`，所有新畫面先以手機版可用性為主。
- 視覺風格維持日系、清新自然、米白 / 藍 / 綠主題。
- 明細頁只放記帳與結算相關內容，旅程管理功能放獨立管理頁。
- 修改 UI 時避免重複資訊、過長說明文與過度堆疊區塊。
- 本地開發目前可使用 `localStorage` mock 狀態，正式資料仍以後端 API 為準。
- API 規格目前以後端提供的 `https://go-funny-backend.onrender.com/openapi.json` 為準，由後端維護。
- 前端未來串接方向為 `Orval` + `TanStack Query`。
- 認證方案預計使用 `Better Auth`，需支援 `Google` 登入 / 註冊。
- 新增功能時請同步更新相關文件與路由入口。
- 若後端規格變動，請優先更新文件與前端資料契約。 
