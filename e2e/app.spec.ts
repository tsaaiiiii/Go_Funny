import { expect, test, type Page } from '@playwright/test'

import { expenseTrip, mockAppApi, poolTrip } from './fixtures'

function trackPageErrors(page: Page) {
  const pageErrors: string[] = []

  page.on('pageerror', (error) => {
    pageErrors.push(error.message)
  })

  return pageErrors
}

test('未登入進入首頁會導向登入頁', async ({ page }) => {
  const pageErrors = trackPageErrors(page)
  await mockAppApi(page)

  await page.goto('/')
  await page.waitForURL('**/login')

  await expect(page.getByRole('heading', { name: '登入', exact: true })).toBeVisible()
  expect(pageErrors).toEqual([])
})

test('註冊頁會驗證密碼長度並顯示重複 Email 錯誤', async ({ page }) => {
  const pageErrors = trackPageErrors(page)
  await mockAppApi(page)

  await page.goto('/register?invite=invite-expense')

  await page.getByPlaceholder('名稱').fill('新旅伴')
  await page.getByPlaceholder('Email').fill('new@example.com')
  await page.getByPlaceholder('密碼').fill('1234567')
  await page.getByRole('button', { name: '使用 Email 註冊' }).click()

  await expect(page).toHaveURL(/\/register\?invite=invite-expense$/)
  await expect(page.getByText('密碼至少需要 8 碼')).toBeVisible()

  await page.getByPlaceholder('Email').fill('taken@example.com')
  await page.getByPlaceholder('密碼').fill('12345678')
  await page.getByRole('button', { name: '使用 Email 註冊' }).click()

  await expect(page.getByText('此 Email 已註冊，請直接登入')).toBeVisible()
  await expect(page.getByRole('link', { name: '前往登入' })).toHaveAttribute('href', '/login?invite=invite-expense')
  expect(pageErrors).toEqual([])
})

test('接受邀請後走註冊流程會自動加入旅程', async ({ page }) => {
  const pageErrors = trackPageErrors(page)
  await mockAppApi(page)

  await page.goto('/invitations/invite-expense')
  await page.waitForLoadState('networkidle')

  await expect(page.getByText(expenseTrip.title)).toBeVisible()
  await expect(page.getByText('一般記帳').first()).toBeVisible()

  await page.getByRole('button', { name: '前往登入後加入' }).click()
  await page.waitForURL('**/login?invite=invite-expense')

  await page.getByRole('link', { name: '建立帳號' }).click()
  await page.waitForURL('**/register?invite=invite-expense')

  await page.getByPlaceholder('名稱').fill('新加入旅伴')
  await page.getByPlaceholder('Email').fill('joiner@example.com')
  await page.getByPlaceholder('密碼').fill('12345678')
  await page.getByRole('button', { name: '使用 Email 註冊' }).click()

  await page.waitForURL(`**/trip/${expenseTrip.id}`)
  await expect(page.getByText('新增支出')).toBeVisible()
  await expect(page.getByText(expenseTrip.title).first()).toBeVisible()
  expect(pageErrors).toEqual([])
})

test('主要路由可正常 render，不會出現 hooks crash', async ({ page }) => {
  const pageErrors = trackPageErrors(page)
  await mockAppApi(page, { authenticated: true })

  const routes = [
    { path: '/', text: '你的旅程' },
    { path: '/details', text: poolTrip.title },
    { path: '/new-record', text: '新增支出' },
    { path: '/settlement', text: '誰欠誰' },
    { path: `/trip/${expenseTrip.id}`, text: '每日明細' },
    { path: `/trip/${expenseTrip.id}/manage`, text: '旅程功能' },
    { path: `/trip/${expenseTrip.id}/members`, text: '邀請成員' },
    { path: '/trip/new', text: '旅程名稱' },
    { path: `/trip/${expenseTrip.id}/edit`, text: '旅程名稱' },
    { path: `/trip/${expenseTrip.id}/new-expense`, text: '分攤方式' },
    { path: `/trip/${poolTrip.id}/new-contribution`, text: '存入資訊' },
  ]

  for (const route of routes) {
    await page.goto(route.path)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(route.text).first()).toBeVisible()
  }

  await page.goto(`/trip/${expenseTrip.id}/members`)
  await page.getByRole('button', { name: '產生邀請連結' }).click()
  await expect(page.getByText('generated-invite-token')).toBeVisible()

  expect(pageErrors).toEqual([])
})

test('一般記帳結算頁顯示正確空狀態文案', async ({ page }) => {
  const pageErrors = trackPageErrors(page)
  await mockAppApi(page, { authenticated: true })

  await page.goto(`/trip/${expenseTrip.id}/settlement`)
  await page.waitForLoadState('networkidle')

  await expect(page.getByText('目前沒有需要額外轉帳的對象。')).toBeVisible()
  await expect(page.getByText('目前共同池充足，暫時不需要額外轉帳。')).toHaveCount(0)
  expect(pageErrors).toEqual([])
})

test('公積金結算頁顯示共同池不足提示', async ({ page }) => {
  const pageErrors = trackPageErrors(page)
  await mockAppApi(page, { authenticated: true })

  await page.goto(`/trip/${poolTrip.id}/settlement`)
  await page.waitForLoadState('networkidle')

  await expect(page.getByText('共同池尚差')).toBeVisible()
  await expect(page.getByText('需要先補足共同池再完成結算。')).toBeVisible()
  expect(pageErrors).toEqual([])
})
