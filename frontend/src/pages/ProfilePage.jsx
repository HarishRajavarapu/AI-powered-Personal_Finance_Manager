import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Save, UserRound } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { updateProfile } from "@/services/finance-service";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Enter a valid email address."),
});

export default function ProfilePage() {
  const { setUser, user } = useAuth();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  useEffect(() => {
    reset({
      name: user?.name || "",
      email: user?.email || "",
    });
  }, [reset, user]);

  async function onSubmit(values) {
    try {
      const updated = await updateProfile(values);
      setUser(updated);
      toast.success("Profile updated.");
    } catch (error) {
      toast.error(error.message || "Unable to update profile.");
    }
  }

  return (
    <section className="page-shell">
      <div>
        <Badge variant="secondary">Secure account</Badge>
        <h1 className="mt-3 text-2xl font-semibold tracking-normal sm:text-3xl">Profile</h1>
        <p className="mt-2 text-sm text-muted-foreground">Account preferences and personal details.</p>
      </div>
      <Card className="glass-card max-w-2xl">
        <CardHeader>
          <CardTitle>Personal information</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="name" className="pl-9" {...register("name")} />
              </div>
              {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" className="pl-9" type="email" {...register("email")} />
              </div>
              {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={isSubmitting}>
                <Save className="h-4 w-4" />
                Save profile
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

