export const transactionCategories = [
  "Food",
  "Travel",
  "Shopping",
  "Bills",
  "Education",
  "Entertainment",
  "Health",
  "Salary",
  "Investments",
  "Other",
];

export const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

