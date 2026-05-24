import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectInput } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { transactionCategories } from "@/utils/constants";
import { dateInputToApi, todayInputValue, toDateInputValue } from "@/utils/date";

const transactionSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  amount: z.coerce.number().positive("Amount must be greater than 0."),
  category: z.enum(transactionCategories),
  type: z.enum(["income", "expense"]),
  date: z.string().min(1, "Date is required."),
  notes: z.string().max(500, "Notes must be under 500 characters.").optional(),
});

export default function TransactionForm({ initialValues, onCancel, onSubmit }) {
  const isEditing = Boolean(initialValues?.id);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      title: "",
      amount: "",
      category: "Food",
      type: "expense",
      date: todayInputValue(),
      notes: "",
    },
  });

  useEffect(() => {
    reset({
      title: initialValues?.title || "",
      amount: initialValues?.amount || "",
      category: initialValues?.category || "Food",
      type: initialValues?.type || "expense",
      date: toDateInputValue(initialValues?.date),
      notes: initialValues?.notes || "",
    });
  }, [initialValues, reset]);

  async function submit(values) {
    await onSubmit({
      ...values,
      date: dateInputToApi(values.date),
      notes: values.notes || null,
    });

    if (!isEditing) {
      reset({
        title: "",
        amount: "",
        category: "Food",
        type: "expense",
        date: todayInputValue(),
        notes: "",
      });
    }
  }

  return (
    <form className="grid gap-4 lg:grid-cols-2" onSubmit={handleSubmit(submit)}>
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" placeholder="Grocery run" {...register("title")} />
        {errors.title ? <p className="text-sm text-destructive">{errors.title.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input id="amount" min="0" step="0.01" type="number" {...register("amount")} />
        {errors.amount ? <p className="text-sm text-destructive">{errors.amount.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <SelectInput id="category" {...register("category")}>
          {transactionCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </SelectInput>
        {errors.category ? <p className="text-sm text-destructive">{errors.category.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <SelectInput id="type" {...register("type")}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </SelectInput>
        {errors.type ? <p className="text-sm text-destructive">{errors.type.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input id="date" type="date" {...register("date")} />
        {errors.date ? <p className="text-sm text-destructive">{errors.date.message}</p> : null}
      </div>
      <div className="space-y-2 lg:row-span-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" placeholder="Optional details" {...register("notes")} />
        {errors.notes ? <p className="text-sm text-destructive">{errors.notes.message}</p> : null}
      </div>
      <div className="flex items-end gap-2">
        <Button type="submit" disabled={isSubmitting}>
          <Save className="h-4 w-4" />
          {isEditing ? "Save changes" : "Add transaction"}
        </Button>
        {isEditing ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}

