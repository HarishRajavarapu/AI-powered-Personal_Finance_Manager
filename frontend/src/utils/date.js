export function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export function currentMonthInputValue() {
  return new Date().toISOString().slice(0, 7);
}

export function toDateInputValue(value) {
  if (!value) return todayInputValue();
  return new Date(value).toISOString().slice(0, 10);
}

export function dateInputToApi(value) {
  return new Date(`${value}T00:00:00.000Z`).toISOString();
}

