import { currencyFormatter } from "@/utils/constants";

export function exportTransactionsCsv(transactions) {
  const headers = ["Title", "Amount", "Category", "Type", "Date", "Notes"];
  const rows = transactions.map((transaction) => [
    transaction.title,
    transaction.amount,
    transaction.category,
    transaction.type,
    new Date(transaction.date).toLocaleDateString("en-IN"),
    transaction.notes || "",
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "transactions.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export async function exportTransactionsPdf(transactions) {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Financial Transaction Report", 14, 18);
  doc.setFontSize(10);
  doc.text(`Generated on ${new Date().toLocaleString("en-IN")}`, 14, 26);

  autoTable(doc, {
    startY: 34,
    head: [["Title", "Amount", "Category", "Type", "Date"]],
    body: transactions.map((transaction) => [
      transaction.title,
      currencyFormatter.format(transaction.amount),
      transaction.category,
      transaction.type,
      new Date(transaction.date).toLocaleDateString("en-IN"),
    ]),
  });

  doc.save("financial-report.pdf");
}
