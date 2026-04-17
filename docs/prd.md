# 1. 系統範圍

---

本系統提供：

- 旅程分帳管理
- 成員管理
- 支出記錄
- 分攤計算
- 結算結果

---

# 2. 核心模式

## Mode 1：一般記帳

- 每筆支出需記錄 payer
- 結算依據：
  - 實際付出
  - 應負擔金額

---

## Mode 2：公積金

- 成員可存入資金
- 支出從共同池扣除
- 不記錄 payer
- 結算依據：
  - 存入金額
  - 應負擔金額

---

# 3. 功能模組

---

## 3.1 Trip

### 功能

- 建立 trip
- 設定 mode
- 修改 / 刪除

---

## 3.2 Member

### 功能

- 新增 member
- 刪除 member
- 查看 member list

---

## 3.3 Expense

### 欄位

- id
- tripId
- title
- amount
- splitType
- participants[]
- payer（一般記帳才有）
- date
- note

---

## 3.4 Split Type

### enum

- `equal_all`
- `equal_selected`
- `custom`

---

## 3.5 Contribution（公積金）

### 欄位

- id
- tripId
- memberId
- amount
- date

---

# 4. 核心邏輯

---

## 一般記帳

### 計算：

1. 每個人「應負擔金額」
2. 每個人「實際付款」
3. 差額 = 付款 - 應付
4. 得出：
   - 誰欠誰

---

## 公積金

### 計算：

1. 每人存入總額
2. 所有支出總額
3. 每人應負擔
4. 差額 = 存入 - 應付

---

# 5. API（MVP）

## 1. Trip

### 1

`POST /trips`

建立旅程

### 2

`GET /trips`

取得旅程列表

### 3

`GET /trips/:tripId`

取得單一旅程資訊

### 4

`PATCH /trips/:tripId`

修改旅程

---

## 2. Members

### 5

`GET /trips/:tripId/members`

取得成員列表

### 6

`POST /trips/:tripId/members`

新增成員

### 7

`DELETE /trips/:tripId/members/:memberId`

刪除成員

---

## 3. Expenses

### 8

`GET /trips/:tripId/expenses`

取得支出列表

### 9

`POST /trips/:tripId/expenses`

新增支出

### 10

`DELETE /trips/:tripId/expenses/:expenseId`

刪除支出

`PATCH /trips/:tripId/expenses/:expenseId`

編輯支出

### 前端路由

`/trip/:tripId/new-expense`

新增記錄入口。一般記帳旅程只顯示新增支出表單；公積金旅程在同一頁提供「新增支出」與「新增公積金」tab，首頁卡片與底部新增入口都導向此路由。

`/trip/:tripId/expenses/:expenseId/edit`

支出編輯頁，與新增支出共用表單，支援更新名稱、金額、日期、付款人、分攤類型與備註。

---

## 4. Contributions

### 11

`GET /trips/:tripId/contributions`

取得公積金存入紀錄

### 12

`POST /trips/:tripId/contributions`

新增公積金存入紀錄

---

## 5. Settlement

### 13

`GET /trips/:tripId/settlement`

取得結算結果

---

## 6. Invitations

### 14

`POST /trips/:tripId/invitations`

建立邀請連結

### 15

`GET /invitations/:token`

查詢邀請資訊

### 16

`POST /invitations/:token/accept`

接受邀請並加入旅程

---

# 7. 前端技術決策

## 6.1 前端框架

- `React`
- `Vite`
- `TypeScript`

---

## 6.2 UI / Styling

- `Tailwind CSS`
- `shadcn/ui`
- 設計原則：`mobile-first`
- 視覺方向：日系旅行感、清新自然、主色為米白 / 藍 / 綠

---

## 6.3 資料取得策略

- 前端資料串接採 `OpenAPI` contract-first 方式管理
- API client 與 hooks 預計使用 `Orval` 生成
- 前端狀態 / server state 預計使用 `TanStack Query`
- 開發初期前端可先使用 mock data 驗證 UI 與流程

---

## 6.4 認證策略

- 認證方案預計使用 `Better Auth`
- 需支援 `Google` 註冊 / 登入
- 前端可先完成 auth UI 與 Better Auth client 骨架
- 最終登入、session、provider 與 invitation accept 流程應由後端實作完成

---

# 8. API Contract 管理原則

## 7.1 文件位置

- OpenAPI 規格目前由後端維護，前端以 `https://go-funny-backend.onrender.com/openapi.json` 為準
- 前端專案不再維護本地 `openapi draft` 檔案
- `PRD` 保留產品需求與功能範圍，不直接承載完整 API schema

---

## 7.2 協作方式

- 前端以後端提供的遠端 OpenAPI 規格進行評估、型別生成與 client 串接
- 產生型別、client 與 TanStack hooks 時，應以正式遠端規格為輸入來源
- 後端由專案作者自行實作
- 若後端規格變動，應優先同步更新前端資料契約與相關文件描述
- 前端生成結果需可重新產生，不應手動深度耦合於單一版本的 generated code

---

## 7.3 目的

- 讓前端與後端可以平行開發
- 讓後端練習專案仍保有明確 contract 參考
- 後續可透過 `Orval` 重新生成，降低手寫 API client 與型別維護成本
