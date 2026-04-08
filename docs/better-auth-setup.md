# Better Auth 設定草案

此文件說明目前前端採用 `Better Auth` 的方向，以及未來後端需要完成的設定。

## 目前前端已完成

- 已建立 Better Auth client 草稿：`src/lib/auth-client.ts`
- 已建立登入頁：`src/pages/auth-sign-in-page.tsx`
- 已建立註冊頁：`src/pages/auth-sign-up-page.tsx`
- 已建立接受邀請頁：`src/pages/invitation-accept-page.tsx`

## 目前尚未完成

- 後端 Better Auth server
- session / user 資料表
- invitation token 接受流程整合

## 前端需要的環境變數

建議提供：

- `VITE_PROXY_TARGET`
- `VITE_API_BASE_URL`
- `VITE_BETTER_AUTH_URL`

例如：

```env
VITE_PROXY_TARGET=https://go-funny-backend.onrender.com
VITE_API_BASE_URL=
VITE_BETTER_AUTH_URL=
```

如果 `VITE_API_BASE_URL` 與 `VITE_BETTER_AUTH_URL` 留空，前端會走同源 `/api/*`：

- Better Auth: `/api/auth/*`
- 業務 API: `/api/trips`、`/api/members`、`/api/expenses`、`/api/contributions`、`/api/settlement`、`/api/invitations`

開發環境會由 Vite proxy 轉送：

- `/api/auth/*` 原樣代理到後端 `/api/auth/*`
- `/api/*` 業務 API rewrite 成後端原本的 `/*`

正式環境若已在前端網域設定反向代理，建議 `.env.production` 也維持同源：

```env
VITE_API_BASE_URL=
VITE_BETTER_AUTH_URL=
```

只有在你真的需要直接跨網域打後端時，才設定這兩個值。一般情況建議留空並改走同源 `/api/*`，能降低跨站 cookie 在 Safari 等瀏覽器被擋掉的風險。

如果暫時需要直接連後端，可額外建立直連版設定：

```env
VITE_API_BASE_URL=https://go-funny-backend.onrender.com
VITE_BETTER_AUTH_URL=https://go-funny-backend.onrender.com
```

## 後端建議設定方向

### 1. 建立 Better Auth server

後端需建立 Better Auth instance，並提供 `/api/auth/*` endpoint。

### 2. 使用者資料

需要至少有：

- user
- session
- account / provider linkage

### 3. 與旅程協作整合

登入後接受 invitation token 時，後端應：

- 建立 trip collaborator
- 建立或同步 trip member
- 導回該 trip

## 目前前端呼叫方式

目前前端預期使用以下路徑：

- `/api/auth/get-session`
- `/api/auth/sign-in/email`
- `/api/auth/sign-up/email`
- `/api/auth/sign-out`
- `/api/auth/callback/google`

### Email 登入 / 註冊

前端目前預留：

- `authClient.signIn.email(...)`
- `authClient.signUp.email(...)`

## 注意事項

- 目前這些畫面與 client 屬於前端骨架
- 若後端 Better Auth 設定方式不同，應以後端實作為準
- 前端之後只需依據後端實際 endpoint 與 callback 行為微調
