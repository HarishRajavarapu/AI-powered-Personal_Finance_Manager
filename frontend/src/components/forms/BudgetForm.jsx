import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectInput } from "@/components/ui/select";
import { transactionCategories } from "@/utils/constants";
import { currentMonthInputValue } from "@/utils/date";

const budgetSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, "Month is required."),
  category: z.enum(transactionCategories),
  limit_amount: z.coerce.number().positive("Budget limit must be greater than 0."),
  alert_threshold: z.coerce.number().min(50).max(100),
});

export default function BudgetForm({ initialValues, onCancel, onSubmit }) {
  const isEditing = Boolean(initialValues?.id);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      month: currentMonthInputValue(),
      category: "Food",
      limit_amount: "",
      alert_threshold: 90,
    },
  });

  useEffect(() => {
    reset({
      month: initialValues?.month || currentMonthInputValue(),
      category: initialValues?.category || "Food",
      limit_amount: initialValues?.limit_amount || "",
      alert_threshold: initialValues?.alert_threshold || 90,
    });
  }, [initialValues, reset]);

  async function submit(values) {
    await onSubmit(values);
    if (!isEditing) {
      reset({
        month: currentMonthInputValue(),
        category: "Food",
        limit_amount: "",
        alert_threshold: 90,
      });
    }
  }

  return (
    <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" onSubmit={handleSubmit(submit)}>
      <div className="space-y-2">
        <Label htmlFor="month">Month</Label>
        <Input id="month" type="month" {...register("month")} />
        {errors.month ? <p className="text-sm text-destructive">{errors.month.message}</p> : null}
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
        <Label htmlFor="limit_amount">Limit</Label>
        <Input id="limit_amount" min="0" step="0.01" type="number" {...register("limit_amount")} />
        {errors.limit_amount ? (
          <p className="text-sm text-destructive">{errors.limit_amount.message}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="alert_threshold">Alert</Label>
        <Input id="alert_threshold" min="50" max="100" type="number" {...register("alert_threshold")} />
        {errors.alert_threshold ? (
          <p className="text-sm text-destructive">{errors.alert_threshold.message}</p>
        ) : null}
      </div>
      <div className="flex items-end gap-2 md:col-span-2 xl:col-span-4">
        <Button type="submit" disabled={isSubmitting}>
          <Save className="h-4 w-4" />
          {isEditing ? "Save budget" : "Create budget"}
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

