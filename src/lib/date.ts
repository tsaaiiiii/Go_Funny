export const getTodayInputValue = () => {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

export const toDateInputValue = (value?: string | null) => {
  if (!value) {
    return getTodayInputValue()
  }

  const dateOnlyValue = value.slice(0, 10)

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnlyValue)) {
    const dateOnly = new Date(`${dateOnlyValue}T00:00:00`)
    if (!Number.isNaN(dateOnly.getTime())) {
      return dateOnlyValue
    }
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return getTodayInputValue()
  }

  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}
