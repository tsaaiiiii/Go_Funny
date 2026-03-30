# 邀請連結流程草案

此文件用來說明「邀請好友加入旅程」的建議流程，方便前後端之後對齊實作。

## 目標

- 使用者建立一個旅程
- 建立者在成員管理頁複製邀請連結
- 朋友打開邀請連結
- 朋友加入該旅程，並自動成為成員
- 朋友之後可以共同編輯同一個旅程

## 建議的後端邏輯

### 1. 旅程擁有者與權限

- 每個旅程應有一位建立者（owner）
- 每個旅程可有多位協作者（collaborators）
- 協作者加入後，可讀取並編輯該旅程

### 2. 邀請 token 設計

建議後端建立一張 invitation / invite token 資料表，欄位可包含：

- `id`
- `tripId`
- `token`
- `createdByUserId`
- `expiresAt`
- `maxUses` 或單次使用標記
- `role`，例如 `editor`

建議 API 例如：

- `POST /trips/:tripId/invitations`
- `GET /invitations/:token`
- `POST /invitations/:token/accept`

### 3. 接受邀請流程

建議流程如下：

- 朋友打開邀請連結
- 後端先驗證 token 是否有效
- 若使用者尚未登入，先要求登入
- 登入後接受邀請
- 後端建立 collaborator 關聯
- 如有需要，也同步用使用者名稱建立 trip member 資料

## 前端責任

- 目前前端只先提供「複製邀請連結」的 UI 入口
- 真正可用的邀請連結不應由前端自行亂組安全 token
- 正式流程應為：
  - 前端呼叫後端 API 建立 invitation
  - 後端回傳真正的 invite URL 或 token
  - 前端再把這個連結提供給使用者複製

## 重要結論

### 邀請連結中的 token 應由誰產生？

應該由 **後端產生**，不是前端。

原因：

- token 需要具備安全性與不可預測性
- token 可能需要過期時間、使用次數、權限角色等控管
- 這些都屬於後端權限與安全邏輯，不適合交給前端生成

## 建議的正式行為

### 使用者按下「複製邀請連結」時

前端應該：

- 呼叫 `POST /trips/:tripId/invitations`
- 從後端拿到：
  - `token`
  - 或完整 `inviteUrl`

例如後端可回：

```json
{
  "token": "abc123xyz",
  "inviteUrl": "https://your-app.com/invitations/abc123xyz"
}
```

前端再把 `inviteUrl` 複製給使用者。

### 朋友點擊邀請連結後

流程可為：

- 前端進入邀請頁
- 用 token 呼叫後端查詢邀請資訊
- 顯示「你被邀請加入 XXX 旅程」
- 使用者確認加入
- 前端呼叫 `POST /invitations/:token/accept`
- 後端把使用者加入旅程 collaborator
- 同步建立 member
- 前端導向該旅程

## 目前前端狀態

- `src/pages/members-page.tsx` 目前只有示意用的複製連結 UI
- 那個連結格式目前只是前端草稿展示
- 未來應改成：由後端回傳真正可用的 invitation link
