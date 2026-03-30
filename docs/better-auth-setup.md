# Better Auth 設定草案

此文件說明目前前端採用 `Better Auth` 的方向，以及未來後端需要完成的設定。

## 目前前端已完成

- 已建立 Better Auth client 草稿：`src/lib/auth-client.ts`
- 已建立登入頁：`src/pages/auth-sign-in-page.tsx`
- 已建立註冊頁：`src/pages/auth-sign-up-page.tsx`
- 已建立接受邀請頁：`src/pages/invitation-accept-page.tsx`
- 已加入 Google 註冊 / 登入按鈕 UI

## 目前尚未完成

- 後端 Better Auth server
- Google OAuth provider 設定
- session / user 資料表
- invitation token 接受流程整合

## 前端需要的環境變數

建議提供：

- `VITE_BETTER_AUTH_URL`

例如：

```env
VITE_BETTER_AUTH_URL=http://localhost:3000
```

## 後端建議設定方向

### 1. 建立 Better Auth server

後端需建立 Better Auth instance，並提供 auth endpoint。

### 2. Google provider

後端需設定 Google OAuth：

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

### 3. 使用者資料

需要至少有：

- user
- session
- account / provider linkage

### 4. 與旅程協作整合

登入後接受 invitation token 時，後端應：

- 建立 trip collaborator
- 建立或同步 trip member
- 導回該 trip

## 目前前端呼叫方式

### Google 登入 / 註冊

前端目前使用：

- `authClient.signIn.social({ provider: 'google' })`

### Email 登入 / 註冊

前端目前預留：

- `authClient.signIn.email(...)`
- `authClient.signUp.email(...)`

## 注意事項

- 目前這些畫面與 client 屬於前端骨架
- 若後端 Better Auth 設定方式不同，應以後端實作為準
- 前端之後只需依據後端實際 endpoint 與 callback 行為微調
